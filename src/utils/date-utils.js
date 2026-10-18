/**
 * Persian date and time formatting utilities.
 */

export const PERSIAN_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
]

/**
 * Returns the current Persian day of the week index (0 = شنبه, 6 = جمعه).
 */
export function getPersianDayIndex(date = new Date()) {
  const jsDay = date.getDay()
  return (jsDay + 1) % 7
}

/**
 * Formats a Date or ISO date string into Persian solar date (e.g. "۲۷ مهر ۱۴۰۵").
 */
export function formatPersianDate(inputDate) {
  if (!inputDate) return ''
  const date = typeof inputDate === 'string' ? new Date(inputDate) : inputDate
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch {
    return date.toLocaleDateString()
  }
}

/**
 * Formats duration in milliseconds or seconds into HH:MM:SS or MM:SS.
 */
export function formatDuration(duration, isSeconds = false) {
  const totalSeconds = Math.floor(isSeconds ? duration : duration / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n) => String(n).padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

/**
 * Formats byte size into human readable Persian format.
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '۰ بایت'
  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1))
  return `${val.toLocaleString('fa-IR')} ${sizes[i]}`
}

