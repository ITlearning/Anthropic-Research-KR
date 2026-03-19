import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ArticleMeta, ArticleWithContent, Category } from './types'

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles')

function parseArticle(filename: string): ArticleMeta {
  const slug = filename.replace(/\.mdx$/, '')
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, filename), 'utf-8')
  const { data } = matter(raw)
  return {
    slug,
    title: data.title as string,
    titleEn: data.titleEn as string,
    category: data.category as Exclude<Category, 'All'>,
    date: data.date as string,
    originalUrl: data.originalUrl as string,
    summary: data.summary as string,
    featured: Boolean(data.featured),
    heroImage: data.heroImage as string | undefined,
    heroImageBg: data.heroImageBg as string | undefined,
  }
}

export async function getAllArticles(): Promise<ArticleMeta[]> {
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'))
  return files
    .map(parseArticle)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithContent | null> {
  const filepath = path.join(ARTICLES_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filepath)) return null
  const raw = fs.readFileSync(filepath, 'utf-8')
  const { content } = matter(raw)
  return {
    ...parseArticle(`${slug}.mdx`),
    content,
  }
}

export async function getArticlesByCategory(category: Category): Promise<ArticleMeta[]> {
  const all = await getAllArticles()
  if (category === 'All') return all
  return all.filter(a => a.category === category)
}
