"use client";

import { storeMessages } from "@/lib/store-messages";
import { createClient } from "@/lib/supabase/client";
import { getSquadChannelName } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface UseRealtimeChatProps {
  profileId: string;
  username: string;
  squadId: number;
  profileUrl?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  squadId: number;
  createdAt: string;
}

export type RealtimeUser = {
  id: string;
  profileId: string;
  name: string;
  image: string;
};

const EVENT_MESSAGE_TYPE = "message";

export function useRealtimeChat({
  profileId,
  username,
  squadId,
  profileUrl,
}: UseRealtimeChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, RealtimeUser>>(
    {}
  );
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newChannel = supabase.channel(getSquadChannelName(squadId));

    newChannel
      .on("broadcast", { event: EVENT_MESSAGE_TYPE }, (payload) => {
        const incomingMessage = payload.payload as ChatMessage;
        console.log("Received message:", incomingMessage);
        setMessages((current) => [...current, incomingMessage]);
      })
      .on("presence", { event: "sync" }, () => {
        const presenceState = newChannel.presenceState<{
          name: string;
          profileId: string;
          image: string;
        }>();

        const users = Object.fromEntries(
          Object.entries(presenceState).map(([key, values]) => [
            key,
            {
              id: key,
              profileId: values[0]?.profileId,
              name: values[0]?.name || "Unknown",
              image: values[0]?.image || "",
            },
          ])
        );
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);

          await newChannel.track({
            profileId: profileId,
            name: username,
            image: "",
          });
        }
      });

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [squadId, username, profileId, supabase, profileUrl]);

  const sendMessage = useCallback(
    async (content: string, isMember: boolean = true) => {
      if (!channel || !isConnected) {
        console.log("Cannot send message - not connected:", {
          channel: !!channel,
          isConnected,
        });
        return;
      }

      if (!isMember) {
        console.log("Cannot send message - not a squad member");
        return;
      }

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          id: profileId,
          name: username,
          image: profileUrl || "",
        },
        squadId: squadId,
        createdAt: new Date().toISOString(),
      };

      try {
        // Store our own message immediately in the database
        await storeMessages([message]);

        // Update local state immediately for the sender
        setMessages((current) => [...current, message]);

        // Broadcast to other users
        await channel.send({
          type: "broadcast",
          event: EVENT_MESSAGE_TYPE,
          payload: message,
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [channel, isConnected, profileId, username, profileUrl, squadId]
  );

  return {
    messages,
    sendMessage,
    isConnected,
    onlineUsers: Object.values(onlineUsers),
  };
}
