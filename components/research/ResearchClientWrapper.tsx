'use client'

import { useState } from 'react'
import { CategoryFilter } from './CategoryFilter'
import { FeaturedGrid } from './FeaturedGrid'
import { PublicationsList } from './PublicationsList'
import type { ArticleMeta, Category } from '@/lib/types'

export function ResearchClientWrapper({ articles }: { articles: ArticleMeta[] }) {
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const filtered =
    activeCategory === 'All' ? articles : articles.filter(a => a.category === activeCategory)

  return (
    <>
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      <FeaturedGrid articles={filtered} />
      <PublicationsList articles={filtered} />
    </>
  )
}
