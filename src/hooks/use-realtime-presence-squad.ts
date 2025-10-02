"use client";

import { useCurrentUserImage } from "@/hooks/use-current-user-image";
import { useCurrentUserName } from "@/hooks/use-current-user-name";
import { createClient } from "@/lib/supabase/client";
import { getSquadChannelName } from "@/lib/utils";
import { useEffect, useState } from "react";

const supabase = createClient();

export type RealtimeUser = {
  id: string;
  name: string;
  image: string;
};

export const useRealtimePresenceSquad = (squadId: number) => {
  const currentUserImage = useCurrentUserImage();
  const currentUserName = useCurrentUserName();

  const [users, setUsers] = useState<Record<string, RealtimeUser>>({});

  useEffect(() => {
    const room = supabase.channel(getSquadChannelName(squadId));

    room
      .on("presence", { event: "sync" }, () => {
        const newState = room.presenceState<{ image: string; name: string }>();

        const newUsers = Object.fromEntries(
          Object.entries(newState).map(([key, values]) => [
            key,
            { name: values[0].name, image: values[0].image },
          ])
        ) as Record<string, RealtimeUser>;
        setUsers(newUsers);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }

        await room.track({
          name: currentUserName,
          image: currentUserImage,
        });
      });

    return () => {
      room.unsubscribe();
    };
  }, [squadId, currentUserName, currentUserImage]);

  const trackPresence = (userId: string, username: string) => {
    const channel = supabase.channel(getSquadChannelName(squadId));

    channel.track({
      user_id: userId,
      username: username,
    });
  };

  return { users, trackPresence };
};
