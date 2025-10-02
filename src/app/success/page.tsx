"use client";

import Link from "next/link"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, MessageSquare } from "lucide-react"
import { PlaceholdersAndVanishInput } from "../../components/ui/placeholders-and-vanish-input";
import { Confetti, type ConfettiRef } from "../../components/ui/confetti"

export default function SuccessPage() {
    const confettiRef = useRef<ConfettiRef>(null)
    const placeholders = [
        "What's the weighting of this assignment?",
        "When is this due?",
        "Find me a room with whiteboards",
        "Create a group chat with all my members",
        "Book me a room that fits six people"
    ];
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    };
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("submitted");
    };

    const squadMembers = [
        { id: 1, name: "Sarah Chen", avatar: "/student-avatar-1.png", status: "accepted" },
        { id: 2, name: "Marcus Johnson", avatar: "/student-avatar-2.png", status: "pending" },
        { id: 4, name: "David Kim", avatar: "/student-avatar-4.png", status: "pending" },
    ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-foreground">chills.</span>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-500" />
              <Confetti
                ref={confettiRef}
                className="absolute top-0 left-0 z-0 size-full"
                onMouseEnter={() => {
                confettiRef.current?.fire({})
                }}
              />
            </div>

            <div className="h-[20rem] flex flex-col justify-center  items-center px-4">
            <h2 className="mb-16 sm:mb-30 text-xl text-center sm:text-5xl dark:text-white text-black">
                Success, Ask ChillBot Anything
            </h2>
            <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
            />
            </div>
    
            {/* <h1 className="text-3xl font-bold text-foreground mb-2">Squad Created!</h1>
            <p className="text-muted-foreground text-lg">Invitations have been sent to your selected classmates</p> */}
          </div>

          {/* Squad Details */}
          <div className="bg-card rounded-2xl p-8 border border-border mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <Badge variant="secondary">COMP1511</Badge>
              <span className="text-sm text-muted-foreground">Study Squad</span>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Meeting Time</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="font-medium text-foreground">Tuesday, 3:00 - 4:00 PM</div>
                <div className="text-sm text-muted-foreground">Weekly study session</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Members</h3>
              <div className="space-y-3">
                {/* Current User */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/placeholder.svg?height=40&width=40" alt="You" className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="font-medium text-foreground">You (Alex)</div>
                      <div className="text-sm text-muted-foreground">Organizer</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Active
                  </Badge>
                </div>

                {/* Squad Members */}
                {squadMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-foreground">{member.name}</div>
                        <div className="text-sm text-muted-foreground">Member</div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        member.status === "accepted"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      }
                    >
                      {member.status === "accepted" ? "Accepted" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full h-12 text-base" size="lg">
              <MessageSquare className="mr-2 h-5 w-5" />
              Join Squad Chat
            </Button>
            <Button variant="outline" className="w-full h-12 text-base bg-transparent" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
