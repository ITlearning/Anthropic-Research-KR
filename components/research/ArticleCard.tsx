import Link from 'next/link'
import type { ArticleMeta } from '@/lib/types'
import { CATEGORY_COLORS, formatDate } from '@/lib/constants'

interface Props {
  article: ArticleMeta
  variant?: 'default' | 'featured' | 'list'
}

export function ArticleCard({ article, variant = 'default' }: Props) {
  const colors = CATEGORY_COLORS[article.category]

  if (variant === 'list') {
    return (
      <Link
        href={`/research/${article.slug}`}
        className="flex items-start gap-4 py-5 border-b border-oat hover:bg-ivory-dark transition-colors group px-2 -mx-2 rounded"
      >
        <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded shrink-0 mt-0.5 ${colors.badge}`}>
          {article.category}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-medium text-slate-custom-900 group-hover:text-clay transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-slate-custom-500 mt-1 line-clamp-1">{article.summary}</p>
        </div>
        <span className="text-xs text-slate-custom-400 shrink-0 mt-0.5">{formatDate(article.date)}</span>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/research/${article.slug}`}
        className="block bg-slate-custom-900 rounded-xl p-8 hover:bg-slate-custom-800 transition-colors group h-full"
      >
        <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded ${colors.badge}`}>
          {article.category}
        </span>
        <h2 className="font-sans font-semibold text-white text-2xl mt-4 mb-3 group-hover:text-oat transition-colors line-clamp-3">
          {article.title}
        </h2>
        <p className="text-slate-custom-300 text-sm leading-relaxed line-clamp-3">{article.summary}</p>
        <p className="text-slate-custom-500 text-xs mt-4">{formatDate(article.date)}</p>
      </Link>
    )
  }

  return (
    <Link
      href={`/research/${article.slug}`}
      className="block border border-oat rounded-xl p-6 hover:border-clay hover:shadow-sm transition-all group bg-white"
    >
      <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded ${colors.badge}`}>
        {article.category}
      </span>
      <h3 className="font-sans font-medium text-slate-custom-900 mt-3 mb-2 group-hover:text-clay transition-colors line-clamp-2">
        {article.title}
      </h3>
      <p className="text-sm text-slate-custom-500 leading-relaxed line-clamp-3">{article.summary}</p>
      <p className="text-slate-custom-400 text-xs mt-4">{formatDate(article.date)}</p>
    </Link>
  )
}
