import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export interface Meeting {
  id: number;
  description: string;
  start_time: string;
  end_time: string;
  room_id: string;
}
export function useMeetings(squadId: number, refreshKey?: number) {
  const supabase = createClient();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      const { data, error } = await supabase
        .from("meeting")
        .select("id, description, start_time, end_time, room_id")
        .eq("squad_id", squadId)
        .order("start_time", { ascending: true });

        if (error) {
          console.error("Supabase error fetching meetings:", error.message, error.details);
        } else {
          setMeetings(data || []);
        }
    
      setLoading(false);
    }
    fetchMeetings();
  }, [squadId, refreshKey]);

  return { meetings, loading };
}
