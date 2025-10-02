import { createClient } from "@/lib/supabase/client";
import { formatUserName } from "@/lib/utils";
import useSWR from "swr";
import { ChatMessage } from "./use-realtime-chat";

export const useMessagesQuery = (squadId: number | null | undefined) => {
  const supabase = createClient();
  const { data, error, isLoading, mutate } = useSWR(
    squadId ? ["messages", squadId] : null,
    async ([, squadId]) => {
      const { data, error } = await supabase
        .from("message")
        .select(
          `
          *,
          profile (
            user_id,
            first_name,
            last_name,
            profile_url
          )
        `
        )
        .eq("squad_id", squadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    }
  );

  if (!data || !squadId) {
    return { messages: null, isLoading, error, refresh: mutate };
  }

  const chatMessages: ChatMessage[] = data.map((message) => {
    return {
      id: message.id,
      content: message.body,
      user: {
        id: message.sender_id,
        name: formatUserName(
          message?.profile?.first_name,
          message.profile?.last_name
        ),
        image: message?.profile?.profile_url || "",
      },
      squadId: message.squad_id,
      createdAt: message.created_at,
    };
  });

  return { messages: chatMessages, isLoading, error, refresh: mutate };
};
