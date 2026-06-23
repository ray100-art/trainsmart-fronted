import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  const normalized = date.includes('T') ? date.split('T')[0] : date
  return new Date(normalized + 'T00:00:00').toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  if (error && typeof error === 'object' && 'response' in error) {
    const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((d) => (typeof d === 'object' && d && 'msg' in d ? String(d.msg) : String(d))).join(', ')
    }
  }
  if (error instanceof Error) return error.message
  return fallback
}
