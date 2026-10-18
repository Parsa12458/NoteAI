import { describe, it, expect } from 'vitest'
import { findSuggestedCourseFromTimetable } from '../utils/timetable-utils'
import { getPersianDayIndex } from '../utils/date-utils'

describe('Timetable Course Suggestion Utility', () => {
  const mockCourses = [
    {
      id: 'math-101',
      name: 'ریاضی مهندسی',
      timetableSlots: [
        { day: 0, dayName: 'شنبه', startTime: '08:00', endTime: '10:00', room: '۱۰۱' },
      ],
    },
    {
      id: 'ai-201',
      name: 'هوش مصنوعی',
      timetableSlots: [
        { day: 1, dayName: 'یکشنبه', startTime: '10:00', endTime: '12:00', room: '۱۰۲' },
      ],
    },
  ]

  it('suggests an active class if time is within schedule on that Persian day', () => {
    // Saturday at 08:30
    // Date constructor: month is 0-indexed (9 = Oct)
    // 2026-10-17 is a Saturday (verify: (jsDay + 1) % 7)
    const saturday = new Date(2026, 9, 17, 8, 30) // Oct 17, 2026 is Saturday
    expect(getPersianDayIndex(saturday)).toBe(0) // شنبه

    const suggestion = findSuggestedCourseFromTimetable(mockCourses, saturday)
    expect(suggestion).toBeDefined()
    expect(suggestion.isCurrent).toBe(true)
    expect(suggestion.course.id).toBe('math-101')
  })

  it('suggests an upcoming class if within 45 minutes of start', () => {
    const saturdayBeforeClass = new Date(2026, 9, 17, 7, 40) // 20 mins before 8:00
    const suggestion = findSuggestedCourseFromTimetable(mockCourses, saturdayBeforeClass)
    expect(suggestion).toBeDefined()
    expect(suggestion.isUpcoming).toBe(true)
    expect(suggestion.course.id).toBe('math-101')
  })

  it('returns null if no class matches day and time', () => {
    const fridayOff = new Date(2026, 9, 16, 14, 0) // Friday
    const suggestion = findSuggestedCourseFromTimetable(mockCourses, fridayOff)
    expect(suggestion).toBeNull()
  })
})

