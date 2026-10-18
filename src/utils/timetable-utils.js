import { getPersianDayIndex, PERSIAN_DAYS } from './date-utils'

/**
 * Parses time string "HH:MM" into total minutes from start of day.
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + (m || 0)
}

/**
 * Suggests the active or upcoming course based on the weekly timetable.
 * Advisory only, allows manual override.
 *
 * @param {Array} courses
 * @param {Date} [now=new Date()]
 * @returns {Object|null} { course, slot, isCurrent, isUpcoming, timeStatus }
 */
export function findSuggestedCourseFromTimetable(courses = [], now = new Date()) {
  const currentPersianDay = getPersianDayIndex(now)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  let activeMatch = null
  let upcomingMatch = null
  let minUpcomingDiff = Infinity

  for (const course of courses) {
    if (!course.timetableSlots) continue

    for (const slot of course.timetableSlots) {
      if (slot.day === currentPersianDay) {
        const startMin = timeToMinutes(slot.startTime)
        const endMin = timeToMinutes(slot.endTime)

        // Case 1: Class is actively in progress right now
        if (currentMinutes >= startMin - 5 && currentMinutes <= endMin) {
          activeMatch = {
            course,
            slot,
            isCurrent: true,
            isUpcoming: false,
            dayName: PERSIAN_DAYS[currentPersianDay],
            timeStatus: `کلاس در حال برگزاری (${slot.startTime} تا ${slot.endTime})`,
          }
          return activeMatch // immediate match
        }

        // Case 2: Class starts in the next 45 minutes
        if (startMin > currentMinutes && startMin - currentMinutes <= 45) {
          const diff = startMin - currentMinutes
          if (diff < minUpcomingDiff) {
            minUpcomingDiff = diff
            upcomingMatch = {
              course,
              slot,
              isCurrent: false,
              isUpcoming: true,
              dayName: PERSIAN_DAYS[currentPersianDay],
              timeStatus: `شروع تا ${diff} دقیقه دیگر (${slot.startTime})`,
            }
          }
        }
      }
    }
  }

  return upcomingMatch
}

