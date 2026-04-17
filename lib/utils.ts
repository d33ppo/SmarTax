import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRM(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
