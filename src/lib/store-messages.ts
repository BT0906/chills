import type { ChatMessage } from "@/hooks/use-realtime-chat";
import { createClient } from "@/lib/supabase/client";
import { TablesInsert } from "@/types/database.types";

export const storeMessages = async (messages: ChatMessage[]) => {
  const supabase = createClient();
  const processedMessages: TablesInsert<"message">[] = messages.map((msg) => ({
    id: msg.id,
    body: msg.content,
    sender_id: msg.user.id,
    squad_id: msg.squadId,
  }));
  const { error } = await supabase.from("message").upsert(processedMessages);
  if (error) {
    console.error("Error storing messages:", error);
  }
};
