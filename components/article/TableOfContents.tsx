'use client'

import { useEffect, useRef, useState } from 'react'
import type { Heading } from '@/lib/toc'

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    const headingEls = headings
      .map(h => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    observerRef.current = new IntersectionObserver(
      entries => {
        // 화면에 보이는 헤딩 중 가장 위에 있는 것을 active로
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    headingEls.forEach(el => observerRef.current!.observe(el))

    // 초기 active 설정 (스크롤 위치 기준)
    const updateActiveFromScroll = () => {
      const scrollY = window.scrollY + 120
      let current = headingEls[0]?.id ?? ''
      for (const el of headingEls) {
        if (el.offsetTop <= scrollY) current = el.id
      }
      setActiveId(current)
    }
    updateActiveFromScroll()

    return () => observerRef.current?.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="목차" className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-custom-400 mb-4">
        목차
      </p>
      <ul className="space-y-1">
        {headings.map(h => {
          const isActive = activeId === h.id
          return (
            <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
              <a
                href={`#${h.id}`}
                onClick={e => {
                  e.preventDefault()
                  document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={[
                  'block text-sm leading-snug py-1 transition-all duration-150 border-l-2',
                  h.level === 2 ? 'pl-3' : 'pl-3 text-xs',
                  isActive
                    ? 'border-clay text-clay font-medium'
                    : 'border-transparent text-slate-custom-400 hover:text-slate-custom-700 hover:border-oat',
                ].join(' ')}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
