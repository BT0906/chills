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

interface Profile {
  zid: string;
  first_name: string;
  last_name: string;
  profile_url: string;
  degree: string;
  gender: string;
  age: number;
  bio: string;
  user_id: string; // Auth UUID needed for squad creation
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
  userId: string;
  zid: string;
  first_name: string;
  user_id: string; // Auth UUID for squad creation
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
        userId: userResult.data.userId,
        zid: profile.zid,
        first_name: profile.first_name,
        user_id: userResult.data.userId, // Auth UUID
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
            user_id: classmate.user_id, // Auth UUID needed for squad creation
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

  const handleFormSquad = async () => {
    if (!currentUser || !squadCourse) {
      console.error("❌ Missing required data for squad creation");
      return;
    }

    // Filter to only selected students
    const selectedStudents = students.filter((s) =>
      selectedUsers.includes(s.zid)
    );

    // Map to squad input
    const squadInput: CreateSquadInput = {
      name: `${currentUser.first_name}'s ${squadCourse} Squad`, // Better naming
      description: `Study squad for ${squadCourse}`,
      course: squadCourse,
      creator_id: currentUser.user_id, // Use auth UUID for creator_id
      user_ids: selectedStudents.map((s) => s.user_id), // 👈 use user_id (auth UUID) instead of zid
    };

    console.log("[v0] Squad payload:", squadInput);

    // Call your SQL RPC
    const result = await createSquad(squadInput);

    if (result.success) {
      console.log("✅ Squad created with ID:", result.squad_id);
      // Clear selections
      setSelectedUsers([]);
      // Navigate to the new squad (you can add navigation here later)
      // window.location.href = `/squads/${result.squad_id}`;
      alert(
        `Squad "${name}" created successfully! Squad ID: ${result.squad_id}`
      );
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  SquadUp
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground leading-tight">
                  {squadCourse
                    ? `Forming squad for ${squadCourse}`
                    : "Find your perfect study squad"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {currentUser.first_name}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                {currentUser.zid}
              </p>
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
              <h3 className="text-xs font-semibold text-foreground shrink-0">
                Filters:
              </h3>
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
                    };
                    const isDisabled =
                      selectedUsers.length > 0 &&
                      !commonCoursesIntersection.includes(course);
                    const isActive = filterCourse.includes(course);

                    const button = (
                      <button
                        key={course}
                        onClick={() => toggleCourseFilter(course)}
                        disabled={isDisabled}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 ${
                          isDisabled
                            ? "bg-muted/50 text-muted-foreground/40 border-border/30 cursor-not-allowed opacity-50"
                            : isActive
                            ? `${colors.bg} ${colors.text} ${colors.border} shadow-md`
                            : "bg-background text-muted-foreground border-border hover:border-foreground/20 opacity-60 hover:opacity-100"
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
                              No selected students have {course} in common
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return button;
                  })}
                </div>
              </TooltipProvider>

              <div className="w-px bg-border shrink-0" />

              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => setShowSameDay(!showSameDay)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                    showSameDay
                      ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  Same Day
                </button>
                <button
                  onClick={() => setShowSameTutorial(!showSameTutorial)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                    showSameTutorial
                      ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  Same Tutorial
                </button>
                <button
                  onClick={() => setShowTimeOverlap(!showTimeOverlap)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                    showTimeOverlap
                      ? "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  Time Match
                </button>
              </div>

              <div className="w-px bg-border shrink-0" />

              <div className="flex gap-1.5 shrink-0">
                {["Male", "Female", "Other"].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => toggleGenderFilter(gender)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                      filterGender.includes(gender)
                        ? "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 shadow-md"
                        : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>

              <div className="w-px bg-border shrink-0" />

              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => setSortBy("commonCourses")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                    sortBy === "commonCourses"
                      ? "bg-primary/15 text-primary border-primary/30 shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  Most Courses
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 whitespace-nowrap ${
                    sortBy === "name"
                      ? "bg-primary/15 text-primary border-primary/30 shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                  }`}
                >
                  Name A-Z
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found{" "}
            <span className="font-semibold text-foreground">
              {filteredStudents.length}
            </span>{" "}
            {filteredStudents.length === 1 ? "student" : "students"}
          </p>
          {selectedUsers.length > 0 && (
            <Badge variant="default" className="px-3 py-1">
              {selectedUsers.length} selected
            </Badge>
          )}
        </div>

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

        {filteredStudents.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No students found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <SelectedUsersBar
            selectedUsers={selectedUsers}
            students={students}
            onRemove={(zid) =>
              setSelectedUsers((prev) => prev.filter((id) => id !== zid))
            }
            onFormSquad={handleFormSquad}
            squadCourse={squadCourse}
            commonCoursesIntersection={commonCoursesIntersection}
            currentUserId={currentUser.userId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SquadFormation;
