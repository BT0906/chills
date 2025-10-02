"use client";

import { AvatarStack } from "@/components/avatar-stack";
import { useRealtimePresenceSquad } from "@/hooks/use-realtime-presence-squad";
import { useMemo } from "react";

export const RealtimeAvatarStack = ({ squadId }: { squadId: number }) => {
  const { users: usersMap } = useRealtimePresenceSquad(squadId);
  const avatars = useMemo(() => {
    return Object.values(usersMap).map((user) => ({
      name: user.name,
      image: user.image,
    }));
  }, [usersMap]);

  return <AvatarStack avatars={avatars} />;
};
