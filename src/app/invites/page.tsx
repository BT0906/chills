"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { findInvites, type Squad } from "@/app/actions/find-squad-invites";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react"

export type Member = {
  user_id: string;
  name: string;
  status: "active" | "pending";
};

async function getCreatorName(creatorId: string, supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("profile")
    .select("first_name")
    .eq("id", creatorId)
    .single();

  if (error) {
    console.error("Error fetching creator name:", error);
    return "Unknown";
  }

  return data?.first_name || "Unknown";
}


export default function PendingInvites() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

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
        const squadsWithOrganisers = await Promise.all(
          (result.squads ?? []).map(async (squad) => {
            const creatorName = await getCreatorName(squad.creator_id, supabase);
            return {
              ...squad,
              organiserName: creatorName,
              members: squad.members ?? [],
            };
          })
        );
        setSquads(squadsWithOrganisers);
      }

      setLoading(false);
    };

    fetchInvites();
  }, []);

  const handleAccept = async (squadId: number) => {
    console.log("Accepted invite for squad", squadId);
    await supabase.rpc("accept_invite", { p_squad_id: squadId });
    router.push(`/${squadId}`); // navigate to squad page
  };

  const handleDecline = async (squadId: number) => {
    console.log("Declined invite for squad", squadId);
    await supabase.rpc("decline_invite", { p_squad_id: squadId });
    router.push(`/dashboard`); // navigate to dashboard
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

              {squad.organiserName && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Organiser:</span>
                  <Badge variant="outline" className="ml-1">
                    {squad.organiserName}
                  </Badge>
                </div>
              )}
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
                      className={`capitalize 
                        ${member.status === "active" 
                          ? "bg-green-100 text-green-700 border border-green-300" 
                          : "bg-yellow-100 text-yellow-700 border border-yellow-300"}
                      `}
                    >
                      {member.status}
                    </Badge>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 mt-6">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-400 text-white transition-colors duration-200 cursor-pointer"
                  onClick={() => handleAccept(squad.id)}
                >
                  Accept
                </Button>
                <Button
                  className="flex-1 bg-red-600 text-white hover:bg-red-400 transition-colors duration-300 cursor-pointer"
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
