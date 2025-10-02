"use client";
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-lg font-medium">Authentication Required</p>
          <p className="text-sm text-muted-foreground">
            Please log in to access the chat.
          </p>
        </div>
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading squad...</p>
        </div>
      </div>
    );
  }

  const handleMessage = async (messages: ChatMessage[]) => {
    await storeMessages(messages);
  };

  return (
    <RealtimeChat
      squadId={squad.id}
      squadName={squad.name}
      squadAvatar={squad.profile_url || undefined}
      squadCourse={squad.course}
      profileId={profile.id}
      profileUrl={profile.profile_url || undefined}
      username={formatUserName(profile.first_name, profile.last_name)}
      messages={messages || []}
      onMessage={handleMessage}
    />
  );
}
