import { DateTime } from 'luxon'

export function isoDate(date: Date) {
  return DateTime.fromJSDate(date, { zone: 'utc' }).toISODate()
}

export function longDate(date: Date) {
  return date.toLocaleDateString('en-US', { dateStyle: 'long' })
}
