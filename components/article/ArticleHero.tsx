import Link from 'next/link'
import Image from 'next/image'
import type { ArticleMeta } from '@/lib/types'
import { CATEGORY_COLORS, formatDate } from '@/lib/constants'

export function ArticleHero({ article }: { article: ArticleMeta }) {
  const colors = CATEGORY_COLORS[article.category]

  return (
    <div className="border-b border-oat">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="lg:grid lg:grid-cols-[240px_1fr]">

          {/* 사이드바 자리 (공백) */}
          <div className="hidden lg:block" />

          {/* 헤더 콘텐츠 */}
          <div className="lg:border-l lg:border-oat lg:pl-12 pt-12 pb-10">

            {/* 브레드크럼 */}
            <div className="flex items-center gap-3 mb-6 text-sm">
              <Link href="/" className="text-slate-custom-500 hover:text-clay transition-colors">
                Research (연구)
              </Link>
              <span className="text-slate-custom-300">/</span>
              <span className={`font-medium ${colors.text}`}>{article.category}</span>
            </div>

            {/* 제목 */}
            <h1 className="font-sans font-semibold text-3xl md:text-4xl text-slate-custom-900 leading-tight mb-4">
              {article.title}
            </h1>

            {/* 요약 */}
            <p className="text-slate-custom-500 text-lg leading-relaxed mb-6">
              {article.summary}
            </p>

            {/* 날짜 + 원문 링크 */}
            <div className="flex items-center gap-4 text-sm text-slate-custom-400 mb-10">
              <span>{formatDate(article.date)}</span>
              <a
                href={article.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-clay hover:underline"
              >
                영문 원문 보기 ↗
              </a>
            </div>

            {/* 히어로 이미지 — 원문과 동일: bg-cactus + rounded + padding */}
            {article.heroImage && (
              <div
                className="rounded-xl p-8 lg:p-14 flex items-center justify-center"
                style={{ backgroundColor: article.heroImageBg ?? '#bcd1ca' }}
              >
                <Image
                  src={article.heroImage}
                  alt={article.title}
                  width={500}
                  height={500}
                  className="w-full max-w-xs lg:max-w-sm h-auto mx-auto"
                  priority
                  unoptimized={article.heroImage.endsWith('.svg')}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
