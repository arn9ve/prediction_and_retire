import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function calculateDateRange(historicalData: { date: string }[]) {
  if (!historicalData?.length) return null
  
  const dates = historicalData.map(d => new Date(d.date))
  return {
    start: dates[0],
    end: dates[dates.length - 1]
  }
}
