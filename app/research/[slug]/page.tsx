import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getArticleBySlug, getAllArticles } from '@/lib/articles'
import { extractHeadings } from '@/lib/toc'
import { ArticleHero } from '@/components/article/ArticleHero'
import { RelatedContent } from '@/components/article/RelatedContent'
import { TableOfContents } from '@/components/article/TableOfContents'
import { H2, H3 } from '@/components/article/MdxHeading'
import { YouTubeEmbed } from '@/components/article/YouTubeEmbed'

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

const mdxComponents = { h2: H2, h3: H3, YouTubeEmbed }

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

      {/* 모바일 TOC (상단 고정 바) */}
      <div className="lg:hidden sticky top-14 z-40 bg-ivory border-b border-oat">
        <TableOfContents headings={headings} />
      </div>

      {/* 데스크톱: grid 레이아웃 (원문과 동일) */}
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="lg:grid lg:grid-cols-[240px_1fr]">

          {/* 사이드바 */}
          <div className="hidden lg:block">
            <div className="sticky top-14 pt-10 pb-10 pr-8 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
              <TableOfContents headings={headings} />
            </div>
          </div>

          {/* 본문 */}
          <article className="py-12 lg:border-l lg:border-oat lg:pl-12 max-w-2xl">
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
