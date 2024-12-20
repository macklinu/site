import { formatISO } from 'date-fns'

export function isoDate(date: Date) {
  return formatISO(date, { representation: 'date' })
}

export function longDate(date: Date) {
  return date.toLocaleDateString('en-US', { dateStyle: 'long' })
}
