import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInMonths, differenceInYears, format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Calculate child age from DOB */
export function getChildAge(dob: string): { years: number; months: number; label: string } {
  const birthDate = parseISO(dob)
  const now = new Date()
  const years = differenceInYears(now, birthDate)
  const totalMonths = differenceInMonths(now, birthDate)
  const months = totalMonths % 12

  if (years === 0) {
    return { years: 0, months, label: `${months}mo` }
  }
  return {
    years,
    months,
    label: months > 0 ? `${years}y ${months}mo` : `${years}y`,
  }
}

/** Format date for display */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/** Generate reading time estimate */
export function readingTime(text: string): string {
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  return `${minutes} min read`
}

/** Generate initials from name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Category color mapping for organ discovery */
export const organColors: Record<string, { bg: string; text: string; border: string }> = {
  heart: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  brain: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  lungs: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
  eyes: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  ears: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  digestive: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  skin: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  muscles: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  immune: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
  hormones: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  kidneys: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
  learning: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  language: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  emotions: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-200' },
  movement: { bg: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-200' },
  senses: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
}

/** Blog category colors */
export const blogCategoryColors: Record<string, string> = {
  "Parent's Corner": 'bg-pink-100 text-pink-700',
  'Expert Talks': 'bg-purple-100 text-purple-700',
  'School Hub': 'bg-blue-100 text-blue-700',
  'Health Tips': 'bg-green-100 text-green-700',
  'Nutrition': 'bg-orange-100 text-orange-700',
  'Development': 'bg-teal-100 text-teal-700',
}
