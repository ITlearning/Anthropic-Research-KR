import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ArticleCard } from '../ArticleCard'
import type { ArticleMeta } from '@/lib/types'

const mockArticle: ArticleMeta = {
  slug: 'test-article',
  title: '테스트 글 제목',
  titleEn: 'Test Article Title',
  category: 'Alignment',
  date: '2025-06-01',
  originalUrl: 'https://www.anthropic.com/research/test',
  summary: '테스트 요약입니다.',
  featured: false,
}

describe('ArticleCard — default variant', () => {
  it('renders title and summary', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('테스트 글 제목')).toBeInTheDocument()
    expect(screen.getByText('테스트 요약입니다.')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('Alignment')).toBeInTheDocument()
  })

  it('links to article detail page', () => {
    render(<ArticleCard article={mockArticle} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/research/test-article')
  })
})

describe('ArticleCard — featured variant', () => {
  it('renders title on dark background (featured)', () => {
    render(<ArticleCard article={mockArticle} variant="featured" />)
    expect(screen.getByText('테스트 글 제목')).toBeInTheDocument()
  })
})

describe('ArticleCard — list variant', () => {
  it('renders in list format with category and date', () => {
    render(<ArticleCard article={mockArticle} variant="list" />)
    expect(screen.getByText('테스트 글 제목')).toBeInTheDocument()
    expect(screen.getByText('Alignment')).toBeInTheDocument()
  })
})
