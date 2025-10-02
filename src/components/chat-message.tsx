import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatMessage } from "@/hooks/use-realtime-chat";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showHeader: boolean;
}

const renderMessageWithChill = (content: string) => {
  const parts = content.split(/(?<![A-Za-z])(\S*chill\S*\b)/gi);

  return parts.map((part, index) => {
    if (part.toLowerCase().includes("chill")) {
      return (
        <motion.span
          key={index}
          className="relative inline-block font-bold text-blue-500 dark:text-blue-400"
          initial={{ scale: 1 }}
          animate={{
            scale: [1, 1.1, 1],
            textShadow: [
              "0 0 0px rgba(59, 130, 246, 0.5)",
              "0 0 10px rgba(59, 130, 246, 0.8)",
              "0 0 0px rgba(59, 130, 246, 0.5)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <span className="relative z-10">{part}</span>
          {/* Animated background */}
          <motion.span
            className="absolute inset-0  rounded px-1 -mx-1"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
          {/* Sparkle effects */}
          <motion.span
            className="absolute -top-1 -right-1 text-xs"
            animate={{
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ❄️
          </motion.span>
        </motion.span>
      );
    }
    return part;
  });
};

export const ChatMessageItem = ({
  message,
  isOwnMessage,
  showHeader,
}: ChatMessageItemProps) => {
  const messageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      },
    },
  };

  const containsChill = message.content.toLowerCase().includes("chill");

  return (
    <motion.div
      className={`flex mb-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <div
        className={cn("max-w-[85%] w-fit flex gap-2", {
          "flex-row-reverse": isOwnMessage,
        })}
      >
        {/* Avatar - show for other users when showHeader OR create invisible spacer */}
        {!isOwnMessage && (
          <motion.div
            className="flex-shrink-0"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: showHeader ? 0.1 : 0,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            {showHeader ? (
              <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                <AvatarImage src={message.user.image || ""} />
                <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-secondary/20">
                  {message.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : (
              // Invisible spacer to maintain alignment
              <div className="h-8 w-8" />
            )}
          </motion.div>
        )}

        {/* Message content */}
        <div className={cn("flex flex-col", { "items-end": isOwnMessage })}>
          {/* Header with name and time */}
          {showHeader && (
            <motion.div
              className={cn("flex items-center gap-2 mb-1 px-1", {
                "justify-end flex-row-reverse": isOwnMessage,
              })}
              initial={{ opacity: 0, x: isOwnMessage ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span className="font-semibold text-xs text-foreground/90">
                {isOwnMessage ? "You" : message.user.name}
              </span>
              <span className="text-muted-foreground/60 text-xs">
                {new Date(message.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </motion.div>
          )}

          {/* Message bubble */}
          <motion.div
            className={cn(
              "relative py-3 px-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              "backdrop-blur-sm border border-border/50",
              isOwnMessage
                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md"
                : "bg-gradient-to-br from-background to-muted/50 text-foreground rounded-bl-md",
              "hover:shadow-md transition-all duration-200",
              // Special styling for messages containing "chill"
              containsChill && "ring-2 ring-blue-400/30 shadow-blue-400/20"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={
              containsChill
                ? {
                    boxShadow: [
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    ],
                  }
                : {}
            }
            transition={
              containsChill
                ? {
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }
                : {}
            }
          >
            {/* Special background effect for messages with "chill" */}
            {containsChill && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/5 to-cyan-400/5 pointer-events-none"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            )}

            {/* Render message content with special "chill" styling */}
            <div className="relative z-10">
              {renderMessageWithChill(message.content)}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
