import { ArticleCard } from './ArticleCard'
import type { ArticleMeta } from '@/lib/types'

export function FeaturedGrid({ articles }: { articles: ArticleMeta[] }) {
  const featured = articles.find(a => a.featured) ?? articles[0]
  if (!featured) return null
  const rest = articles.filter(a => a.slug !== featured.slug).slice(0, 3)

  return (
    <section className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ArticleCard article={featured} variant="featured" />
        </div>
        <div className="flex flex-col gap-4">
          {rest.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
