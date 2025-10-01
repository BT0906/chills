"use client"

import { Check, Clock, Users, GraduationCap } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

interface Enrolment {
  course: string
  class_type: "lec" | "tut" | "lab"
  section: string
  start_time: string
  end_time: string
  room_id: string
}

interface Student {
  zid: string
  first_name: string
  last_name: string
  profile_url: string
  degree: string
  age: number
  bio: string
  enrolments: Enrolment[]
  commonCourses: string[]
  sameTutorial: boolean
  timeOverlap: boolean
}

interface UserCardProps {
  student: Student
  isSelected: boolean
  onToggleSelect: () => void
  courseColors: Record<string, { bg: string; text: string; border: string }>
  commonCoursesIntersection: string[]
}

const UserCard = ({ student, isSelected, onToggleSelect, courseColors, commonCoursesIntersection }: UserCardProps) => {
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

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
                  <AvatarImage src={student.profile_url || "/placeholder.svg"} alt={student.first_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                    {student.first_name[0]}
                    {student.last_name[0]}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
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
                <p className="text-xs text-muted-foreground">{student.zid}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {student.sameTutorial && (
                <motion.div
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs shadow-md border-0">
                    <Users className="h-3 w-3 mr-1" />
                    Same Tutorial
                  </Badge>
                </motion.div>
              )}
              {student.timeOverlap && !student.sameTutorial && (
                <motion.div
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.05 }}
                >
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs shadow-md border-0">
                    <Clock className="h-3 w-3 mr-1" />
                    Time Match
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 relative">
          <div className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-tight">{student.degree}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{student.bio}</p>
            </div>
          </div>

          {/* Common Courses */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
              Courses ({student.commonCourses.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {student.commonCourses.map((course, index) => {
                const colors = courseColors[course] || {
                  bg: "bg-gray-500/15",
                  text: "text-gray-700",
                  border: "border-gray-500/30",
                }
                const isCommon = commonCoursesIntersection.includes(course)
                return (
                  <motion.div
                    key={course}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge
                      className={`text-sm font-bold px-3 py-1 border-2 shadow-sm transition-all ${colors.bg} ${colors.text} ${colors.border} ${
                        isCommon ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background scale-105" : ""
                      }`}
                    >
                      {course}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {student.enrolments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Classes</p>
              <div className="space-y-1.5">
                {student.enrolments.slice(0, 2).map((enrolment, idx) => {
                  const isCommon = commonCoursesIntersection.includes(enrolment.course)
                  return (
                    <motion.div
                      key={idx}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 transition-colors ${
                        isCommon ? "bg-primary/10 border border-primary/30" : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <span className="font-medium text-foreground">
                        {enrolment.course}{" "}
                        <span className="text-muted-foreground">{enrolment.class_type.toUpperCase()}</span>
                      </span>
                      <span className="text-muted-foreground font-mono">{enrolment.section}</span>
                    </motion.div>
                  )
                })}
                {student.enrolments.length > 2 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    +{student.enrolments.length - 2} more
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 relative">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button
              className={`w-full transition-all shadow-md ${
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
                  Selected
                </>
              ) : (
                "Select for Squad"
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default UserCard
