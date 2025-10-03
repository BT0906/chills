"use client";
import { RealtimeChat } from "@/components/realtime-chat";
import { useProfile } from "@/hooks/use-profile";
import { ChatMessage } from "@/hooks/use-realtime-chat";
import { useUser } from "@/hooks/use-user";
import { storeMessages } from "@/lib/store-messages";
import { formatUserName } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useUser();
  const { profile } = useProfile(user?.id);

  if (!user || !profile) {
    return <div>Please log in to access the chat.</div>;
  }

  const handleMessage = async (messages: ChatMessage[]) => {
    await storeMessages(messages);
  };

  return (
    <>
      <RealtimeChat
        squadId={Number(id)} // TODO: Replace with actual squad ID
        userId={user.id}
        username={formatUserName(profile.first_name, profile.last_name)}
        onMessage={handleMessage}
      />
    </>
  );
}
