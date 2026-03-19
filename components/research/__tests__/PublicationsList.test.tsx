import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PublicationsList } from '../PublicationsList'
import type { ArticleMeta } from '@/lib/types'

const articles: ArticleMeta[] = [
  { slug: 'a1', title: '글 1', titleEn: 'Article 1', category: 'Alignment', date: '2025-06-01', originalUrl: '', summary: '요약', featured: false },
  { slug: 'a2', title: '글 2', titleEn: 'Article 2', category: 'Interpretability', date: '2025-05-01', originalUrl: '', summary: '요약', featured: false },
]

describe('PublicationsList', () => {
  it('renders all articles', () => {
    render(<PublicationsList articles={articles} />)
    expect(screen.getByText('글 1')).toBeInTheDocument()
    expect(screen.getByText('글 2')).toBeInTheDocument()
  })

  it('shows empty state when no articles', () => {
    render(<PublicationsList articles={[]} />)
    expect(screen.getByText(/해당 카테고리/)).toBeInTheDocument()
  })
})
