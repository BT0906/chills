import { createClient } from "@/lib/supabase/client";
import { formatUserName, getUserProfile } from "@/lib/utils";
import { useEffect, useState } from "react";

export const useCurrentUserName = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
      }
      if (!user) {
        setName(null);
        return;
      }
      const profile = await getUserProfile(user.id);

      setName(formatUserName(profile?.first_name, profile?.last_name) ?? null);
    };
    fetchUserName();
  }, []);

  return name || "?";
};
