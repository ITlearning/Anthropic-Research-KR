import Link from 'next/link'
import Image from 'next/image'
import type { ArticleMeta } from '@/lib/types'
import { CATEGORY_COLORS, formatDate } from '@/lib/constants'

export function ArticleHero({ article }: { article: ArticleMeta }) {
  const colors = CATEGORY_COLORS[article.category]
  return (
    <div className="border-b border-oat">
      <div className="max-w-screen-xl mx-auto px-6 pt-12 pb-10 lg:grid lg:grid-cols-[240px_1fr]">
        {/* 사이드바 자리 (공백 유지) */}
        <div className="hidden lg:block" />

        {/* 헤더 콘텐츠 */}
        <div className="lg:pl-12">
          {/* 히어로 이미지 */}
          {article.heroImage && (
            <div className="mb-8 w-full max-w-xl">
              <Image
                src={article.heroImage}
                alt={article.title}
                width={800}
                height={450}
                className="w-full h-auto"
                priority
                unoptimized={article.heroImage.endsWith('.svg')}
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-6 text-sm">
            <Link href="/" className="text-slate-custom-500 hover:text-clay transition-colors">
              Research (연구)
            </Link>
            <span className="text-slate-custom-300">/</span>
            <span className={`font-medium ${colors.text}`}>{article.category}</span>
          </div>
          <h1 className="font-sans font-semibold text-3xl md:text-4xl text-slate-custom-900 leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-slate-custom-500 text-lg leading-relaxed mb-6">{article.summary}</p>
          <div className="flex items-center gap-4 text-sm text-slate-custom-400">
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
        </div>
      </div>
    </div>
  )
}
