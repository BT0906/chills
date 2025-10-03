import { createClient } from "@/lib/supabase/client";
import { Enums } from "@/types/database.types";
import useSWR from "swr";

interface SquadMember {
  user_id: string;
  status: Enums<"member_type">;
  first_name: string;
  last_name: string;
  profile_url: string | null;
}

export const useSquadMemberProfiles = (squadId: number | null | undefined) => {
  const supabase = createClient();

  const { data, error, isLoading, mutate } = useSWR(
    squadId ? ["squad-members", squadId] : null,
    async ([, squadId]): Promise<SquadMember[]> => {
      const { data, error } = await supabase
        .from("member")
        .select(
          `
          user_id,
          status,
          profile (
            user_id,
            first_name,
            last_name,
            profile_url
          )
        `
        )
        .eq("squad_id", squadId)
        .eq("status", "active"); // Only get active members

      if (error) throw error;

      // Flatten the data structure
      return (
        data?.map((member) => ({
          user_id: member.user_id,
          status: member.status,
          first_name: member.profile?.first_name || "",
          last_name: member.profile?.last_name || "",
          profile_url: member.profile?.profile_url,
        })) || []
      );
    }
  );

  if (!squadId) {
    return { members: null, isLoading: false, error: null, refresh: mutate };
  }

  return { members: data, isLoading, error, refresh: mutate };
};
