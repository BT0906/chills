"use client";

<<<<<<< HEAD
import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";

interface UseRealtimeChatProps {
  userId: string;
  username: string;
  squadId: number;
=======
import { storeMessages } from "@/lib/store-messages";
import { createClient } from "@/lib/supabase/client";
import { getSquadChannelName } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface UseRealtimeChatProps {
  profileId: string;
  username: string;
  squadId: number;
  profileUrl?: string;
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
}

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
<<<<<<< HEAD
=======
    image: string;
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
  };
  squadId: number;
  createdAt: string;
}

<<<<<<< HEAD
const EVENT_MESSAGE_TYPE = "message";

export function useRealtimeChat({
  userId,
  username,
  squadId,
}: UseRealtimeChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
=======
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
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    const newChannel = supabase.channel(`chat-squad-${squadId}`);

    newChannel
      .on("broadcast", { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage]);
=======
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
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
<<<<<<< HEAD
=======

          await newChannel.track({
            profileId: profileId,
            name: username,
            image: "",
          });
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
        }
      });

    setChannel(newChannel);

    return () => {
<<<<<<< HEAD
      supabase.removeChannel(newChannel);
    };
  }, [squadId, username, supabase]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) return;
=======
      newChannel.unsubscribe();
    };
  }, [squadId, username, profileId, supabase, profileUrl]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) {
        console.log("Cannot send message - not connected:", {
          channel: !!channel,
          isConnected,
        });
        return;
      }
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
<<<<<<< HEAD
          id: userId,
          name: username,
=======
          id: profileId,
          name: username,
          image: profileUrl || "",
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
        },
        squadId: squadId,
        createdAt: new Date().toISOString(),
      };

<<<<<<< HEAD
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
=======
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
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
}
