"use client";

import { findClassmates, getCurrentUser } from "@/app/actions/discovery";
import SelectedUsersBar from "@/components/squad/SelectedUsersBar";
import UserCard from "@/components/squad/UserCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateCourseColor } from "@/lib/utils"; // Import color generation function
import { CreateSquadInput } from "@/types/squad";
import { AnimatePresence } from "framer-motion";
import { Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createSquad } from "../actions/create-squad";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Profile {
  id: string; // Profile ID
  zid: string;
  first_name: string;
  last_name: string;
  profile_url: string;
  degree: string;
  gender: string;
  age: number;
  bio: string;
  user_id: string; // Auth UUID
}

interface Enrolment {
  course: string;
  class_type: "lec" | "tut" | "lab";
  section: string;
  start_time: string;
  end_time: string;
  room_id: string;
}

interface ApiEnrolment {
  course: string;
  class: string;
  section: string | null;
  start_time: string;
  end_time: string;
}

interface CourseWithCommonFlag {
  course: string;
  isCommon: boolean;
  enrolments: Enrolment[];
}

interface Student extends Profile {
  enrolments: Enrolment[];
  commonCourses: string[];
  allCourses: CourseWithCommonFlag[];
  sameTutorial: boolean;
  timeOverlap: boolean;
  sameDayAtUni: boolean;
}

interface CurrentUser {
  auth_id: string;      // auth.users.id
  profile_id: string;   // profile.id
  zid: string;
  first_name: string;
  courses: string[];
  enrolments: Array<{
    course: string;
    class: string;
    section: string | null;
    start_time: string;
    end_time: string;
  }>;
}

const SquadFormation = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState<string[]>([]);
  const [showSameTutorial, setShowSameTutorial] = useState(false);
  const [showTimeOverlap, setShowTimeOverlap] = useState(false);
  const [showSameDay, setShowSameDay] = useState(false);
  const [filterGender, setFilterGender] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"commonCourses" | "name">(
    "commonCourses"
  );

  const courseColors = useMemo(() => {
    if (!currentUser) return {};
    const colors: Record<string, { bg: string; text: string; border: string }> =
      {};
    currentUser.courses.forEach((course) => {
      colors[course] = generateCourseColor(course);
    });
    return colors;
  }, [currentUser]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      // Get current user
      const userResult = await getCurrentUser();
      if (!userResult.success) {
        setError(userResult.error);
        setIsLoading(false);
        return;
      }

      const { profile, enrolments } = userResult.data;

      // Extract unique courses from enrolments
      const userCourses = Array.from(
        new Set(enrolments.map((e: any) => e.course))
      );

      const userClassDays = new Set(
        enrolments.map(
          (e: any) => new Date(e.start_time).toISOString().split("T")[0]
        )
      );

      const user: CurrentUser = {
        auth_id: userResult.data.userId,   // comes from Supabase auth
        profile_id: profile.id,            // comes from profiles table
        zid: profile.zid,
        first_name: profile.first_name,
        courses: userCourses,
        enrolments: enrolments.map((e: any) => ({
          course: e.course,
          class: e.class,
          section: e.section,
          start_time: e.start_time,
          end_time: e.end_time,
        })),
      };
      setCurrentUser(user);

      // Get classmates
      const classmatesResult = await findClassmates(userResult.data.userId);
      if (!classmatesResult.success) {
        setError(classmatesResult.error);
        setIsLoading(false);
        return;
      }

      // Transform classmates data to match Student interface
      const transformedStudents: Student[] = classmatesResult.data.map(
        (classmate: any) => {
          const allCoursesMap = new Map<string, Enrolment[]>();
          classmate.courses.forEach((c: any) => {
            const courseEnrolments = c.enrolments.map((e: any) => ({
              course: c.course,
              class_type: e.class as "lec" | "tut" | "lab",
              section: e.section || "",
              start_time: e.start_time,
              end_time: e.end_time,
              room_id: e.room_id,
            }));
            allCoursesMap.set(c.course, courseEnrolments);
          });

          const courses = Array.from(allCoursesMap.keys());
          const commonCourses = courses.filter((course: string) =>
            userCourses.includes(course)
          );

          const allCourses: CourseWithCommonFlag[] = courses.map((course) => ({
            course,
            isCommon: userCourses.includes(course),
            enrolments: allCoursesMap.get(course) || [],
          }));

          // Flatten enrolments
          const allEnrolments = Array.from(allCoursesMap.values()).flat();

          // Check if same tutorial
          const sameTutorial = user.enrolments.some((userEnrol) =>
            allEnrolments.some(
              (classEnrol) =>
                userEnrol.course === classEnrol.course &&
                userEnrol.class === "tut" &&
                classEnrol.class_type === "tut" &&
                userEnrol.section === classEnrol.section
            )
          );

          // Check if time overlap
          const timeOverlap = user.enrolments.some((userEnrol) =>
            allEnrolments.some((classEnrol) => {
              if (userEnrol.course !== classEnrol.course) return false;

              const userStart = new Date(userEnrol.start_time).getTime();
              const userEnd = new Date(userEnrol.end_time).getTime();
              const classStart = new Date(classEnrol.start_time).getTime();
              const classEnd = new Date(classEnrol.end_time).getTime();

              // Check if times overlap
              return userStart < classEnd && classStart < userEnd;
            })
          );

          const classmateClassDays = new Set(
            allEnrolments.map(
              (e) => new Date(e.start_time).toISOString().split("T")[0]
            )
          );
          const sameDayAtUni = Array.from(userClassDays).some((day) =>
            classmateClassDays.has(day)
          );

          return {
            id: classmate.id, // Profile ID
            zid: classmate.zid,
            first_name: classmate.first_name,
            last_name: classmate.last_name,
            profile_url:
              classmate.profile_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${classmate.first_name}`,
            degree: classmate.degree,
            gender: classmate.gender,
            age: classmate.age || 0,
            bio: classmate.bio,
            user_id: classmate.user_id, // Auth UUID
            enrolments: allEnrolments,
            commonCourses,
            allCourses,
            sameTutorial,
            timeOverlap,
            sameDayAtUni,
          };
        }
      );

      setStudents(transformedStudents);
      setIsLoading(false);
    }

    loadData();
  }, []);

  const commonCoursesIntersection = useMemo(() => {
    if (selectedUsers.length === 0) return [];

    const selectedStudents = students.filter((s) =>
      selectedUsers.includes(s.zid)
    );
    let intersection = new Set(selectedStudents[0].commonCourses);

    for (let i = 1; i < selectedStudents.length; i++) {
      const studentCourses = new Set(selectedStudents[i].commonCourses);
      intersection = new Set(
        [...intersection].filter((course) => studentCourses.has(course))
      );
    }

    return Array.from(intersection);
  }, [selectedUsers, students]);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      setFilterCourse([]);
    } else {
      setFilterCourse(commonCoursesIntersection);
    }
  }, [selectedUsers, commonCoursesIntersection]);

  const squadCourse = useMemo(() => {
    console.log("[DEBUG] filterCourse:", filterCourse);
    console.log(
      "[DEBUG] commonCoursesIntersection:",
      commonCoursesIntersection
    );

    if (filterCourse.length === 1) return filterCourse[0];
    if (commonCoursesIntersection.length === 1)
      return commonCoursesIntersection[0];
    return null;
  }, [filterCourse, commonCoursesIntersection]);

  const toggleUserSelection = (zid: string) => {
    setSelectedUsers((prev) => {
      const isCurrentlySelected = prev.includes(zid);

      if (isCurrentlySelected) {
        return prev.filter((id) => id !== zid);
      } else {
        return [...prev, zid];
      }
    });
  };

  const toggleCourseFilter = (course: string) => {
    if (
      selectedUsers.length > 0 &&
      !commonCoursesIntersection.includes(course)
    ) {
      return; // Don't allow toggling disabled filters
    }
    setFilterCourse((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course]
    );
  };

  const toggleGenderFilter = (gender: string) => {
    setFilterGender((prev) =>
      prev.includes(gender)
        ? prev.filter((g) => g !== gender)
        : [...prev, gender]
    );
  };

  const deselectAll = () => {
    setSelectedUsers([]);
    setFilterCourse([]);
  };

  const clearAllFilters = () => {
    setFilterCourse([]);
    setShowSameTutorial(false);
    setShowTimeOverlap(false);
    setShowSameDay(false);
    setFilterGender([]);
    setSearchQuery("");
  };

  const activeFilterCount =
    filterCourse.length +
    (showSameTutorial ? 1 : 0) +
    (showTimeOverlap ? 1 : 0) +
    (showSameDay ? 1 : 0) +
    filterGender.length;

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.zid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.degree.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCourse.length > 0) {
      const hasSelectedCourse = student.allCourses.some((courseData) =>
        filterCourse.includes(courseData.course)
      );
      if (!hasSelectedCourse) return false;
    }

    if (showSameTutorial && !student.sameTutorial) return false;

    if (showTimeOverlap && !student.timeOverlap) return false;

    if (showSameDay && !student.sameDayAtUni) return false;

    if (filterGender.length > 0 && !filterGender.includes(student.gender))
      return false;

    return true;
  });

  const router = useRouter();

  const handleFormSquad = async (
    name: string,
    description: string,
    selectedCourse: string,
    currentUserId: string
  ) => {

    if (!currentUser || !selectedCourse) {
      console.error("❌ Missing required data for squad creation");
      console.error("❌ currentUser:", !!currentUser);
      console.error("❌ selectedCourse:", !!selectedCourse);
      return;
    }

    // Filter to only selected students
    const selectedStudents = students.filter((s) =>
      selectedUsers.includes(s.zid)
    );

    // Filter out students with null IDs
    const validSelectedStudents = selectedStudents.filter((s) => s.id);

    if (validSelectedStudents.length === 0) {
      alert(
        "Selected students don't have valid IDs. Please refresh the page and try again."
      );
      return;
    }

    // Map to squad input
    const squadInput: CreateSquadInput = {
      name,
      description,
      course: selectedCourse,
      creator_id: currentUser.auth_id,         // ✅ correct auth.users.id
      creator_profile_id: currentUser.profile_id, // ✅ correct profile.id
      user_ids: validSelectedStudents.map((s) => s.id), // invited profile IDs
    };

    console.log("[v0] Squad payload:", squadInput);

    // Call your SQL RPC
    const result = await createSquad(squadInput);

    if (result.success) {
      console.log("✅ Squad created with ID:", result.squad_id);

      // Clear selections
      setSelectedUsers([]);
  
      router.push(`/squad/${result.squad_id}`);
    } else {
      console.error("❌ Error creating squad:", result.error);
      alert(`Failed to create squad: ${result.error}`);
      throw new Error(result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading classmates...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-destructive/20 flex items-center justify-center">
            <X className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error || "Unable to fetch user data"}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-bsticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          {/* Search Bar */}
          <div className="mb-4">
            <Input
              placeholder="Search for someone's name or zID..."
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
  
          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
  
            {/* Course Filters */}
            <div className="flex gap-2 shrink-0">
              <TooltipProvider>
                {currentUser.courses.map((course) => {
                  const isDisabled =
                    selectedUsers.length > 0 &&
                    !commonCoursesIntersection.includes(course);
                  const isActive = filterCourse.includes(course);
  
                  const button = (
                    <button
                      key={course}
                      onClick={() => toggleCourseFilter(course)}
                      disabled={isDisabled}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isDisabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isActive
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {course}
                    </button>
                  );
  
                  if (isDisabled) {
                    return (
                      <Tooltip key={course}>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            No selected students have {course}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
  
                  return button;
                })}
              </TooltipProvider>
            </div>
  
            <div className="w-px h-6 bg-gray-200 shrink-0" />
  
            {/* Quick Filters */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowSameDay(!showSameDay)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  showSameDay
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Same Day
              </button>
              <button
                onClick={() => setShowSameTutorial(!showSameTutorial)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  showSameTutorial
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Same Tutorial
              </button>
              <button
                onClick={() => setShowTimeOverlap(!showTimeOverlap)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  showTimeOverlap
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Time Match
              </button>
            </div>
  
            <div className="w-px h-6 bg-gray-200 shrink-0" />
  
            {/* Gender Filters */}
            <div className="flex gap-2 shrink-0">
              {["Male", "Female", "Other"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => toggleGenderFilter(gender)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filterGender.includes(gender)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
  
            <div className="w-px h-6 bg-gray-200 shrink-0" />
  
            {/* Sort Options */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setSortBy("commonCourses")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  sortBy === "commonCourses"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Most Courses
              </button>
              <button
                onClick={() => setSortBy("name")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  sortBy === "name"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                A-Z
              </button>
            </div>
          </div>
        </div>
      </header>
  
      <main className="container mx-auto px-6 py-6">
        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {filteredStudents.length}
            </span>{" "}
            {filteredStudents.length === 1 ? "student" : "students"}
          </p>
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} selected
              </span>
              <button
                onClick={deselectAll}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Clear
              </button>
            </div>
          )}
        </div>
  
        {/* Student Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
          {filteredStudents.map((student) => (
            <UserCard
              key={student.zid}
              student={student}
              isSelected={selectedUsers.includes(student.zid)}
              onToggleSelect={() => toggleUserSelection(student.zid)}
              courseColors={courseColors}
              commonCoursesIntersection={commonCoursesIntersection}
              selectedCourses={filterCourse}
            />
          ))}
        </div>
  
        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-20">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No students found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your filters
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </main>
  
      {/* Selected Users Bar */}
      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <SelectedUsersBar
            selectedUsers={selectedUsers}
            students={students}
            onRemove={(zid) =>
              setSelectedUsers((prev) => prev.filter((id) => id !== zid))
            }
            onFormSquad={(name, description, selectedCourse, currentUserId) => {
              console.log(
                "[DEBUG] Button clicked! Calling handleFormSquad with:",
                { name, description, selectedCourse, currentUserId }
              );
              return handleFormSquad(
                name,
                description,
                selectedCourse,
                currentUserId
              );
            }}
            squadCourse={squadCourse}
            commonCoursesIntersection={commonCoursesIntersection}
            currentUserId={currentUser.profile_id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SquadFormation;
