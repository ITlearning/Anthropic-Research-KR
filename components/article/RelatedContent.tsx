import { ArticleCard } from '@/components/research/ArticleCard'
import type { ArticleMeta } from '@/lib/types'

interface Props {
  current: ArticleMeta
  articles: ArticleMeta[]
}

export function RelatedContent({ current, articles }: Props) {
  const related = articles
    .filter(a => a.slug !== current.slug && a.category === current.category)
    .slice(0, 3)
  if (related.length === 0) return null
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-oat">
      <h2 className="font-sans font-semibold text-xl text-slate-custom-900 mb-8">
        Related content (관련 글)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  )
}
