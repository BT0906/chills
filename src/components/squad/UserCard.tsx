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
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
}

const formatDay = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

const UserCard = ({ student, isSelected, onToggleSelect, courseColors, commonCoursesIntersection }: UserCardProps) => {
  const [showDetails, setShowDetails] = useState(false)
  const [showAllClasses, setShowAllClasses] = useState(false)

  const commonCourseClasses = student.enrolments.filter((enrolment) => student.commonCourses.includes(enrolment.course))
  const nonCommonCourseClasses = student.enrolments.filter(
    (enrolment) => !student.commonCourses.includes(enrolment.course),
  )

  const displayedClasses = showAllClasses
    ? student.enrolments
    : commonCourseClasses.length > 0
      ? commonCourseClasses
      : student.enrolments

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card
        className={`group transition-all duration-300 hover:shadow-xl cursor-pointer relative overflow-hidden ${
          isSelected ? "ring-2 ring-primary shadow-lg" : ""
        }`}
        onClick={onToggleSelect}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          initial={false}
        />

        <CardHeader className="pb-4 relative">
          <div className="flex items-start gap-4">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}>
              <Avatar className="h-20 w-20 ring-2 ring-background shadow-lg">
                <AvatarImage src={student.profile_url || "/placeholder.svg"} alt={student.first_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-xl">
                  {student.first_name[0]}
                  {student.last_name[0]}
                </AvatarFallback>
              </Avatar>
            </motion.div>

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
                <motion.div
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs shadow-md border-0 whitespace-nowrap">
                    <Calendar className="h-3 w-3 mr-1" />
                    Same Day
                  </Badge>
                </motion.div>
              )}
              {student.sameTutorial && (
                <motion.div
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs shadow-md border-0 whitespace-nowrap">
                    <Users className="h-3 w-3 mr-1" />
                    Tutorial
                  </Badge>
                </motion.div>
              )}
              {student.timeOverlap && !student.sameTutorial && (
                <motion.div
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.05 }}
                >
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs shadow-md border-0 whitespace-nowrap">
                    <Clock className="h-3 w-3 mr-1" />
                    Time
                  </Badge>
                </motion.div>
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
                Courses <span className="text-muted-foreground">({student.allCourses.length})</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {student.allCourses.map((courseData, index) => {
                const colors = courseColors[courseData.course] || {
                  bg: "bg-gray-500/15",
                  text: "text-gray-700",
                  border: "border-gray-500/30",
                }
                const isCommon = courseData.isCommon
                const isHighlighted = commonCoursesIntersection.includes(courseData.course)
                return (
                  <motion.div
                    key={courseData.course}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge
                      className={`text-xs font-bold px-3 py-1.5 border-2 shadow-sm transition-all ${
                        isCommon
                          ? `${colors.bg} ${colors.text} ${colors.border}`
                          : "bg-muted/30 text-muted-foreground/50 border-muted-foreground/20"
                      } ${isHighlighted ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background scale-105" : ""}`}
                    >
                      {courseData.course}
                    </Badge>
                  </motion.div>
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
                {nonCommonCourseClasses.length > 0 && (
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
                  const isCommonCourse = student.commonCourses.includes(enrolment.course)
                  const courseColor = courseColors[enrolment.course] || {
                    bg: "bg-gray-500/15",
                    text: "text-gray-700",
                    border: "border-gray-500/30",
                  }
                  return (
                    <motion.div
                      key={idx}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`rounded-lg px-3 py-2.5 transition-all border-2 ${
                        isCommonCourse
                          ? `${courseColor.bg} ${courseColor.border} shadow-sm`
                          : "bg-muted/20 border-muted-foreground/10 opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`font-bold text-sm ${isCommonCourse ? courseColor.text : "text-muted-foreground/70"}`}
                        >
                          {enrolment.course}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${isCommonCourse ? `${courseColor.border} ${courseColor.text}` : "border-muted-foreground/20 text-muted-foreground/60"}`}
                        >
                          {enrolment.class_type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`flex items-center gap-2 text-xs ${isCommonCourse ? "text-muted-foreground" : "text-muted-foreground/50"}`}
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
                          className={`flex items-center gap-2 text-xs ${isCommonCourse ? "text-muted-foreground" : "text-muted-foreground/50"}`}
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
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4 relative">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
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
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default UserCard
