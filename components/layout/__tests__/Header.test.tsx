import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from '../Header'

describe('Header', () => {
  it('renders site logo link', () => {
    render(<Header />)
    expect(screen.getByText('Anthropic KR')).toBeInTheDocument()
  })

  it('renders Research navigation link', () => {
    render(<Header />)
    expect(screen.getByText('Research (연구)')).toBeInTheDocument()
  })

  it('renders original Anthropic link', () => {
    render(<Header />)
    const link = screen.getByText('원문 ↗')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', 'https://www.anthropic.com/research')
  })
})
