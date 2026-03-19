import { getAllArticles } from '@/lib/articles'
import { ResearchClientWrapper } from '@/components/research/ResearchClientWrapper'

export default async function ResearchPage() {
  const articles = await getAllArticles()
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <section className="mb-12">
        <h1 className="font-sans font-semibold text-5xl text-slate-custom-900 mb-4">
          Research (연구)
        </h1>
        <p className="text-slate-custom-500 text-lg max-w-xl">
          Anthropic의 리서치 글을 한국어로 번역한 아카이브입니다.
        </p>
      </section>
      <ResearchClientWrapper articles={articles} />
    </div>
  )
}
