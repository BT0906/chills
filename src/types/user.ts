export interface CourseEnrolment {
  id: number;
  user_id: string;
  course: string;
  class: string;
  section: string | null;
  start_time: string;
  end_time: string;
  room_id: string;
}

export interface CourseGroup {
  course: string;
  enrolments: CourseEnrolment[];
}
