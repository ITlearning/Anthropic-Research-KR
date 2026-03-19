import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from '../Footer'

describe('Footer', () => {
  it('renders site name', () => {
    render(<Footer />)
    expect(screen.getByText('Anthropic KR')).toBeInTheDocument()
  })

  it('renders non-profit disclaimer', () => {
    render(<Footer />)
    expect(screen.getByText(/비영리/)).toBeInTheDocument()
  })

  it('renders link to original Anthropic research', () => {
    render(<Footer />)
    const link = screen.getByText(/anthropic\.com\/research/)
    expect(link.closest('a')).toHaveAttribute('href', 'https://www.anthropic.com/research')
  })
})
