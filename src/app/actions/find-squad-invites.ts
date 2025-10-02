"use server";

import { createClient } from "@/lib/supabase/server";
import { getSquadMembers } from "@/app/actions/get-squad-members";
import type { Squad } from "@/types/squad";

export async function findInvites(userId: string) {
  try {
    const supabase = await createClient();

    // Fetch pending squads for the user
    const { data: squadsData, error } = await supabase.rpc(
      "get_pending_squads_for_user",
      { p_user_id: userId }
    );

    if (error) throw error;
    if (!squadsData) return { success: true, squads: [] };

    const squadsWithMembers: Squad[] = [];

    for (const squad of squadsData) {
      // Fetch members using getSquadMembers
      const membersResult = await getSquadMembers(squad.id);

      squadsWithMembers.push({
        ...squad,
        members: membersResult.success ? membersResult.members : [],
      });
    }

    return { success: true, squads: squadsWithMembers };
  } catch (err: any) {
    console.error("[findInvites] Unexpected error:", err);
    return { success: false, error: err.message };
  }
}
