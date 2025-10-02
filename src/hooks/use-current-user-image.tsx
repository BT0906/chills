import { createClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/utils";
import { useEffect, useState } from "react";

export const useCurrentUserImage = () => {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserImage = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
      }
      if (!user) {
        setImage(null);
        return;
      }
      const profile = await getUserProfile(user.id);

      setImage(profile?.profile_url ?? null);
    };
    fetchUserImage();
  }, []);

  return image;
};
