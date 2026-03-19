import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getArticleBySlug, getAllArticles } from '@/lib/articles'
import { ArticleHero } from '@/components/article/ArticleHero'
import { RelatedContent } from '@/components/article/RelatedContent'

// Next.js 14: params는 동기 객체
interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const articles = await getAllArticles()
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props) {
  const article = await getArticleBySlug(params.slug)
  if (!article) return {}
  return {
    title: `${article.title} — Anthropic KR`,
    description: article.summary,
  }
}

export default async function ArticlePage({ params }: Props) {
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(params.slug),
    getAllArticles(),
  ])
  if (!article) notFound()

  return (
    <>
      <ArticleHero article={article} />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-slate font-serif max-w-none">
          <MDXRemote source={article.content} />
        </div>
      </article>
      <RelatedContent current={article} articles={allArticles} />
    </>
  )
}
