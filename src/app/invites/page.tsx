"use server"

import { useEffect, useState } from "react";
import { findInvites, type Squad } from "@/app/actions/find-squad-invites";
import { createClient } from "@/lib/supabase/server";

export default function PendingInvites() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvites = async () => {
      setLoading(true);

      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const result = await findInvites(user.id);
      if (result.success) setSquads(result.squads ?? []);

      setLoading(false);
    };

    fetchInvites();
  }, []);

  if (loading) return <div>Loading invites...</div>;
  if (!squads.length) return <div>No pending invites</div>;

  return (
    <div>
      <h1>Pending Squad Invites</h1>
      <ul>
        {squads.map((squad) => (
          <li key={squad.id}>
            <strong>{squad.name}</strong> - {squad.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
