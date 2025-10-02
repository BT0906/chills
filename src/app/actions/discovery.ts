"use server"

import { createClient } from "@/lib/supabase/server"

export async function findClassmates(userId: string) {
  try {
    const supabase = await createClient()
    const { data: classmates, error: classmatesError } = await supabase.rpc("get_users_sharing_courses", {
      p_user_id: userId,
    })

    if (classmatesError) {
      console.error("[v0] Error calling RPC get_users_sharing_courses:", classmatesError)
      return { success: false as const, error: "Failed to fetch classmates" as const }
    }

    return { success: true as const, data: classmates }
  } catch (error) {
    console.error("[v0] Unexpected error in findClassmates:", error)
    return { success: false as const, error: "An unexpected error occurred" as const }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("[v0] Error getting current user:", userError)
      return { success: false as const, error: "Failed to get current user" as const }
    }

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching user profile:", profileError)
      return { success: false as const, error: "Failed to fetch user profile" as const }
    }

    // Fetch user's enrolments
    const { data: enrolments, error: enrolmentsError } = await supabase
      .from("enrolment")
      .select("*")
      .eq("user_id", user.id)

    if (enrolmentsError) {
      console.error("[v0] Error fetching user enrolments:", enrolmentsError)
      return { success: false as const, error: "Failed to fetch user enrolments" as const }
    }

    return {
      success: true as const,
      data: {
        userId: user.id,
        profile,
        enrolments: enrolments || [],
      },
    }
  } catch (error) {
    console.error("[v0] Unexpected error in getCurrentUser:", error)
    return { success: false as const, error: "An unexpected error occurred" as const }
  }
}
