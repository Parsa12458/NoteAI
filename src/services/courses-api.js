import { apiRequest, isMockMode } from '../lib/api-client'
import { MOCK_COURSES } from './mock-data'

const LOCAL_COURSES_STORAGE_KEY = 'noteai_user_courses'

function getLocalUserCourses() {
  try {
    const raw = localStorage.getItem(LOCAL_COURSES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalUserCourses(courses) {
  try {
    localStorage.setItem(LOCAL_COURSES_STORAGE_KEY, JSON.stringify(courses))
  } catch {
    // Ignore storage errors
  }
}

export async function fetchCourses() {
  if (isMockMode()) {
    // Merge predefined fixtures with any newly created user courses
    const userCourses = getLocalUserCourses()
    return [...userCourses, ...MOCK_COURSES]
  }
  return apiRequest('/courses')
}

export async function fetchCourseById(courseId) {
  if (isMockMode()) {
    const all = await fetchCourses()
    const found = all.find((c) => c.id === courseId)
    if (!found) {
      throw new Error(`درس با شناسه "${courseId}" یافت نشد.`)
    }
    return found
  }
  return apiRequest(`/courses/${courseId}`)
}

export async function createCourse(courseData) {
  if (isMockMode()) {
    const newCourse = {
      id: `course-${Date.now()}`,
      name: courseData.name,
      code: courseData.code || 'GEN-101',
      instructor: courseData.instructor || 'استاد مدعو',
      department: courseData.department || 'دانشکده فنی',
      description: courseData.description || '',
      color: courseData.color || '#4f46e5',
      icon: courseData.icon || 'BookOpen',
      sessionsCount: 0,
      lastSessionDate: new Date().toISOString(),
      timetableSlots: courseData.timetableSlots || [],
    }
    const current = getLocalUserCourses()
    saveLocalUserCourses([newCourse, ...current])
    return newCourse
  }
  return apiRequest('/courses', {
    method: 'POST',
    body: courseData,
  })
}

export async function fetchTimetable() {
  if (isMockMode()) {
    const courses = await fetchCourses()
    const slots = []
    for (const course of courses) {
      if (course.timetableSlots) {
        for (const slot of course.timetableSlots) {
          slots.push({
            ...slot,
            courseId: course.id,
            courseName: course.name,
            instructor: course.instructor,
          })
        }
      }
    }
    return slots
  }
  return apiRequest('/timetable')
}

