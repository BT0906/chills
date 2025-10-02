import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";

export const useSquad = (squadId: number | null | undefined) => {
  const supabase = createClient();
  const { data, error, isLoading, mutate } = useSWR(
    squadId ? ["squad", squadId] : null,
    async ([, squadId]) => {
      const { data, error } = await supabase
        .from("squad")
        .select("*")
        .eq("id", squadId)
        .single();
      if (error) throw error;
      return data;
    }
  );

  if (!squadId) {
    return { squad: null, isLoading: false, error: null, refresh: mutate };
  }

  return { squad: data, isLoading, error, refresh: mutate };
};
