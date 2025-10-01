"use server";

import { createClient } from "@/lib/supabase/server";

export type Squad = {
  id: number;
  name: string;
  description: string | null;
  course: string;
  creator_id: string;
  visibility: string;
  is_deleted: boolean;
};

export async function findInvites(userId: string) {
  try {
    const supabase = await createClient();

    // Call the RPC function
    const { data, error } = await supabase.rpc("get_pending_squads_for_user",
      { p_user_id: userId }
    );

    if (error) {
      console.error("[findInvites] RPC error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, squads: data ?? [] };
  } catch (err) {
    console.error("[findInvites] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch invites",
    };
  }
}
