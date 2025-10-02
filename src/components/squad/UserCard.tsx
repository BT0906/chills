"use client"

import { Check, Clock, Users, GraduationCap, ChevronDown, ChevronUp, Calendar, User, Cake, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { useState } from "react"

interface Enrolment {
  course: string
  class_type: "lec" | "tut" | "lab"
  section: string
  start_time: string
  end_time: string
  room_id: string
}

interface CourseWithCommonFlag {
  course: string
  isCommon: boolean
  enrolments: Enrolment[]
}

interface Student {
  zid: string
  first_name: string
  last_name: string
  profile_url: string
  degree: string
  gender: string
  age: number
  bio: string
  enrolments: Enrolment[]
  commonCourses: string[]
  allCourses: CourseWithCommonFlag[]
  sameTutorial: boolean
  timeOverlap: boolean
  sameDayAtUni: boolean
}

interface UserCardProps {
  student: Student
  isSelected: boolean
  onToggleSelect: () => void
  courseColors: Record<string, { bg: string; text: string; border: string }>
  commonCoursesIntersection: string[]
  selectedCourses: string[]
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
}

const formatDay = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

const UserCard = ({
  student,
  isSelected,
  onToggleSelect,
  courseColors,
  commonCoursesIntersection,
  selectedCourses,
}: UserCardProps) => {
  const [showDetails, setShowDetails] = useState(false)
  const [showAllClasses, setShowAllClasses] = useState(false)

  const displayedCourses =
    selectedCourses.length > 0
      ? student.allCourses.filter((courseData) => selectedCourses.includes(courseData.course))
      : student.allCourses

  const relevantCourses = selectedCourses.length > 0 ? selectedCourses : student.commonCourses

  const commonCourseClasses = student.enrolments.filter((enrolment) => relevantCourses.includes(enrolment.course))
  const nonCommonCourseClasses = student.enrolments.filter((enrolment) => !relevantCourses.includes(enrolment.course))

  const displayedClasses = showAllClasses
    ? student.enrolments
    : commonCourseClasses.length > 0
      ? commonCourseClasses
      : student.enrolments

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-xl cursor-pointer relative overflow-hidden ${
        isSelected ? "ring-2 ring-primary shadow-lg" : ""
      }`}
      onClick={onToggleSelect}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <CardHeader className="pb-4 relative">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 ring-2 ring-background shadow-lg">
            <AvatarImage src={student.profile_url || "/placeholder.svg"} alt={student.first_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-xl">
              {student.first_name[0]}
              {student.last_name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-foreground flex items-center gap-2 leading-tight">
                  {student.first_name} {student.last_name}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-md"
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">{student.zid}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
              {student.degree && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{student.degree}</span>
                </div>
              )}
              {student.gender && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{student.gender}</span>
                </div>
              )}
              {student.age > 0 && (
                <div className="flex items-center gap-1.5">
                  <Cake className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{student.age} years</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {student.sameDayAtUni && (
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs shadow-md border-0 whitespace-nowrap">
                <Calendar className="h-3 w-3 mr-1" />
                Same Day
              </Badge>
            )}
            {student.sameTutorial && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs shadow-md border-0 whitespace-nowrap">
                <Users className="h-3 w-3 mr-1" />
                Tutorial
              </Badge>
            )}
            {student.timeOverlap && !student.sameTutorial && (
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs shadow-md border-0 whitespace-nowrap">
                <Clock className="h-3 w-3 mr-1" />
                Time
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {student.bio && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
            <p className="text-sm text-foreground leading-relaxed italic">&ldquo;{student.bio}&rdquo;</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">
              Courses <span className="text-muted-foreground">({displayedCourses.length})</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {displayedCourses.map((courseData) => {
              const colors = courseColors[courseData.course] || {
                bg: "bg-gray-500/15",
                text: "text-gray-700",
                border: "border-gray-500/30",
              }
              const isCommon = courseData.isCommon
              const isHighlighted = commonCoursesIntersection.includes(courseData.course)
              return (
                <Badge
                  key={courseData.course}
                  className={`text-xs font-bold px-3 py-1.5 border-2 shadow-sm transition-all ${
                    isCommon
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : "bg-muted/30 text-muted-foreground/50 border-muted-foreground/20"
                  } ${isHighlighted ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background scale-105" : ""}`}
                >
                  {courseData.course}
                </Badge>
              )
            })}
          </div>
        </div>

        {student.enrolments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Classes{" "}
                <span className="text-muted-foreground">
                  ({showAllClasses ? student.enrolments.length : commonCourseClasses.length})
                </span>
              </p>
              {nonCommonCourseClasses.length > 0 && selectedCourses.length === 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAllClasses(!showAllClasses)
                  }}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {showAllClasses ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Common Only
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show All ({nonCommonCourseClasses.length} more)
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {displayedClasses.map((enrolment, idx) => {
                const isRelevantCourse = relevantCourses.includes(enrolment.course)
                const courseColor = courseColors[enrolment.course] || {
                  bg: "bg-gray-500/15",
                  text: "text-gray-700",
                  border: "border-gray-500/30",
                }
                return (
                  <div
                    key={idx}
                    className={`rounded-lg px-3 py-2.5 transition-all border-2 ${
                      isRelevantCourse
                        ? `${courseColor.bg} ${courseColor.border} shadow-sm`
                        : "bg-muted/20 border-muted-foreground/10 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`font-bold text-sm ${isRelevantCourse ? courseColor.text : "text-muted-foreground/70"}`}
                      >
                        {enrolment.course}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold ${isRelevantCourse ? `${courseColor.border} ${courseColor.text}` : "border-muted-foreground/20 text-muted-foreground/60"}`}
                      >
                        {enrolment.class_type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`flex items-center gap-2 text-xs ${isRelevantCourse ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                      >
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="font-medium">{formatDay(enrolment.start_time)}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>
                          {formatTime(enrolment.start_time)} - {formatTime(enrolment.end_time)}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-2 text-xs ${isRelevantCourse ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                      >
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="font-mono">{enrolment.room_id}</span>
                        {enrolment.section && (
                          <>
                            <span>•</span>
                            <span className="font-medium">Section {enrolment.section}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 relative">
        <Button
          className={`w-full transition-all shadow-md font-semibold ${
            isSelected
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect()
          }}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Selected for Squad
            </>
          ) : (
            "Add to Squad"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default UserCard
