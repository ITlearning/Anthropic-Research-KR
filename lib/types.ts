// lib/types.ts
export const CATEGORIES = [
  'All',
  'Interpretability',
  'Alignment',
  'Societal Impacts',
  'Economic Research',
  'Policy',
  'Science',
  'Announcements',
  'Product',
  'Frontier Red Team',
] as const

export type Category = typeof CATEGORIES[number]

export interface ArticleMeta {
  slug: string
  title: string
  titleEn: string
  category: Exclude<Category, 'All'>
  date: string
  originalUrl: string
  summary: string
  featured: boolean
  heroImage?: string
  heroImageBg?: string
}

export interface ArticleWithContent extends ArticleMeta {
  content: string
}
