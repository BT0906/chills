"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Users, X, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import UserCard from "@/components/squad/UserCard"
import SelectedUsersBar from "@/components/squad/SelectedUsersBar"
import { motion, AnimatePresence } from "framer-motion"
import { findClassmates, type Person } from "@/app/actions/discovery"
import { createClient } from "@/lib/supabase/client"

type Student = Person

const currentUser = {
  zid: "z5555555",
  first_name: "Alice",
  courses: ["COMP1511", "MATH1081", "COMP1521"],
  enrolments: [
    { course: "COMP1511", class_type: "tut" as const, section: "W16B", start_time: "16:00", end_time: "18:00" },
    { course: "MATH1081", class_type: "tut" as const, section: "T14A", start_time: "14:00", end_time: "16:00" },
  ],
}

const courseColors: Record<string, { bg: string; text: string; border: string }> = {
  COMP1511: { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/30" },
  COMP1521: { bg: "bg-purple-500/15", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/30" },
  MATH1081: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
}

const SquadFormation = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCourse, setFilterCourse] = useState<string[]>([])
  const [showSameTutorial, setShowSameTutorial] = useState(false)
  const [showTimeOverlap, setShowTimeOverlap] = useState(false)
  const [sortBy, setSortBy] = useState<"commonCourses" | "name">("commonCourses")

  useEffect(() => {
    async function loadClassmates() {
      try {
        setIsLoading(true)
        setError(null)

        // Get current user from Supabase auth
        const supabase = createClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          setError("Please log in to find classmates")
          setIsLoading(false)
          return
        }

        setCurrentUserId(user.id)

        // Fetch classmates using server action
        const result = await findClassmates(user.id)

        if (!result.success) {
          setError(result.error)
          setIsLoading(false)
          return
        }

        setStudents(result.data)
        setIsLoading(false)
      } catch (err) {
        console.error("[v0] Error loading classmates:", err)
        setError("Failed to load classmates. Please try again.")
        setIsLoading(false)
      }
    }

    loadClassmates()
  }, [])

  const commonCoursesIntersection = useMemo(() => {
    if (selectedUsers.length === 0) return []

    const selectedStudents = students.filter((s) => selectedUsers.includes(s.zid))
    let intersection = new Set(selectedStudents[0].commonCourses)

    for (let i = 1; i < selectedStudents.length; i++) {
      const studentCourses = new Set(selectedStudents[i].commonCourses)
      intersection = new Set([...intersection].filter((course) => studentCourses.has(course)))
    }

    return Array.from(intersection)
  }, [selectedUsers, students])

  const squadCourse = useMemo(() => {
    if (filterCourse.length === 1) return filterCourse[0]
    if (commonCoursesIntersection.length === 1) return commonCoursesIntersection[0]
    return null
  }, [filterCourse, commonCoursesIntersection])

  const toggleUserSelection = (zid: string) => {
    setSelectedUsers((prev) => {
      const isCurrentlySelected = prev.includes(zid)

      if (isCurrentlySelected) {
        return prev.filter((id) => id !== zid)
      } else {
        return [...prev, zid]
      }
    })
  }

  const toggleCourseFilter = (course: string) => {
    if (selectedUsers.length > 0 && !commonCoursesIntersection.includes(course)) {
      return
    }
    setFilterCourse((prev) => (prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]))
  }

  const deselectAll = () => {
    setSelectedUsers([])
    setFilterCourse([])
  }

  const clearAllFilters = () => {
    setFilterCourse([])
    setShowSameTutorial(false)
    setShowTimeOverlap(false)
    setSearchQuery("")
  }

  const activeFilterCount = filterCourse.length + (showSameTutorial ? 1 : 0) + (showTimeOverlap ? 1 : 0)

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.zid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.degree?.toLowerCase() || "").includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterCourse.length > 0) {
      const hasCourse = student.commonCourses.some((course) => filterCourse.includes(course))
      if (!hasCourse) return false
    }

    if (showSameTutorial && !student.sameTutorial) return false

    if (showTimeOverlap && !student.timeOverlap) return false

    return true
  })

  if (sortBy === "commonCourses") {
    filteredStudents.sort((a, b) => b.commonCourses.length - a.commonCourses.length)
  } else {
    filteredStudents.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`))
  }

  const handleFormSquad = () => {
    const selectedStudents = students.filter((s) => selectedUsers.includes(s.zid))
    console.log("Forming squad with:", selectedStudents)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4 animate-pulse" />
          <p className="text-lg font-semibold text-foreground">Finding your classmates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-card/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg"
              >
                <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  SquadUp
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground leading-tight">
                  {squadCourse ? `Forming squad for ${squadCourse}` : "Find your perfect study squad"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-foreground leading-tight">{currentUser.first_name}</p>
              <p className="text-xs text-muted-foreground leading-tight">{currentUser.zid}</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, zID, or degree..."
              className="pl-10 h-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-2.5">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xs font-semibold text-foreground shrink-0">Filters:</h3>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
              {selectedUsers.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deselectAll}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Deselect all
                </Button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <TooltipProvider>
                <div className="flex gap-1.5 shrink-0">
                  {currentUser.courses.map((course) => {
                    const colors = courseColors[course] || {
                      bg: "bg-gray-500/15",
                      text: "text-gray-700",
                      border: "border-gray-500/30",
                    }
                    const isDisabled = selectedUsers.length > 0 && !commonCoursesIntersection.includes(course)
                    const isActive = filterCourse.includes(course)

                    const button = (
                      <motion.button
                        key={course}
                        whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                        whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                        onClick={() => toggleCourseFilter(course)}
                        disabled={isDisabled}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 ${
                          isDisabled
                            ? "bg-muted/50 text-muted-foreground/40 border-border/30 cursor-not-allowed opacity-50"
                            : isActive
                              ? `${colors.bg} ${colors.text} ${colors.border} shadow-md`
                              : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                        }`}
                      >
                        {course}
                      </motion.button>
                    )

                    if (isDisabled) {
                      return (
                        <Tooltip key={course}>
                          <TooltipTrigger asChild>{button}</TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">No selected students have {course} in common</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return button
                  })}
                </div>
              </TooltipProvider>

              <div className="w-px bg-border shrink-0" />

              <div className="flex gap-1.5 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSameTutorial(!showSameTutorial)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                    showSameTutorial
                      ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  Same Tutorial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTimeOverlap(!showTimeOverlap)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                    showTimeOverlap
                      ? "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  Time Match
                </motion.button>
              </div>

              <div className="w-px bg-border shrink-0" />

              <div className="flex gap-1.5 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy("commonCourses")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                    sortBy === "commonCourses"
                      ? "bg-primary/15 text-primary border-primary/30 shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  Most Courses
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy("name")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                    sortBy === "name"
                      ? "bg-primary/15 text-primary border-primary/30 shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  Name A-Z
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Found <span className="font-semibold text-foreground">{filteredStudents.length}</span>{" "}
            {filteredStudents.length === 1 ? "student" : "students"}
          </p>
          {selectedUsers.length > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Badge variant="default" className="px-3 py-1">
                {selectedUsers.length} selected
              </Badge>
            </motion.div>
          )}
        </motion.div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.zid}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <UserCard
                  student={student}
                  isSelected={selectedUsers.includes(student.zid)}
                  onToggleSelect={() => toggleUserSelection(student.zid)}
                  courseColors={courseColors}
                  commonCoursesIntersection={commonCoursesIntersection}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredStudents.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search query</p>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <SelectedUsersBar
            selectedUsers={selectedUsers}
            students={students}
            onRemove={(zid) => setSelectedUsers((prev) => prev.filter((id) => id !== zid))}
            onFormSquad={handleFormSquad}
            squadCourse={squadCourse}
            commonCoursesIntersection={commonCoursesIntersection}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default SquadFormation
