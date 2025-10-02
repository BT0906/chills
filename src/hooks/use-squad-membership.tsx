import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";

export const useSquadMembership = (
  squadId: number | null | undefined,
  userId: string | null | undefined
) => {
  const supabase = createClient();

  const { data, error, isLoading, mutate } = useSWR(
    squadId && userId ? ["squad-membership", squadId, userId] : null,
    async ([, squadId, userId]) => {
      const { data, error } = await supabase
        .from("member")
        .select("status")
        .eq("squad_id", squadId)
        .eq("user_id", userId)
        .eq("status", "active") // Only active members
        .single();

      if (error) {
        // If no record found, user is not a member
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data;
    }
  );

  const isMember = !!data;
  const membershipStatus = data?.status || null;

  if (!squadId || !userId) {
    return {
      isMember: false,
      membershipStatus: null,
      isLoading: false,
      error: null,
      refresh: mutate,
    };
  }

  return {
    isMember,
    membershipStatus,
    isLoading,
    error,
    refresh: mutate,
  };
};
