"use server"

import { createClient } from "@/lib/supabase/server"

export interface UserMatch {
  id: string
  first_name: string
  last_name: string
  zid: string
  degree: string
  bio: string | null
  profile_url: string | null
  shared_courses: string[]
  shared_tutorials: string[]
  total_shared_classes: number
}

export async function findClassmates(userId: string) {
  try {
    const supabase = await createClient()

    // Get current user's enrolments
    const { data: userEnrolments, error: userError } = await supabase
      .from("enrolment")
      .select("course, class, section")
      .eq("user_id", userId)

    if (userError || !userEnrolments) {
      console.error("Error fetching user enrolments:", userError)
      return { success: false, error: "Failed to fetch your enrolments" }
    }

    // Get all other users' enrolments
    const { data: allEnrolments, error: allError } = await supabase
      .from("enrolment_with_profile")
      .select(
        `
        user_id,
        course,
        class,
        section,
        id,
        first_name,
        last_name,
        zid,
        degree,
        bio,
        profile_url
      `,
      )
      .neq("user_id", userId)

    if (allError || !allEnrolments) {
      console.error("Error fetching all enrolments:", allError)
      return { success: false, error: "Failed to fetch classmates" }
    }

    // Build a map of user matches
    const matchesMap = new Map<string, UserMatch>()

    // Get user's courses and tutorials for comparison
    const userCourses = new Set(userEnrolments.map((e) => e.course))
    const userTutorials = new Set(
      userEnrolments.filter((e) => e.class === "tut").map((e) => `${e.course}-${e.section}`),
    )

    // console.log("User Courses:", userCourses)
    // console.log("User Tutorials:", userTutorials)
    // console.log("All Enrolments:", allEnrolments)

    for (const enrolment of allEnrolments) {
      // Profile fields are flat on the row now (no nested `profile`)
      const {
        id: profileId,
        first_name,
        last_name,
        zid,
        degree,
        bio,
        profile_url,
        user_id: otherUserId,
        course,
        class: klass,
        section,
      } = enrolment;

      // Share only courses the current user is enrolled in
      if (!otherUserId || !course) continue;
      if (!userCourses.has(course)) continue;

      // Initialize or get existing match
      if (!matchesMap.has(otherUserId)) {
        matchesMap.set(otherUserId, {
          id: profileId,
          first_name,
          last_name,
          zid,
          degree,
          bio,
          profile_url,
          shared_courses: [] as string[],
          shared_tutorials: [] as string[],
          total_shared_classes: 0,
        });
      }

      const match = matchesMap.get(otherUserId)!;

      // Add shared course if not already added
      if (!match.shared_courses.includes(course)) {
        match.shared_courses.push(course);
      }

      // Check for shared tutorials: class === "tut" and matching section
      if (klass === "tut" && section) {
        const tutorialKey = `${course}-${section}`;
        if (userTutorials.has(tutorialKey) && !match.shared_tutorials.includes(tutorialKey)) {
          match.shared_tutorials.push(tutorialKey);
        }
      }

      match.total_shared_classes++;
    }

    // Convert map to array and sort by relevance
    const matches = Array.from(matchesMap.values()).sort((a, b) => {
      // Prioritize users with shared tutorials
      if (a.shared_tutorials.length !== b.shared_tutorials.length) {
        return b.shared_tutorials.length - a.shared_tutorials.length;
      }
      // Then by number of shared courses
      if (a.shared_courses.length !== b.shared_courses.length) {
        return b.shared_courses.length - a.shared_courses.length;
      }
      // Finally by total shared classes
      return b.total_shared_classes - a.total_shared_classes;
    });

    return { success: true, data: matches };
  } catch (error) {
    console.error("[v0] Error finding classmates:", error)
    return { success: false, error: "Failed to find classmates" }
  }
}

export async function getUserCourses(userId: string | undefined) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("enrolment")
      .select("course, class, section, start_time, end_time, room_id")
      .eq("user_id", userId)
      .order("course", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching user courses:", error)
      return { success: false, error: "Failed to fetch courses" }
    }

    // Group by course
    const courseMap = new Map<string, any[]>()

    for (const enrolment of data) {
      if (!courseMap.has(enrolment.course)) {
        courseMap.set(enrolment.course, [])
      }
      courseMap.get(enrolment.course)!.push(enrolment)
    }

    const courses = Array.from(courseMap.entries()).map(([course, classes]) => ({
      course,
      classes,
      classCount: classes.length,
    }))

    return { success: true, data: courses }
  } catch (error) {
    console.error("[v0] Error fetching user courses:", error)
    return { success: false, error: "Failed to fetch courses" }
  }
}
