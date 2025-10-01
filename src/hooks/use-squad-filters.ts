"use client"

import { useState, useMemo, useEffect } from "react"
import type { EnrichedStudent } from "@/types/database"

interface UseSquadFiltersOptions {
  students: EnrichedStudent[]
  currentUserCourses: string[]
}

export function useSquadFilters({ students, currentUserCourses }: UseSquadFiltersOptions) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCourse, setFilterCourse] = useState<string[]>([])
  const [showSameTutorial, setShowSameTutorial] = useState(false)
  const [showTimeOverlap, setShowTimeOverlap] = useState(false)
  const [sortBy, setSortBy] = useState<"commonCourses" | "name">("commonCourses")

  // Calculate intersection of common courses across all selected students
  const commonCoursesIntersection = useMemo(() => {
    if (selectedUsers.length === 0) return []

    const selectedStudents = students.filter((s) => selectedUsers.includes(s.zid))
    if (selectedStudents.length === 0) return []

    let intersection = new Set(selectedStudents[0].commonCourses)

    for (let i = 1; i < selectedStudents.length; i++) {
      const studentCourses = new Set(selectedStudents[i].commonCourses)
      intersection = new Set([...intersection].filter((course) => studentCourses.has(course)))
    }

    return Array.from(intersection)
  }, [selectedUsers, students])

  // Auto-update filters when selection changes
  useEffect(() => {
    if (selectedUsers.length === 0) {
      setFilterCourse([])
    } else {
      setFilterCourse(commonCoursesIntersection)
    }
  }, [selectedUsers, commonCoursesIntersection])

  // Determine the squad course (single course for the squad)
  const squadCourse = useMemo(() => {
    if (filterCourse.length === 1) return filterCourse[0]
    if (commonCoursesIntersection.length === 1) return commonCoursesIntersection[0]
    return null
  }, [filterCourse, commonCoursesIntersection])

  // Toggle user selection
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

  // Toggle course filter
  const toggleCourseFilter = (course: string) => {
    if (selectedUsers.length > 0 && !commonCoursesIntersection.includes(course)) {
      return // Don't allow toggling disabled filters
    }
    setFilterCourse((prev) => (prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]))
  }

  // Deselect all users
  const deselectAll = () => {
    setSelectedUsers([])
    setFilterCourse([])
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilterCourse([])
    setShowSameTutorial(false)
    setShowTimeOverlap(false)
    setSearchQuery("")
  }

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.zid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.degree.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (filterCourse.length > 0) {
        const hasCourse = student.commonCourses.some((course) => filterCourse.includes(course))
        if (!hasCourse) return false
      }

      if (showSameTutorial && !student.sameTutorial) return false
      if (showTimeOverlap && !student.timeOverlap) return false

      return true
    })

    // Sort
    if (sortBy === "commonCourses") {
      filtered.sort((a, b) => b.commonCourses.length - a.commonCourses.length)
    } else {
      filtered.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`))
    }

    return filtered
  }, [students, searchQuery, filterCourse, showSameTutorial, showTimeOverlap, sortBy])

  const activeFilterCount = filterCourse.length + (showSameTutorial ? 1 : 0) + (showTimeOverlap ? 1 : 0)

  return {
    selectedUsers,
    searchQuery,
    filterCourse,
    showSameTutorial,
    showTimeOverlap,
    sortBy,
    commonCoursesIntersection,
    squadCourse,
    filteredStudents,
    activeFilterCount,
    setSearchQuery,
    setShowSameTutorial,
    setShowTimeOverlap,
    setSortBy,
    toggleUserSelection,
    toggleCourseFilter,
    deselectAll,
    clearAllFilters,
  }
}
