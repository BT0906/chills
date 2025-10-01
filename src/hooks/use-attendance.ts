import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAttendance(meetingId: number, userId?: string) {
  const supabase = createClient();
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return; // exit if no userId

    async function fetchAttendance() {
      const { data, error } = await supabase
        .from("attendance")
        .select("is_attending")
        .eq("meeting_id", meetingId)
        .eq("user_id", userId as string) // ✅ safe because we checked above
        .maybeSingle();

      if (!error && data) {
        setIsAttending(data.is_attending);
      }
      setLoading(false);
    }

    fetchAttendance();
  }, [meetingId, userId]);

  async function toggleAttendance() {
    if (!userId) return;

    const { error } = await supabase
      .from("attendance")
      .upsert({
        meeting_id: meetingId,
        user_id: userId,
        is_attending: !isAttending,
      });

    if (!error) {
      setIsAttending(!isAttending);
    } else {
      console.error("Attendance update error:", error);
    }
  }

  return { isAttending, loading, toggleAttendance };
}
