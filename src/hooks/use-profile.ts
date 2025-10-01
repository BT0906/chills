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
        .eq("user_id", userId)
        .single();
      console.log("Fetched profile data:", data, error);
      if (error) throw error;
      return data;
    }
  );

  if (!userId) {
    return { profile: null, isLoading: false, error: null, refresh: mutate };
  }

  return { profile: data, isLoading, error, refresh: mutate };
}
