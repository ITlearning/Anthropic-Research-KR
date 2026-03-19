import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getArticleBySlug, getAllArticles } from '@/lib/articles'
import { extractHeadings } from '@/lib/toc'
import { ArticleHero } from '@/components/article/ArticleHero'
import { RelatedContent } from '@/components/article/RelatedContent'
import { TableOfContents } from '@/components/article/TableOfContents'
import { H2, H3 } from '@/components/article/MdxHeading'

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

const mdxComponents = { h2: H2, h3: H3 }

export default async function ArticlePage({ params }: Props) {
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(params.slug),
    getAllArticles(),
  ])
  if (!article) notFound()

  const headings = extractHeadings(article.content)

  return (
    <>
      <ArticleHero article={article} />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex gap-14 items-start">
          {/* 좌측 목차 */}
          <aside className="hidden xl:block w-52 shrink-0">
            <TableOfContents headings={headings} />
          </aside>

          {/* 본문 */}
          <article className="flex-1 min-w-0 max-w-2xl">
            <div className="prose prose-slate font-serif max-w-none">
              <MDXRemote source={article.content} components={mdxComponents} />
            </div>
          </article>
        </div>
      </div>
      <RelatedContent current={article} articles={allArticles} />
    </>
  )
}
