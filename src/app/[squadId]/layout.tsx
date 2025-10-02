"use client";
import { SquadProvider } from "@/contexts/squad-context";
import { CreateMeetingDialog} from "@/components/create-meeting"
import { MeetingList } from "@/components/meeting-list";
import { use } from "react";
import { useState } from "react";

export default function ChatLayout({
  params,
  children,
}: LayoutProps<"/[squadId]">) {
  const { squadId: squadIdString } = use(params);
  const squadId = Number(squadIdString);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <SquadProvider squadId={squadId}>
      <div className="flex h-screen">
        {/* Sidebar for meetings */}
        <aside className="w-80 border-r bg-muted/20 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Meetings</h2>
            <CreateMeetingDialog onCreated={() => setRefreshKey(prev => prev + 1)} />
            {/* <CreateMeetingDialog /> */}
          </div>
          <div className="flex-1 overflow-y-auto">
            <MeetingList squadId={squadId} refreshKey={refreshKey}/>
          </div>
        </aside>

        {/* Main chat */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </SquadProvider>
  );
}
