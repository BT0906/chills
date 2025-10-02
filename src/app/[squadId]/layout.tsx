"use client";

import { Button } from "@/components/ui/button";
import { SquadProvider } from "@/contexts/squad-context";
import { useSquadMembership } from "@/hooks/use-squad-membership";
import { useUser } from "@/hooks/use-user";
import { use } from "react";

interface LayoutProps {
  params: Promise<{ squadId: string }>;
  children: React.ReactNode;
}

function SquadMembershipGuard({
  squadId,
  userId,
  children,
}: {
  squadId: number;
  userId: string;
  children: React.ReactNode;
}) {
  const { isMember, isLoading } = useSquadMembership(squadId, userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            Verifying squad access...
          </p>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <p className="text-lg font-medium">Access Denied</p>
          <p className="text-sm text-muted-foreground mb-4">
            You are not a member of this squad.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ChatLayout({ params, children }: LayoutProps) {
  const { squadId: squadIdString } = use(params);
  const squadId = Number(squadIdString);
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-lg font-medium">Authentication Required</p>
          <p className="text-sm text-muted-foreground">
            Please log in to access squad chats.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SquadProvider squadId={squadId}>
      <SquadMembershipGuard squadId={squadId} userId={user.id}>
        {children}
      </SquadMembershipGuard>
    </SquadProvider>
  );
}
