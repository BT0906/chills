import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, LogOut, Plus } from "lucide-react"

export default function DashboardPage() {
  const courses = [
    {
      code: "COMP1511",
      name: "Programming Fundamentals",
      students: 342,
      color: "bg-blue-500",
    },
    {
      code: "MATH1131",
      name: "Mathematics 1A",
      students: 289,
      color: "bg-green-500",
    },
    {
      code: "PHYS1121",
      name: "Physics 1A",
      students: 156,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-foreground">chills.</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Alex</h1>
            <p className="text-muted-foreground">Find classmates and form study groups for your courses</p>
          </div>

          {/* Courses Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Courses</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Link key={course.code} href={`/discovery/${course.code.toLowerCase()}`} className="group">
                  <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-md">
                    <div className={`w-4 h-4 rounded-full ${course.color} mb-3`} />
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {course.code}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{course.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                  </div>
                </Link>
              ))}

              <button className="group">
                <div className="bg-card rounded-xl p-6 border-2 border-dashed border-border hover:border-primary/50 transition-all hover:shadow-md h-full min-h-[180px] flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Add Course
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Import from timetable</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-muted/30 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to find your study squad?</h3>
            <p className="text-muted-foreground mb-4">
              Click on any course above to discover classmates and form groups
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
