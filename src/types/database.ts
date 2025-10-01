import type { Database, Tables, Enums } from "./database.types"

// Re-export the generated types
export type { Database, Tables, Enums }

// Helper type aliases for easier usage
export type Profile = Tables<"profile">
export type Enrolment = Tables<"enrolment">
export type Room = Tables<"room">
export type Squad = Tables<"squad">
export type Member = Tables<"member">
export type ClassType = Enums<"class_type">

// View types
export type StudentWithEnrolments = Tables<"student_with_enrolments">

export interface EnrolmentData {
  id: number
  user_id: string
  course: string
  class: ClassType
  section: string | null
  start_time: string
  end_time: string
  room_id: string
}

export interface EnrichedStudent extends Omit<StudentWithEnrolments, "enrolments"> {
  enrolments: EnrolmentData[]
  commonCourses: string[]
  sameTutorial: boolean
  timeOverlap: boolean
}
