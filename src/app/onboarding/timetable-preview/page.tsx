import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export default function TimetablePreviewPage() {
  // Mock timetable data
  const courses = [
    { code: "COMP1511", name: "Programming Fundamentals", color: "bg-blue-500" },
    { code: "MATH1131", name: "Mathematics 1A", color: "bg-green-500" },
    { code: "PHYS1121", name: "Physics 1A", color: "bg-purple-500" },
  ]

  const schedule = [
    { day: "Monday", time: "9:00 - 11:00", course: "COMP1511", type: "Lecture", location: "CLB 7" },
    { day: "Monday", time: "14:00 - 16:00", course: "MATH1131", type: "Tutorial", location: "RC-4082" },
    { day: "Tuesday", time: "10:00 - 12:00", course: "PHYS1121", type: "Lecture", location: "CLB 5" },
    { day: "Wednesday", time: "9:00 - 11:00", course: "COMP1511", type: "Tutorial", location: "K17-G06" },
    { day: "Thursday", time: "13:00 - 15:00", course: "MATH1131", type: "Lecture", location: "CLB 7" },
    { day: "Friday", time: "11:00 - 13:00", course: "PHYS1121", type: "Lab", location: "Phys 213" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Chills</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Step 2 of 3</span>
            <span className="text-sm text-muted-foreground">Review Timetable</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "66%" }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Timetable imported successfully</h1>
            <p className="text-muted-foreground text-lg">We found {courses.length} courses in your schedule</p>
          </div>

          {/* Courses */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Courses</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.code} className="bg-card rounded-xl p-4 border border-border">
                  <div className={`w-3 h-3 rounded-full ${course.color} mb-2`} />
                  <div className="font-semibold text-foreground">{course.code}</div>
                  <div className="text-sm text-muted-foreground">{course.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Weekly Schedule</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {schedule.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-foreground">{item.day}</span>
                          <span className="text-sm text-muted-foreground">{item.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.course}</Badge>
                          <span className="text-sm text-muted-foreground">{item.type}</span>
                          <span className="text-sm text-muted-foreground">• {item.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 h-12 bg-transparent" asChild>
              <Link href="/onboarding/timetable">Back</Link>
            </Button>
            <Button className="flex-1 h-12" asChild>
              <Link href="/dashboard">Continue to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
