"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { findClassmates, type UserMatch } from "@/app/actions/discovery"
import Link from "next/link"
import { toast } from "sonner"

export default function DiscoverPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [matches, setMatches] = useState<UserMatch[]>([])
  const [filteredMatches, setFilteredMatches] = useState<UserMatch[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  // const [user, setUser] = useState<any>(null)
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

        const result = await findClassmates(authUser.id)
        if (result.success && result.data) {
          setMatches(result.data)
          setFilteredMatches(result.data)
          console.log("[v0] Loaded classmates:", result.data)
        } else {
          toast("Error", {
            description: result.error || "Failed to find classmates",
            // variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[v0] Error loading classmates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredMatches(matches)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = matches.filter(
      (match) =>
        match.first_name.toLowerCase().includes(query) ||
        match.last_name.toLowerCase().includes(query) ||
        match.zid.toLowerCase().includes(query) ||
        match.degree.toLowerCase().includes(query) ||
        match.shared_courses.some((course) => course.toLowerCase().includes(query)),
    )
    setFilteredMatches(filtered)
  }, [searchQuery, matches])

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleFormSquad = () => {
    if (selectedUsers.size === 0) {
      toast("No users selected", {
        description: "Please select at least one classmate to form a squad",
        // variant: "destructive",
      })
      return
    }

    // Navigate to squad formation with selected users
    const userIds = Array.from(selectedUsers).join(",")
    router.push(`/squad/create?users=${userIds}`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Discover Classmates</h1>
            <p className="text-sm text-muted-foreground">Find students in your courses</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Classmates</CardTitle>
                <CardDescription>
                  Found {filteredMatches.length} student{filteredMatches.length !== 1 ? "s" : ""} in your courses
                </CardDescription>
              </div>
              {selectedUsers.size > 0 && (
                <Button onClick={handleFormSquad} size="lg">
                  Form Squad ({selectedUsers.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name, zID, degree, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {filteredMatches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? "No classmates found matching your search." : "No classmates found in your courses yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={match.profile_url || undefined} />
                        <AvatarFallback>
                          {match.first_name[0]}
                          {match.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {match.first_name} {match.last_name}
                        </CardTitle>
                        <CardDescription>{match.zid}</CardDescription>
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedUsers.has(match.id)}
                      onCheckedChange={() => toggleUserSelection(match.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Degree</p>
                    <p className="text-sm text-muted-foreground">{match.degree}</p>
                  </div>

                  {match.bio && (
                    <div>
                      <p className="text-sm font-medium mb-1">Bio</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{match.bio}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Shared Courses</p>
                    <div className="flex flex-wrap gap-2">
                      {match.shared_courses.map((course) => (
                        <Badge key={course} variant="secondary">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {match.shared_tutorials.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Same Tutorials</p>
                      <div className="flex flex-wrap gap-2">
                        {match.shared_tutorials.map((tutorial) => (
                          <Badge key={tutorial} className="bg-green-100 text-green-800 hover:bg-green-200">
                            {tutorial}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
