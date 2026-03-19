import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FeaturedGrid } from '../FeaturedGrid'
import type { ArticleMeta } from '@/lib/types'

const articles: ArticleMeta[] = [
  { slug: 'a1', title: '피처드 글', titleEn: 'Featured', category: 'Alignment', date: '2025-06-01', originalUrl: '', summary: '요약1', featured: true },
  { slug: 'a2', title: '일반 글 1', titleEn: 'Normal 1', category: 'Interpretability', date: '2025-05-01', originalUrl: '', summary: '요약2', featured: false },
  { slug: 'a3', title: '일반 글 2', titleEn: 'Normal 2', category: 'Societal Impacts', date: '2025-04-01', originalUrl: '', summary: '요약3', featured: false },
]

describe('FeaturedGrid', () => {
  it('renders the featured article', () => {
    render(<FeaturedGrid articles={articles} />)
    expect(screen.getByText('피처드 글')).toBeInTheDocument()
  })

  it('renders supporting cards for non-featured articles', () => {
    render(<FeaturedGrid articles={articles} />)
    expect(screen.getByText('일반 글 1')).toBeInTheDocument()
  })

  it('returns null when articles array is empty', () => {
    const { container } = render(<FeaturedGrid articles={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
