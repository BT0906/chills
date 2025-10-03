"use client";

<<<<<<< HEAD
import { ChatMessageItem } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { type ChatMessage, useRealtimeChat } from "@/hooks/use-realtime-chat";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface RealtimeChatProps {
  squadId: number;
  userId: string;
  username: string;
=======
import { ChatHeader } from "@/components/chat-header";
import { ChatMessageItem } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ChatMessage, useRealtimeChat } from "@/hooks/use-realtime-chat";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface RealtimeChatProps {
  squadId: number;
  squadName: string;
  squadAvatar?: string;
  squadCourse: string;
  profileId: string;
  username: string;
  profileUrl?: string;
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
  onMessage?: (messages: ChatMessage[]) => void;
  messages?: ChatMessage[];
}

<<<<<<< HEAD
/**
 * Realtime chat component
 * @param squadId - The ID of the squad to join. Each squad is a unique chat.
 * @param userId - The ID of the user
 * @param username - The username of the user
 * @param onMessage - The callback function to handle the messages. Useful if you want to store the messages in a database.
 * @param messages - The messages to display in the chat. Useful if you want to display messages from a database.
 * @returns The chat component
 */
export const RealtimeChat = ({
  squadId,
  userId,
  username,
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll();
=======
export const RealtimeChat = ({
  squadId,
  squadName,
  squadAvatar,
  squadCourse,
  profileId,
  username,
  profileUrl,
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const storedMessageIds = useRef(new Set<string>());
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
<<<<<<< HEAD
  } = useRealtimeChat({
    squadId,
    userId,
    username,
=======
    onlineUsers,
  } = useRealtimeChat({
    squadId,
    profileId,
    username,
    profileUrl,
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
  });
  const [newMessage, setNewMessage] = useState("");

  // Merge realtime messages with initial messages
  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages];
<<<<<<< HEAD
    // Remove duplicates based on message id
=======
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) =>
        index === self.findIndex((m) => m.id === message.id)
    );
<<<<<<< HEAD
    // Sort by creation date
=======
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
    const sortedMessages = uniqueMessages.sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );

    return sortedMessages;
  }, [initialMessages, realtimeMessages]);

<<<<<<< HEAD
  useEffect(() => {
    if (onMessage) {
      onMessage(allMessages);
    }
  }, [allMessages, onMessage]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
=======
  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  // Only store new realtime messages (not our own sent messages or initial messages)
  useEffect(() => {
    if (!onMessage || realtimeMessages.length === 0) return;

    const newMessagesToStore = realtimeMessages.filter(
      (message) =>
        !storedMessageIds.current.has(message.id) &&
        message.user.id !== profileId
    );

    if (newMessagesToStore.length > 0) {
      newMessagesToStore.forEach((message) =>
        storedMessageIds.current.add(message.id)
      );

      onMessage(newMessagesToStore);
    }
  }, [realtimeMessages, onMessage, profileId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
    scrollToBottom();
  }, [allMessages, scrollToBottom]);

  const handleSendMessage = useCallback(
<<<<<<< HEAD
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !isConnected) return;

      sendMessage(newMessage);
      setNewMessage("");
    },
    [newMessage, isConnected, sendMessage]
  );

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : null}
        <div className="space-y-1">
          {allMessages.map((message, index) => {
            const prevMessage = index > 0 ? allMessages[index - 1] : null;
            const showHeader =
              !prevMessage || prevMessage.user.name !== message.user.name;

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ChatMessageItem
                  message={message}
                  isOwnMessage={message.user.name === username}
                  showHeader={showHeader}
                />
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex w-full gap-2 border-t border-border p-4"
      >
        <Input
          className={cn(
            "rounded-full bg-background text-sm transition-all duration-300",
            isConnected && newMessage.trim() ? "w-[calc(100%-36px)]" : "w-full"
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        {isConnected && newMessage.trim() && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={!isConnected}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
=======
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !isConnected) return;

      await sendMessage(newMessage);
      setNewMessage("");

      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    },
    [newMessage, isConnected, sendMessage, scrollToBottom]
  );

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Header */}
      <ChatHeader
        squadId={squadId}
        squadName={squadName}
        squadCourse={squadCourse}
        squadAvatar={squadAvatar}
        onlineUsers={onlineUsers}
      />

      {/* Messages Container with ScrollArea */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4 space-y-4">
            {/* Connection Status Indicator */}
            {!isConnected && (
              <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
                Connecting to chat...
              </div>
            )}

            {allMessages.length === 0 ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="text-center text-sm text-muted-foreground">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {allMessages.map((message, index) => {
                  const prevMessage = index > 0 ? allMessages[index - 1] : null;
                  const showHeader =
                    !prevMessage ||
                    prevMessage.user.name !== message.user.name ||
                    prevMessage.user.id !== message.user.id;

                  return (
                    <div
                      key={message.id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                    >
                      <ChatMessageItem
                        message={message}
                        isOwnMessage={message.user.name === username}
                        showHeader={showHeader}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Input - Sticky Bottom */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSendMessage} className="flex gap-2 p-4">
          <Input
            className={cn(
              "rounded-full bg-muted/50 border-0 text-sm transition-all duration-300 focus-visible:ring-1",
              isConnected && newMessage.trim() ? "flex-1" : "w-full"
            )}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
          />
          {isConnected && newMessage.trim() && (
            <Button
              className="aspect-square rounded-full bg-primary hover:bg-primary/90 animate-in fade-in slide-in-from-right-4 duration-300"
              type="submit"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
>>>>>>> 08a69fffba0169a80e6e6684d840f8e333bfd953
    </div>
  );
};
