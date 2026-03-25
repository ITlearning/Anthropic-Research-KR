import fs from 'fs'
import path from 'path'

export const RESEARCH_ORIGIN = 'https://www.anthropic.com'
export const RESEARCH_INDEX_URL = `${RESEARCH_ORIGIN}/research`
export const RESEARCH_SITEMAP_URL = `${RESEARCH_ORIGIN}/sitemap.xml`
const RESEARCH_PATH_PREFIX = '/research/'

export function readFrontmatterValue(raw, fieldName) {
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return null

  const fieldPattern = new RegExp(`^${fieldName}:\\s*"(.*)"\\s*$`, 'm')
  const fieldMatch = frontmatterMatch[1].match(fieldPattern)
  return fieldMatch ? fieldMatch[1] : null
}

function decodeXmlText(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export function normalizeResearchUrl(url) {
  if (!url) return null

  let parsed
  try {
    parsed = new URL(url, RESEARCH_ORIGIN)
  } catch {
    return null
  }

  parsed.search = ''
  parsed.hash = ''
  parsed.pathname = parsed.pathname.replace(/\/+$/, '')

  if (!parsed.pathname.startsWith(RESEARCH_PATH_PREFIX)) {
    return null
  }

  return parsed.toString()
}

export function slugFromResearchUrl(url) {
  const normalized = normalizeResearchUrl(url)
  if (!normalized) return null

  const pathname = new URL(normalized).pathname
  const slug = pathname.slice(RESEARCH_PATH_PREFIX.length)

  if (!slug || slug.includes('/')) {
    return null
  }

  return slug
}

function compareEntriesByLastmodDesc(a, b) {
  const aTime = a.lastmod ? Date.parse(a.lastmod) : Number.NaN
  const bTime = b.lastmod ? Date.parse(b.lastmod) : Number.NaN

  const aValid = Number.isFinite(aTime)
  const bValid = Number.isFinite(bTime)

  if (aValid && bValid) return bTime - aTime
  if (aValid) return -1
  if (bValid) return 1
  return a.slug.localeCompare(b.slug)
}

export function parseSitemapXml(xml) {
  const entries = []
  const seen = new Set()
  const urlBlocks = xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/g)

  for (const [, block] of urlBlocks) {
    const locMatch = block.match(/<loc>([\s\S]*?)<\/loc>/)
    if (!locMatch) continue

    const normalizedUrl = normalizeResearchUrl(decodeXmlText(locMatch[1].trim()))
    const slug = slugFromResearchUrl(normalizedUrl)
    if (!normalizedUrl || !slug || seen.has(normalizedUrl)) continue

    const lastmodMatch = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)
    entries.push({
      url: normalizedUrl,
      slug,
      lastmod: lastmodMatch ? decodeXmlText(lastmodMatch[1].trim()) : null,
      source: 'sitemap',
    })
    seen.add(normalizedUrl)
  }

  return entries.sort(compareEntriesByLastmodDesc)
}

export function parseResearchIndexHtml(html) {
  const entries = []
  const seen = new Set()
  const matches = html.matchAll(
    /https:\/\/www\.anthropic\.com\/research\/[A-Za-z0-9._%-]+(?=$|["'<>\s?#])/g
  )

  for (const [rawUrl] of matches) {
    const normalizedUrl = normalizeResearchUrl(rawUrl)
    const slug = slugFromResearchUrl(normalizedUrl)
    if (!normalizedUrl || !slug || seen.has(normalizedUrl)) continue

    entries.push({
      url: normalizedUrl,
      slug,
      lastmod: null,
      source: 'index',
    })
    seen.add(normalizedUrl)
  }

  return entries.sort(compareEntriesByLastmodDesc)
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Anthropic-Research-KR batch translator',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  return response.text()
}

export async function loadRemoteResearchEntries({
  sitemapUrl = RESEARCH_SITEMAP_URL,
  indexUrl = RESEARCH_INDEX_URL,
} = {}) {
  try {
    const sitemapXml = await fetchText(sitemapUrl)
    const sitemapEntries = parseSitemapXml(sitemapXml)
    if (sitemapEntries.length > 0) {
      return {
        entries: sitemapEntries,
        source: 'sitemap',
      }
    }
  } catch (error) {
    if (process.env.DEBUG) {
      console.warn(`Sitemap fetch failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const indexHtml = await fetchText(indexUrl)
  const indexEntries = parseResearchIndexHtml(indexHtml)
  return {
    entries: indexEntries,
    source: 'index',
  }
}

export function readTranslatedResearchUrls(contentDir) {
  if (!fs.existsSync(contentDir)) return []

  const files = fs
    .readdirSync(contentDir)
    .filter(filename => filename.endsWith('.mdx'))
    .sort()

  const translatedUrls = []

  for (const filename of files) {
    const filepath = path.join(contentDir, filename)
    const raw = fs.readFileSync(filepath, 'utf-8')
    const normalizedUrl = normalizeResearchUrl(
      readFrontmatterValue(raw, 'originalUrl') ?? ''
    )
    if (normalizedUrl) {
      translatedUrls.push(normalizedUrl)
    }
  }

  return translatedUrls
}

export function detectMissingResearchEntries(entries, translatedUrls) {
  const translatedSet = new Set(
    translatedUrls.map(url => normalizeResearchUrl(url)).filter(Boolean)
  )

  return entries.filter(entry => !translatedSet.has(entry.url))
}

export function formatMissingEntries(entries) {
  if (entries.length === 0) {
    return 'No untranslated Anthropic research posts found.'
  }

  return entries
    .map(entry => {
      const prefix = entry.lastmod ? `${entry.lastmod.slice(0, 10)} ` : ''
      return `- ${prefix}${entry.slug}\n  ${entry.url}`
    })
    .join('\n')
}
