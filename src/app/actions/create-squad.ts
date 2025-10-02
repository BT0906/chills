"use server";

import { createClient } from "@/lib/supabase/server";
import type { CreateSquadInput } from "@/types/squad";

export async function createSquad(input: CreateSquadInput) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("create_squad", {
      p_name: input.name,
      p_description: input.description,
      p_course: input.course,
      p_creator_id: input.creator_id,
      p_user_ids: input.user_ids,
    });

    if (error) {
      console.error("[v0] Error creating squad:", error);
      return { success: false, error: error.message };
    }

    return { success: true, squad_id: data };
  } catch (error) {
    console.error("[v0] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create squad",
    };
  }
}
