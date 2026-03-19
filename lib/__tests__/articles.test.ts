import { describe, it, expect } from 'vitest'
import { getAllArticles, getArticleBySlug, getArticlesByCategory } from '../articles'

describe('getAllArticles', () => {
  it('returns array of article metas with length > 0', async () => {
    const articles = await getAllArticles()
    expect(Array.isArray(articles)).toBe(true)
    expect(articles.length).toBeGreaterThan(0)
  })

  it('each article has required fields', async () => {
    const articles = await getAllArticles()
    for (const a of articles) {
      expect(a).toHaveProperty('slug')
      expect(typeof a.slug).toBe('string')
      expect(a).toHaveProperty('title')
      expect(a).toHaveProperty('category')
      expect(a).toHaveProperty('date')
      expect(a).toHaveProperty('summary')
      expect(typeof a.featured).toBe('boolean')
      expect(a).toHaveProperty('originalUrl')
    }
  })

  it('articles are sorted by date descending', async () => {
    const articles = await getAllArticles()
    if (articles.length < 2) return
    for (let i = 0; i < articles.length - 1; i++) {
      expect(new Date(articles[i].date).getTime()).toBeGreaterThanOrEqual(
        new Date(articles[i + 1].date).getTime()
      )
    }
  })
})

describe('getArticleBySlug', () => {
  it('returns article with content for a known slug', async () => {
    const article = await getArticleBySlug('labor-market-impacts')
    expect(article).not.toBeNull()
    expect(article?.slug).toBe('labor-market-impacts')
    expect(typeof article?.content).toBe('string')
    expect(article?.content.length).toBeGreaterThan(0)
  })

  it('returns null for a non-existent slug', async () => {
    const article = await getArticleBySlug('this-does-not-exist-xyz')
    expect(article).toBeNull()
  })
})

describe('getArticlesByCategory', () => {
  it('returns all articles when category is "All"', async () => {
    const all = await getAllArticles()
    const filtered = await getArticlesByCategory('All')
    expect(filtered.length).toBe(all.length)
  })

  it('returns only articles matching the given category', async () => {
    const filtered = await getArticlesByCategory('Societal Impacts')
    expect(filtered.length).toBeGreaterThan(0)
    for (const a of filtered) {
      expect(a.category).toBe('Societal Impacts')
    }
  })

  it('returns empty array if no articles in that category', async () => {
    const filtered = await getArticlesByCategory('Frontier Red Team')
    expect(Array.isArray(filtered)).toBe(true)
  })
})
