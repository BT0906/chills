"use client";

import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";

export function useProfile(userId: string | null | undefined) {
  const supabase = createClient();
  const { data, error, isLoading, mutate } = useSWR(
    userId ? ["profile", userId] : null,
    async ([, userId]) => {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
<<<<<<< HEAD
        .eq("id", userId)
        .single();
=======
        .eq("user_id", userId)
        .single();
      console.log("Fetched profile data:", data, error);
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
      if (error) throw error;
      return data;
    }
  );

  if (!userId) {
    return { profile: null, isLoading: false, error: null, refresh: mutate };
  }

  return { profile: data, isLoading, error, refresh: mutate };
}
