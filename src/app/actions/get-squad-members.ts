"use server";

import { createClient } from "@/lib/supabase/server";
import type { Member } from '@/types/squad'

export async function getSquadMembers(squadId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_squad_members", {
    p_squad_id: squadId,
  });

  if (error) {
    console.error("Error fetching members:", error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    members: (data ?? []).map((m, index) => ({
      id: index,
      squad_id: squadId,
      user_id: m.user_id,
      status: m.status,
      joined_at: m.joined_at,
      name: `${m.first_name ?? ''} ${m.last_name ?? ''}`, // fallback if still missing
      avatar_url: m.avatar_url ?? '/placeholder.svg'
    })) as Member[],
  };
}

