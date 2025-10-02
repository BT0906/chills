"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RealtimeUser } from "@/hooks/use-realtime-chat";
import { useSquadMemberProfiles } from "@/hooks/use-squad-member-profiles";
import { ChevronDown, Users } from "lucide-react";

interface ChatHeaderProps {
  squadId: number;
  squadName: string;
  squadAvatar?: string;
  squadCourse: string;
  onlineUsers: RealtimeUser[];
}

export const ChatHeader = ({
  squadId,
  squadName,
  squadAvatar,
  squadCourse,
  onlineUsers,
}: ChatHeaderProps) => {
  const { members } = useSquadMemberProfiles(squadId);

  console.log("Online users:", onlineUsers);

  const onlineMembers =
    members?.filter((member) =>
      onlineUsers.some((user) => user.profileId === member.user_id)
    ) || [];

  const offlineMembers =
    members?.filter(
      (member) => !onlineUsers.some((user) => user.profileId === member.user_id)
    ) || [];

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-4 p-3 h-auto rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-lg">
                <AvatarImage src={squadAvatar} alt={squadName} />
                <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  {squadName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col items-start min-w-0 flex-1">
              <div className="flex items-center gap-2 w-full">
                <h1 className="font-bold text-lg leading-tight truncate max-w-full text-foreground">
                  {squadName}
                </h1>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-medium uppercase tracking-wide"
                >
                  {squadCourse}
                </Badge>
              </div>
              <div className="flex flex-col gap-0.5 w-full">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-green-600">
                      {onlineMembers.length}
                    </span>{" "}
                    online
                    {members && members.length > 0 && (
                      <span className="text-muted-foreground/60">
                        {" "}
                        • {members.length} total
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <ChevronDown className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:text-muted-foreground flex-shrink-0" />
          </Button>
        </SheetTrigger>

        <SheetContent side="top" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              Squad Members
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6 px-6">
            {/* Online Members */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <h3 className="text-sm font-medium text-muted-foreground">
                  ONLINE — {onlineMembers.length}
                </h3>
              </div>
              <div className="space-y-2">
                {onlineMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center gap-3 p-2"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profile_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.first_name?.[0]}
                          {member.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                    </div>
                    {member.status === "pending" && (
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Members */}
            {offlineMembers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 bg-muted-foreground/50 rounded-full" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    OFFLINE — {offlineMembers.length}
                  </h3>
                </div>
                <div className="space-y-2">
                  {offlineMembers.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 p-2 opacity-60"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profile_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.first_name?.[0]}
                          {member.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                      </div>
                      {member.status === "pending" && (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
