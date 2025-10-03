"use client";

import { getSquadMembers } from "@/app/actions/get-squad-members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { createClient } from "@/lib/supabase/client";
import { Check, MessageSquare } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SquadPage() {
  const router = useRouter();
  const confettiRef = useRef<ConfettiRef>(null);
  const { id } = useParams();
  const supabase = createClient();

  const [squad, setSquad] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSquad() {
      const { data: squadData, error: squadError } = await supabase
        .from("squad")
        .select("id, name, course, description")
        .eq("id", id)
        .single();

      if (squadError) {
        console.error("Error fetching squad:", squadError);
        return;
      }

      setSquad(squadData);

      const result = await getSquadMembers(squadData.id);
      if (result.success) {
        console.log(JSON.stringify(result.members, null, 2));
        setMembers(result.members ?? []); // <-- fallback to empty array
      } else {
        console.error("Error fetching members:", result.error);
        setMembers([]); // optional: clear members if error
      }
    }

    if (id) fetchSquad();
  }, [id]);

  useEffect(() => {
    if (squad) {
      setTimeout(() => {
        confettiRef.current?.fire({});
      }, 500);
    }
  }, [squad]);

  const placeholders = [
    "What's the weighting of this assignment?",
    "When is this due?",
    "Find me a room with whiteboards",
    "Create a group chat with all my members",
    "Book me a room that fits six people",
  ];

  if (!squad) {
    return <div className="flex justify-center p-10">Loading squad...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Success Confetti */}
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-500" />
            </div>

            <h2 className="mb-16 text-xl sm:text-5xl font-bold whitespace-nowrap">
              Success, Ask ChillBot anything!
            </h2>

            <Confetti
              ref={confettiRef}
              className="absolute top-0 left-0 z-0 size-full"
              onMouseEnter={() => {
                confettiRef.current?.fire({});
              }}
            />

            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={(e) => console.log(e.target.value)}
              onSubmit={(e) => {
                e.preventDefault();
                console.log("submitted");
              }}
            />
          </div>

          {/* Squad Details */}
          <div className="bg-card rounded-2xl p-8 border border-border mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <Badge variant="secondary">{squad.course}</Badge>
              <span className="text-sm text-muted-foreground">
                {squad.name || "Study Squad"}
              </span>
              <br></br>
              <span className="text-sm text-muted-foreground">
                {squad.description || ""}
              </span>
            </div>

            {/* Members */}
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Members
            </h3>
            <div className="space-y-3">
              {members.map((m) => (
                <div
                  key={m.user_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar_url || "/placeholder.svg"}
                      alt={m.name || "Member"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-foreground">
                        {m.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Member
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      m.status === "active"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }
                  >
                    {m.status === "active" ? "Active" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full h-12 text-base"
              size="lg"
              onClick={() => router.push(`/${squad.id}`)}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Join Squad Chat
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-base bg-transparent"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
