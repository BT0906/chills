"use client";

import { CreateMeetingDialog } from '@/components/create-meeting';
import { useParams } from "next/navigation";
import { MeetingList } from "@/components/meeting-list";

export default function Chat() {
  const params = useParams();
  const squadId = Number(params.id);

  return (
    <>
      <CreateMeetingDialog/>
      <MeetingList squadId={squadId}/>
    </>
  )
}
