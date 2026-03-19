'use client'

import { CATEGORIES } from '@/lib/types'
import type { Category } from '@/lib/types'

interface Props {
  active: Category
  onChange: (category: Category) => void
}

export function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`
            text-sm font-sans px-4 py-1.5 rounded-full border transition-colors
            ${active === cat
              ? 'bg-slate-custom-900 text-white border-slate-custom-900'
              : 'bg-white text-slate-custom-600 border-oat hover:border-slate-custom-400'
            }
          `}
        >
          {cat === 'All' ? 'All (전체)' : cat}
        </button>
      ))}
    </div>
  )
}
