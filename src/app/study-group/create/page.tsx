import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock } from "lucide-react"

export default function CreateSquadPage() {
  const selectedStudents = [
    { id: 1, name: "Sarah Chen", avatar: "/student-avatar-1.png" },
    { id: 2, name: "Marcus Johnson", avatar: "/student-avatar-2.png" },
    { id: 4, name: "David Kim", avatar: "/student-avatar-4.png" },
  ]

  const proposedTimes = [
    { day: "Tuesday", time: "3:00 - 4:00 PM", available: 4 },
    { day: "Wednesday", time: "11:00 AM - 12:00 PM", available: 4 },
    { day: "Thursday", time: "2:00 - 3:00 PM", available: 3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/discovery/comp1511" className="flex items-center gap-2 w-fit">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Chills</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <Badge variant="secondary">COMP1511</Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Form Your Squad</h1>
            <p className="text-muted-foreground">Review members and select a meeting time</p>
          </div>

          {/* Selected Members */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Squad Members ({selectedStudents.length + 1})
            </h2>
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="space-y-4">
                {/* Current User */}
                <div className="flex items-center gap-3">
                  <img src="/placeholder.svg?height=40&width=40" alt="You" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-foreground">You (Alex)</div>
                    <div className="text-sm text-muted-foreground">Organizer</div>
                  </div>
                </div>

                {/* Selected Students */}
                {selectedStudents.map((student) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <img
                      src={student.avatar || "/placeholder.svg"}
                      alt={student.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-foreground">{student.name}</div>
                      <div className="text-sm text-muted-foreground">Member</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proposed Meeting Times */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Proposed Meeting Times</h2>
            <div className="space-y-3">
              {proposedTimes.map((time, index) => (
                <label
                  key={index}
                  className="flex items-center gap-4 bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-all cursor-pointer"
                >
                  <input type="radio" name="meeting-time" className="w-4 h-4" defaultChecked={index === 0} />
                  <div className="flex-1">
                    <div className="font-medium text-foreground mb-1">
                      {time.day}, {time.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {time.available} of {selectedStudents.length + 1} available
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 bg-transparent" asChild>
              <Link href="/discovery/comp1511">Back</Link>
            </Button>
            <Button className="flex-1 h-12" asChild>
              <Link href="/squad/loading">Send Invites</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
