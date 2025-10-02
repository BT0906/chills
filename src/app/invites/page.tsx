"use client";

import { useEffect, useState } from "react";
import { findInvites, type Squad } from "@/app/actions/find-squad-invites";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Member = {
  user_id: string;
  name: string;
  status: "active" | "pending";
};

export default function PendingInvites() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Fetch pending invites for logged-in user
  useEffect(() => {
    const fetchInvites = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user logged in");
        setLoading(false);
        return;
      }

      const result = await findInvites(user.id);
      if (result.success) {
        // Ensure each squad has a members array
        const squadsWithMembers = (result.squads ?? []).map((squad) => ({
          ...squad,
          members: squad.members ?? [],
        }));
        setSquads(squadsWithMembers);
      }

      setLoading(false);
    };

    fetchInvites();
  }, []);

  const handleAccept = async (squadId: number) => {
    console.log("Accepted invite for squad", squadId);
    await supabase.rpc("accept_invite", { p_squad_id: squadId });
  };

  const handleDecline = async (squadId: number) => {
    console.log("Declined invite for squad", squadId);
    await supabase.rpc("decline_invite", { p_squad_id: squadId });
  };

  if (loading) return <div className="p-6 text-center">Loading invites...</div>;
  if (!squads.length)
    return <div className="p-6 text-center text-muted-foreground">No pending invites</div>;

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Pending Squad Invites</h1>
      <div className="space-y-6">
        {squads.map((squad) => (
          <Card key={squad.id} className="border shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                {squad.name}
                <Badge variant="secondary">{squad.course}</Badge>
              </CardTitle>
              <p className="text-muted-foreground">{squad.description}</p>
            </CardHeader>

            <CardContent>
              <h3 className="font-semibold mb-2">Members</h3>
              <ul className="space-y-2">
                {(squad.members ?? []).map((member: Member) => (
                  <li
                    key={member.user_id}
                    className="flex items-center justify-between bg-muted/40 p-3 rounded-lg"
                  >
                    <span className="font-medium">{member.name}</span>
                    <Badge
                      variant={member.status === "active" ? "default" : "outline"}
                      className="capitalize"
                    >
                      {member.status}
                    </Badge>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 mt-6">
                <Button className="flex-1" onClick={() => handleAccept(squad.id)}>
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDecline(squad.id)}
                >
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
