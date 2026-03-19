import Link from 'next/link'
import type { ArticleMeta } from '@/lib/types'
import { CATEGORY_COLORS, formatDate } from '@/lib/constants'

export function ArticleHero({ article }: { article: ArticleMeta }) {
  const colors = CATEGORY_COLORS[article.category]
  return (
    <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 border-b border-oat">
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
  )
}
