// components/meeting-card.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAttendance } from "@/hooks/use-attendance";
import { useContext } from "react";
import { UserContext } from "@/contexts/user-context";
import { Meeting } from "@/hooks/use-meetings";

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const { user } = useContext(UserContext);
  const userId = user?.id ?? null;

  const { isAttending, loading, toggleAttendance } = useAttendance(meeting.id, userId as string);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meeting.description}</CardTitle>
        <CardDescription>
          {new Date(meeting.start_time).toLocaleString()} – {new Date(meeting.end_time).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Room ID: {meeting.room_id || "Online"}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={toggleAttendance} size="sm" disabled={loading}>
          {isAttending ? "Unattend" : "Attend"}
        </Button>
      </CardFooter>
    </Card>
  );
}
