"use client";
import { SquadProvider } from "@/contexts/squad-context";
import { use } from "react";

export default function ChatLayout({
  params,
  children,
}: LayoutProps<"/[squadId]">) {
  const { squadId: squadIdString } = use(params);
  const squadId = Number(squadIdString);

  return (
    <div>
      <SquadProvider squadId={squadId}>{children}</SquadProvider>
    </div>
  );
}
