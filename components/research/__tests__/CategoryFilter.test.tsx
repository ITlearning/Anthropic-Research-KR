import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CategoryFilter } from '../CategoryFilter'

describe('CategoryFilter', () => {
  it('renders all category buttons', () => {
    render(<CategoryFilter active="All" onChange={() => {}} />)
    expect(screen.getByText('All (전체)')).toBeInTheDocument()
    expect(screen.getByText('Interpretability')).toBeInTheDocument()
    expect(screen.getByText('Alignment')).toBeInTheDocument()
    expect(screen.getByText('Societal Impacts')).toBeInTheDocument()
    expect(screen.getByText('Frontier Red Team')).toBeInTheDocument()
  })

  it('calls onChange with clicked category', () => {
    const onChange = vi.fn()
    render(<CategoryFilter active="All" onChange={onChange} />)
    fireEvent.click(screen.getByText('Alignment'))
    expect(onChange).toHaveBeenCalledWith('Alignment')
  })

  it('highlights the active category button', () => {
    render(<CategoryFilter active="Alignment" onChange={() => {}} />)
    const btn = screen.getByText('Alignment')
    expect(btn).toHaveClass('bg-slate-custom-900')
  })
})
