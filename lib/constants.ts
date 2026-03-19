// lib/constants.ts
import type { Category } from './types'

export const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, { badge: string; text: string }> = {
  Interpretability:    { badge: 'text-sky-700 bg-sky-50',    text: 'text-sky-700' },
  Alignment:           { badge: 'text-olive bg-green-50',     text: 'text-olive' },
  'Societal Impacts':  { badge: 'text-clay bg-orange-50',     text: 'text-clay' },
  'Frontier Red Team': { badge: 'text-slate-700 bg-slate-100', text: 'text-slate-700' },
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
