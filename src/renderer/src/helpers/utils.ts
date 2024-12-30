import type { MantineColor } from '@mantine/core'
import { type DateArg, format } from 'date-fns'

export function truncateString(str, maxLength) {
  return str.length > maxLength ? `${str.slice(0, maxLength - 3)}...` : str
}

export function joinNames(
  first: string,
  last: string,
  mid?: string,
  suffix?: string,
  isLastFirst = false,
  isFull = false
) {
  return isLastFirst
    ? `${last}${suffix ? ` ${suffix}` : ''}, ${first}${mid ? ` ${isFull ? mid : `${mid.at(0)}.`}` : ''}`
    : `${first}${mid ? ` ${isFull ? mid : `${mid.at(0)}.`}` : ''} ${last}${suffix ? ` ${suffix}` : ''}`
}

export function formatMoney(value: number) {
  return Intl.NumberFormat('en-PH', {
    currency: 'PHP',
    style: 'currency',
  }).format(value)
}

export function formatDate(date: DateArg<Date> & {}) {
  return format(date, 'PPp')
}

export function getStatus(totalDue: number, totalPaid: number) {
  if (totalPaid === 0) return 'pending'
  if (totalPaid < totalDue) return 'partial'

  return 'paid'
}

export function calcBalance(totalDue: number, totalPaid: number) {
  return totalDue > totalPaid ? totalDue - totalPaid : 0
}

export function isPaid(totalDue: number, totalPaid: number) {
  return calcBalance(totalDue, totalPaid) === 0
}

export const statusColors: Record<string, MantineColor> = {
  pending: 'gray',
  partial: 'orange',
  paid: 'green',
}
