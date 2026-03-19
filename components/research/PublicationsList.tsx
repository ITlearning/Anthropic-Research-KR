import { ArticleCard } from './ArticleCard'
import type { ArticleMeta } from '@/lib/types'

export function PublicationsList({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) {
    return (
      <p className="text-slate-custom-500 py-12 text-center text-sm">
        해당 카테고리의 번역된 글이 없습니다.
      </p>
    )
  }
  return (
    <section className="py-6">
      <h2 className="font-sans font-semibold text-slate-custom-900 text-xl mb-6">
        Publications (전체 목록)
      </h2>
      <div>
        {articles.map(article => (
          <ArticleCard key={article.slug} article={article} variant="list" />
        ))}
      </div>
    </section>
  )
}
