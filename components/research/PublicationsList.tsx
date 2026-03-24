'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ArticleMeta } from '@/lib/types'
import { formatDate } from '@/lib/constants'

export function PublicationsList({ articles }: { articles: ArticleMeta[] }) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  const hovered = articles.find(a => a.slug === hoveredSlug)

  if (articles.length === 0) {
    return (
      <p className="text-slate-custom-500 py-12 text-center text-sm">
        해당 카테고리의 번역된 글이 없습니다.
      </p>
    )
  }

  return (
    <section className="py-6">
      {/* 호버 이미지 — 뷰포트 우측 중앙 고정 */}
      <div
        className="fixed right-12 top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden lg:flex items-center justify-center transition-all duration-200"
        style={{
          opacity: hovered?.heroImage ? 1 : 0,
        }}
      >
        <div
          className="w-44 h-44 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: hovered?.heroImageBg ?? 'transparent' }}
        >
          {hovered?.heroImage && (
            <Image
              src={hovered.heroImage}
              alt={hovered.title}
              width={120}
              height={120}
              className="w-28 h-28 object-contain"
              unoptimized={hovered.heroImage.endsWith('.svg')}
            />
          )}
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* 테이블 */}
        <div className="flex-1 min-w-0">
          {/* 헤더 */}
          <div className="grid grid-cols-[120px_140px_1fr] gap-4 pb-2 border-b border-oat">
            <span className="text-xs font-semibold tracking-widest text-slate-custom-400 uppercase">Date</span>
            <span className="text-xs font-semibold tracking-widest text-slate-custom-400 uppercase">Category</span>
            <span className="text-xs font-semibold tracking-widest text-slate-custom-400 uppercase">Title</span>
          </div>

          {/* 행 */}
          {articles.map(article => (
            <Link
              key={article.slug}
              href={`/research/${article.slug}`}
              className="grid grid-cols-[120px_140px_1fr] gap-4 py-3 border-b border-oat/60 hover:bg-ivory-dark/40 transition-colors duration-100 group"
              onMouseEnter={() => setHoveredSlug(article.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
            >
              <span className="text-sm text-slate-custom-400 self-center">
                {formatDate(article.date)}
              </span>
              <span className="text-sm text-slate-custom-500 self-center">
                {article.category}
              </span>
              <span className="text-sm text-slate-custom-900 group-hover:text-clay transition-colors self-center font-medium">
                {article.title}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
