import path from 'path'
import { fileURLToPath } from 'url'
import {
  detectMissingResearchEntries,
  formatMissingEntries,
  loadRemoteResearchEntries,
  parseResearchIndexHtml,
  parseSitemapXml,
  readTranslatedResearchUrls,
} from './research_batch_lib.mjs'
import fs from 'fs'

function parseArgs(argv) {
  const args = {
    json: false,
    limit: null,
    sitemapFile: null,
    indexFile: null,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--json') {
      args.json = true
      continue
    }
    if (token === '--limit') {
      args.limit = Number.parseInt(argv[i + 1] ?? '', 10)
      i += 1
      continue
    }
    if (token.startsWith('--limit=')) {
      args.limit = Number.parseInt(token.split('=')[1] ?? '', 10)
      continue
    }
    if (token === '--sitemap-file') {
      args.sitemapFile = argv[i + 1] ?? null
      i += 1
      continue
    }
    if (token.startsWith('--sitemap-file=')) {
      args.sitemapFile = token.split('=')[1] ?? null
      continue
    }
    if (token === '--index-file') {
      args.indexFile = argv[i + 1] ?? null
      i += 1
      continue
    }
    if (token.startsWith('--index-file=')) {
      args.indexFile = token.split('=')[1] ?? null
    }
  }

  return args
}

async function loadEntries(args) {
  if (args.sitemapFile) {
    return {
      source: 'sitemap-file',
      entries: parseSitemapXml(fs.readFileSync(args.sitemapFile, 'utf-8')),
    }
  }

  if (args.indexFile) {
    return {
      source: 'index-file',
      entries: parseResearchIndexHtml(fs.readFileSync(args.indexFile, 'utf-8')),
    }
  }

  return loadRemoteResearchEntries()
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const repoRoot = path.resolve(__dirname, '..')
  const contentDir = path.join(repoRoot, 'content', 'articles')

  const { entries, source } = await loadEntries(args)
  const translatedUrls = readTranslatedResearchUrls(contentDir)
  const missingEntries = detectMissingResearchEntries(entries, translatedUrls)
  const limitedEntries =
    typeof args.limit === 'number' && Number.isFinite(args.limit) && args.limit >= 0
      ? missingEntries.slice(0, args.limit)
      : missingEntries

  if (args.json) {
    process.stdout.write(
      `${JSON.stringify(
        {
          source,
          translatedCount: translatedUrls.length,
          missingCount: missingEntries.length,
          entries: limitedEntries,
        },
        null,
        2
      )}\n`
    )
    return
  }

  const summary = [
    `Source: ${source}`,
    `Translated locally: ${translatedUrls.length}`,
    `Missing on Anthropic site: ${missingEntries.length}`,
    '',
    formatMissingEntries(limitedEntries),
  ].join('\n')

  process.stdout.write(`${summary}\n`)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
