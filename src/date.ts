import { formatISO } from 'date-fns'

export function isoDate(date: Date) {
  return formatISO(date, { representation: 'date' })
}
