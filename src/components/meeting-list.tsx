import { MeetingCard } from "@/components/meeting-card";
import { useMeetings, Meeting } from "@/hooks/use-meetings";

export function MeetingList({ squadId }: { squadId: number }) {
  const { meetings, loading } = useMeetings(squadId);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!meetings || meetings.length === 0) return <p className="text-muted-foreground">No meetings yet.</p>;

  return (
    <div className="space-y-4">
      {meetings.map((meeting: Meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
