'use client'

import { useEffect, useRef, useState } from 'react'
import type { Heading } from '@/lib/toc'

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')
  const [mobileOpen, setMobileOpen] = useState(false)

  // IntersectionObserver — 원문과 동일하게 상단에서 가장 가까운 visible 헤딩을 active로
  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      const scrollY = window.scrollY + 80 // header height buffer

      let current = headings[0].id
      for (const { id } of headings) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= scrollY) {
          current = id
        }
      }
      setActiveId(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 초기 실행

    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  if (headings.length === 0) return null

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
    setMobileOpen(false)
  }

  const activeHeading = headings.find(h => h.id === activeId)

  return (
    <aside
      className="
        sticky top-14 self-start
        bg-ivory border border-oat rounded-sm
        lg:bg-transparent lg:border-0 lg:rounded-none
        overflow-hidden
      "
      style={{ maxHeight: 'calc(100vh - 3.5rem)' }}
    >
      {/* 모바일: 접이식 버튼 (Anthropic과 동일) */}
      <button
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setMobileOpen(v => !v)}
        aria-expanded={mobileOpen}
      >
        <span className="text-xs font-bold tracking-wide text-slate-custom-900 uppercase">
          {activeHeading?.text ?? '목차'}
        </span>
        <svg
          className={`w-3 h-3 text-slate-custom-600 transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 8 5" fill="currentColor"
        >
          <path d="M7.3016 0.2318C7.4493 0.0678 7.7031 0.0546 7.8672 0.2021C8.0314 0.3499 8.0446 0.6036 7.8969 0.7678L4.2968 4.7679L4.2343 4.8242C4.1666 4.8733 4.0843 4.9 3.9992 4.9C3.8859 4.9 3.7773 4.8521 3.7015 4.7679L0.1014 0.7678L0.0538 0.7021C-0.0402 0.5418 -0.0124 0.3314 0.1311 0.2021C0.2748 0.0729 0.4870 0.0675 0.6366 0.1779L0.6968 0.2318L3.9992 3.9015L7.3016 0.2318Z" />
        </svg>
      </button>

      {/* 목차 목록 */}
      <ul
        role="navigation"
        aria-label="문서 섹션"
        className={`
          lg:block overflow-y-auto
          ${mobileOpen ? 'block' : 'hidden'}
          lg:max-h-[calc(100vh-8rem)] px-4 pb-4 lg:px-0 lg:pb-0
        `}
      >
        {/* 데스크톱 레이블 */}
        <li className="hidden lg:block mb-3">
          <span className="text-xs font-bold tracking-widest text-slate-custom-400 uppercase">
            목차
          </span>
        </li>

        {headings.map(h => {
          const isActive = activeId === h.id
          return (
            <li key={h.id}>
              <button
                role="button"
                tabIndex={0}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => scrollTo(h.id)}
                className={[
                  'w-full text-left py-1.5 text-xs leading-snug transition-all duration-150 border-l-2 pl-3',
                  h.level === 3 ? 'pl-6' : 'pl-3',
                  isActive
                    ? 'border-clay text-slate-custom-900 font-bold'
                    : 'border-transparent text-slate-custom-500 hover:text-slate-custom-800 hover:border-oat',
                ].join(' ')}
              >
                {h.text}
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
