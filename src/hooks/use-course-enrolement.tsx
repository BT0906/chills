import { useEffect, useState } from "react";
import { CourseGroup } from "@/types/user";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const useCourseStats = (userId: string | undefined) => {
  const [courses, setCourses] = useState<CourseGroup[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCourseData() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('enrolment_grouped_by_user')
          .select('courses')
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        if (data && data.courses) {
          const coursesData = data.courses as CourseGroup[];
          setCourses(coursesData);
          
          // Calculate total number of classes across all courses
          const total = coursesData.reduce(
            (sum, course) => sum + course.enrolments.length, 
            0
          );
          setTotalClasses(total);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, [userId, supabase]);

  return { courses, totalClasses, loading };
}
