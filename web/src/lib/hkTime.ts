import { addMonths, format, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

export const HK_TZ = 'Asia/Hong_Kong'

export const todayHk = () => formatInTimeZone(new Date(), HK_TZ, 'yyyy-MM-dd')

export const monthStartHk = (date: Date) =>
  formatInTimeZone(date, HK_TZ, 'yyyy-MM-01')

export const nextMonthStartHk = (date: Date) => {
  const start = parseISO(monthStartHk(date))
  const next = addMonths(start, 1)
  return format(next, 'yyyy-MM-dd')
}

export const monthLabelHk = (date: Date) =>
  formatInTimeZone(date, HK_TZ, 'MMM yyyy')
