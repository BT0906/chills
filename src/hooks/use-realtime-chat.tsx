"use client";

import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";

interface UseRealtimeChatProps {
  userId: string;
  username: string;
  squadId: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
  };
  squadId: number;
  createdAt: string;
}

const EVENT_MESSAGE_TYPE = "message";

export function useRealtimeChat({
  userId,
  username,
  squadId,
}: UseRealtimeChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newChannel = supabase.channel(squadId.toString());

    newChannel
      .on("broadcast", { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage]);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        }
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [squadId, username, supabase]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) return;

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          id: userId,
          name: username,
        },
        squadId: squadId,
        createdAt: new Date().toISOString(),
      };

      // Update local state immediately for the sender
      setMessages((current) => [...current, message]);

      await channel.send({
        type: "broadcast",
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      });
    },
    [channel, isConnected, username, userId, squadId]
  );

  return { messages, sendMessage, isConnected };
}
