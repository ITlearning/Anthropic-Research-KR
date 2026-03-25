// lib/constants.ts
import type { Category } from './types'

export const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, { badge: string; text: string }> = {
  Interpretability:     { badge: 'text-sky-700 bg-sky-50',      text: 'text-sky-700' },
  Alignment:            { badge: 'text-olive bg-green-50',       text: 'text-olive' },
  'Societal Impacts':   { badge: 'text-clay bg-orange-50',       text: 'text-clay' },
  'Economic Research':  { badge: 'text-emerald-700 bg-emerald-50', text: 'text-emerald-700' },
  Policy:               { badge: 'text-violet-700 bg-violet-50', text: 'text-violet-700' },
  Science:              { badge: 'text-cyan-700 bg-cyan-50',     text: 'text-cyan-700' },
  Announcements:        { badge: 'text-amber-700 bg-amber-50',   text: 'text-amber-700' },
  Product:              { badge: 'text-rose-700 bg-rose-50',     text: 'text-rose-700' },
  'Frontier Red Team':  { badge: 'text-slate-700 bg-slate-100',  text: 'text-slate-700' },
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
