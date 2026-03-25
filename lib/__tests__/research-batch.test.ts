import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  detectMissingResearchEntries,
  normalizeResearchUrl,
  parseResearchIndexHtml,
  parseSitemapXml,
  readTranslatedResearchUrls,
  slugFromResearchUrl,
} from '../../scripts/research_batch_lib.mjs'

const tmpDirs: string[] = []

afterEach(() => {
  while (tmpDirs.length > 0) {
    const dir = tmpDirs.pop()
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }
})

describe('research batch helpers', () => {
  it('normalizes Anthropic research URLs and strips query/hash', () => {
    expect(
      normalizeResearchUrl('https://www.anthropic.com/research/AI-fluency-index?ref=nav#section')
    ).toBe('https://www.anthropic.com/research/AI-fluency-index')
    expect(normalizeResearchUrl('https://www.anthropic.com/news/something')).toBeNull()
  })

  it('keeps only leaf slugs under /research/', () => {
    expect(slugFromResearchUrl('https://www.anthropic.com/research/AI-fluency-index')).toBe(
      'AI-fluency-index'
    )
    expect(slugFromResearchUrl('https://www.anthropic.com/research/team/economic-research')).toBe(
      null
    )
  })

  it('parses sitemap XML, excludes non-article research paths, and sorts newest first', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.anthropic.com/research/alignment-faking</loc>
    <lastmod>2024-12-18T00:00:00.000Z</lastmod>
  </url>
  <url>
    <loc>https://www.anthropic.com/research/team/economic-research</loc>
    <lastmod>2026-03-01T00:00:00.000Z</lastmod>
  </url>
  <url>
    <loc>https://www.anthropic.com/research/AI-fluency-index</loc>
    <lastmod>2026-02-23T00:00:00.000Z</lastmod>
  </url>
</urlset>`

    expect(parseSitemapXml(xml)).toEqual([
      {
        url: 'https://www.anthropic.com/research/AI-fluency-index',
        slug: 'AI-fluency-index',
        lastmod: '2026-02-23T00:00:00.000Z',
        source: 'sitemap',
      },
      {
        url: 'https://www.anthropic.com/research/alignment-faking',
        slug: 'alignment-faking',
        lastmod: '2024-12-18T00:00:00.000Z',
        source: 'sitemap',
      },
    ])
  })

  it('parses research index HTML as a fallback source', () => {
    const html = `
      <a href="https://www.anthropic.com/research/AI-fluency-index">AI Fluency</a>
      <a href="https://www.anthropic.com/research/team/economic-research">Team page</a>
      <a href="https://www.anthropic.com/research/alignment-faking">Alignment Faking</a>
    `

    expect(parseResearchIndexHtml(html)).toEqual([
      {
        url: 'https://www.anthropic.com/research/AI-fluency-index',
        slug: 'AI-fluency-index',
        lastmod: null,
        source: 'index',
      },
      {
        url: 'https://www.anthropic.com/research/alignment-faking',
        slug: 'alignment-faking',
        lastmod: null,
        source: 'index',
      },
    ])
  })

  it('reads translated URLs from local MDX files and finds missing entries', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'anthropic-batch-test-'))
    const contentDir = path.join(tempRoot, 'content', 'articles')
    tmpDirs.push(tempRoot)
    fs.mkdirSync(contentDir, { recursive: true })

    fs.writeFileSync(
      path.join(contentDir, 'alignment-faking.mdx'),
      `---
title: "대형 언어 모델에서의 정렬 위장"
titleEn: "Alignment faking in large language models"
category: "Alignment"
date: "2024-12-18"
originalUrl: "https://www.anthropic.com/research/alignment-faking"
summary: "요약"
featured: false
---`,
      'utf-8'
    )

    const translatedUrls = readTranslatedResearchUrls(contentDir)
    expect(translatedUrls).toEqual(['https://www.anthropic.com/research/alignment-faking'])

    const missing = detectMissingResearchEntries(
      [
        {
          url: 'https://www.anthropic.com/research/AI-fluency-index',
          slug: 'AI-fluency-index',
          lastmod: '2026-02-23T00:00:00.000Z',
          source: 'sitemap',
        },
        {
          url: 'https://www.anthropic.com/research/alignment-faking',
          slug: 'alignment-faking',
          lastmod: '2024-12-18T00:00:00.000Z',
          source: 'sitemap',
        },
      ],
      translatedUrls
    )

    expect(missing).toEqual([
      {
        url: 'https://www.anthropic.com/research/AI-fluency-index',
        slug: 'AI-fluency-index',
        lastmod: '2026-02-23T00:00:00.000Z',
        source: 'sitemap',
      },
    ])
  })
})
