"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserCourses } from "@/app/actions/discovery"
import { getPendingInvitations } from "@/app/actions/squad"
import Link from "next/link"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  // const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [invitationCount, setInvitationCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/login")
          return
        }

        // setUser(authUser)

        // Get profile
        const { data: profileData } = await supabase.from("profile").select("*").eq("id", authUser.id).single()

        if (!profileData) {
          router.push("/onboarding")
          return
        }

        setProfile(profileData)

        // Get courses
        const result = await getUserCourses(authUser.id)
        if (result.success && result.data) {
          setCourses(result.data)
        }

        // Get invitation count
        const invitationsResult = await getPendingInvitations(authUser.id)
        if (invitationsResult.success && invitationsResult.data) {
          setInvitationCount(invitationsResult.data.length)
        }
      } catch (error) {
        console.error("[v0] Error loading dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Squad Formation</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile?.first_name} {profile?.last_name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/squads">My Squads</Link>
            </Button>
            {invitationCount > 0 && (
              <Button asChild variant="outline">
                <Link href="/invitations">
                  Invitations
                  <Badge className="ml-2" variant="destructive">
                    {invitationCount}
                  </Badge>
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Courses</CardTitle>
              <CardDescription>Enrolled this term</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Classes</CardTitle>
              <CardDescription>Per week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses.reduce((sum, c) => sum + c.classCount, 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Degree</CardTitle>
              <CardDescription>Program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{profile?.degree}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Classes you're enrolled in this term</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No courses found. Please update your timetable.</p>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.course} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{course.course}</h3>
                      <Badge variant="secondary">{course.classCount} classes</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {course.classes.map((cls: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {cls.class}
                          {cls.section ? ` ${cls.section}` : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">Ready to Find Your Squad?</CardTitle>
            <CardDescription className="text-blue-100">
              Discover students in your courses and form study groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" variant="secondary">
              <Link href="/discover">Find Classmates</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
