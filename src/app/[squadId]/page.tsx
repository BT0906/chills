"use client";
import { RealtimeAvatarStack } from "@/components/realtime-avatar-stack";
import { RealtimeChat } from "@/components/realtime-chat";
import { useSquad } from "@/contexts/squad-context";
import { useMessagesQuery } from "@/hooks/use-messages-query";
import { useProfile } from "@/hooks/use-profile";
import { ChatMessage } from "@/hooks/use-realtime-chat";
import { useUser } from "@/hooks/use-user";
import { storeMessages } from "@/lib/store-messages";
import { formatUserName } from "@/lib/utils";

export default function ChatPage() {
  const { user } = useUser();
  const { profile } = useProfile(user?.id);
  const { squad } = useSquad();
  const { messages } = useMessagesQuery(squad?.id);

  if (!user || !profile) {
    return <div>Please log in to access the chat.</div>;
  }
  if (!squad) {
    return <div>Loading squad...</div>;
  }

  const handleMessage = async (messages: ChatMessage[]) => {
    await storeMessages(messages);
  };

  return (
    <>
      <RealtimeAvatarStack squadId={squad.id} />
      <RealtimeChat
        squadId={squad.id}
        profileId={profile.id}
        username={formatUserName(profile.first_name, profile.last_name)}
        messages={messages || []}
        onMessage={handleMessage}
      />
    </>
  );
}
