"use server"

import { createClient } from "@/lib/supabase/server"

type ClassType = "lec" | "tut" | "lab" | string

export type Person = {
  zid: string
  first_name: string
  last_name: string
  profile_url: string
  degree: string | null
  gender: "male" | "female" | "other" | "unspecified" | string | null
  age: number | null
  bio: string | null
  enrolments: Array<{
    course: string
    class_type: ClassType
    section: string | null
    start_time: string // ISO or "HH:MM"
    end_time: string // ISO or "HH:MM"
    room_id: string | null
  }>
  commonCourses: string[]
  sameTutorial: boolean
  timeOverlap: boolean
}

export async function findClassmates(userId: string) {
  try {
    const supabase = await createClient()

    // 1) Current user's enrolments (used for overlap + shared checks)
    const { data: userEnrolments, error: userError } = await supabase
      .from("enrolment")
      .select("course, class, section, start_time, end_time, room_id")
      .eq("user_id", userId)

    if (userError || !userEnrolments) {
      console.error("Error fetching user enrolments:", userError)
      return { success: false, error: "Failed to fetch your enrolments" as const }
    }

    // 2) All other users' enrolments from your view that flattens profile + class rows
    const { data: allEnrolments, error: allError } = await supabase
      .from("enrolment_with_profile")
      .select("*")
      .neq("user_id", userId)

    if (allError || !allEnrolments) {
      console.error("Error fetching all enrolments:", allError)
      return { success: false, error: "Failed to fetch classmates" as const }
    }

    // --- helpers ------------------------------------------------------------

    const dicebear = (seed: string) =>
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || "Student")}`

    const toWeekday = (iso: string | null | undefined) => {
      if (!iso) return null
      const d = new Date(iso)
      // 0=Sun..6=Sat
      return isNaN(d.getTime()) ? null : d.getUTCDay()
    }

    const minutesOfDayUTC = (iso: string) => {
      const d = new Date(iso)
      if (isNaN(d.getTime())) return null
      return d.getUTCHours() * 60 + d.getUTCMinutes()
    }

    const rangesOverlap = (aStartMin: number, aEndMin: number, bStartMin: number, bEndMin: number) =>
      Math.max(aStartMin, bStartMin) < Math.min(aEndMin, bEndMin)

    // timeOverlap rule:
    // same weekday (by start_time weekday), and time-of-day windows intersect.
    const computeTimeOverlap = (mine: typeof userEnrolments, theirs: typeof userEnrolments) => {
      for (const m of mine) {
        const mDay = toWeekday(m.start_time as unknown as string)
        const mS = minutesOfDayUTC(m.start_time as unknown as string)
        const mE = minutesOfDayUTC(m.end_time as unknown as string)
        if (mDay == null || mS == null || mE == null) continue

        for (const t of theirs) {
          const tDay = toWeekday(t.start_time as unknown as string)
          const tS = minutesOfDayUTC(t.start_time as unknown as string)
          const tE = minutesOfDayUTC(t.end_time as unknown as string)
          if (tDay == null || tS == null || tE == null) continue

          if (mDay !== tDay) continue
          if (rangesOverlap(mS, mE, tS, tE)) return true
        }
      }
      return false
    }

    const normalizeGender = (g: string | null): Person["gender"] => {
      if (!g) return null
      const s = g.toLowerCase()
      if (["male", "female", "other", "unspecified"].includes(s)) return s as any
      return s // keep original if custom
    }

    // --- precompute sets for shared checks ---------------------------------

    const userCourses = new Set(userEnrolments.map((e) => e.course))
    const userTuts = new Set(
      userEnrolments.filter((e) => e.class === "tut" && e.section).map((e) => `${e.course}-${e.section}`),
    )

    // --- aggregate rows per other user -------------------------------------

    type Agg = {
      zid: string
      first_name: string
      last_name: string
      degree: string | null
      gender: string | null
      age: number | null
      bio: string | null
      profile_url: string | null
      enrolments: Person["enrolments"]
      courses: Set<string>
      tutorials: Set<string> // course-section keys
      userId: string
    }

    const byUser = new Map<string, Agg>() // key = other user_id

    for (const row of allEnrolments as any[]) {
      const otherId = row.user_id as string | undefined
      if (!otherId) continue

      if (!byUser.has(otherId)) {
        byUser.set(otherId, {
          zid: row.zid ?? "",
          first_name: row.first_name ?? "",
          last_name: row.last_name ?? "",
          degree: row.degree ?? null,
          gender: row.gender ?? null,
          age: row.age ?? null,
          bio: row.bio ?? null,
          profile_url: row.profile_url ?? null,
          enrolments: [],
          courses: new Set<string>(),
          tutorials: new Set<string>(),
          userId: otherId,
        })
      }

      const agg = byUser.get(otherId)!
      // push this class instance as an enrolment
      if (row.course) {
        agg.enrolments.push({
          course: row.course,
          class_type: row.class as ClassType,
          section: row.section ?? null,
          start_time: row.start_time ?? null,
          end_time: row.end_time ?? null,
          room_id: row.room_id ?? null,
        })

        agg.courses.add(row.course)
        if (row.class === "tut" && row.section) {
          agg.tutorials.add(`${row.course}-${row.section}`)
        }
      }
    }

    // --- shape into Person objects -----------------------------------------

    const people: Person[] = []
    for (const [, agg] of byUser) {
      // common courses = intersection of sets
      const commonCourses = Array.from(agg.courses).filter((c) => userCourses.has(c))

      // same tutorial = any tutorial key present in both
      const sameTutorial = Array.from(agg.tutorials).some((key) => userTuts.has(key)) || false

      // timeOverlap vs current user's enrolments
      const timeOverlap = computeTimeOverlap(
        userEnrolments,
        // reuse the enrolments we just built (shape compatible for overlap function)
        agg.enrolments.map((e) => ({
          course: e.course,
          class: e.class_type,
          section: e.section,
          start_time: e.start_time,
          end_time: e.end_time,
          room_id: e.room_id,
          user_id: agg.userId,
        })) as any,
      )

      const profile_url = agg.profile_url || dicebear(agg.first_name || agg.last_name || agg.zid || "Student")

      people.push({
        zid: agg.zid,
        first_name: agg.first_name,
        last_name: agg.last_name,
        profile_url,
        degree: agg.degree,
        gender: normalizeGender(agg.gender),
        age: agg.age,
        bio: agg.bio,
        enrolments: agg.enrolments,
        commonCourses,
        sameTutorial,
        timeOverlap,
      })
    }

    // Optional: sort by strength of match (sameTut -> commonCourses count -> has overlap)
    people.sort((a, b) => {
      if (a.sameTutorial !== b.sameTutorial) return Number(b.sameTutorial) - Number(a.sameTutorial)
      if (a.commonCourses.length !== b.commonCourses.length) return b.commonCourses.length - a.commonCourses.length
      if (a.timeOverlap !== b.timeOverlap) return Number(b.timeOverlap) - Number(a.timeOverlap)
      return a.last_name.localeCompare(b.last_name)
    })

    return { success: true as const, data: people }
  } catch (error) {
    console.error("[v0] Error finding classmates:", error)
    return { success: false as const, error: "Failed to find classmates" }
  }
}
