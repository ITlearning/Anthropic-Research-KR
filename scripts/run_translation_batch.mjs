import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import {
  detectMissingResearchEntries,
  formatMissingEntries,
  loadRemoteResearchEntries,
  parseResearchIndexHtml,
  parseSitemapXml,
  readFrontmatterValue,
  readTranslatedResearchUrls,
} from './research_batch_lib.mjs'

function parseArgs(argv) {
  const args = {
    codexBin: 'codex',
    dryRun: false,
    gitAuthorEmail: 'yo7504@naver.com',
    gitAuthorName: 'IT learning',
    gitBranch: 'main',
    gitPush: false,
    gitRemote: 'origin',
    indexFile: null,
    limit: 1,
    model: '',
    promptFile: '',
    sandbox: 'workspace-write',
    sitemapFile: null,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]

    if (token === '--dry-run') {
      args.dryRun = true
      continue
    }
    if (token === '--git-push') {
      args.gitPush = true
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
    if (token === '--model') {
      args.model = argv[i + 1] ?? ''
      i += 1
      continue
    }
    if (token.startsWith('--model=')) {
      args.model = token.split('=')[1] ?? ''
      continue
    }
    if (token === '--sandbox') {
      args.sandbox = argv[i + 1] ?? args.sandbox
      i += 1
      continue
    }
    if (token.startsWith('--sandbox=')) {
      args.sandbox = token.split('=')[1] ?? args.sandbox
      continue
    }
    if (token === '--prompt-file') {
      args.promptFile = argv[i + 1] ?? ''
      i += 1
      continue
    }
    if (token.startsWith('--prompt-file=')) {
      args.promptFile = token.split('=')[1] ?? ''
      continue
    }
    if (token === '--codex-bin') {
      args.codexBin = argv[i + 1] ?? args.codexBin
      i += 1
      continue
    }
    if (token.startsWith('--codex-bin=')) {
      args.codexBin = token.split('=')[1] ?? args.codexBin
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
      continue
    }
    if (token === '--git-remote') {
      args.gitRemote = argv[i + 1] ?? args.gitRemote
      i += 1
      continue
    }
    if (token.startsWith('--git-remote=')) {
      args.gitRemote = token.split('=')[1] ?? args.gitRemote
      continue
    }
    if (token === '--git-branch') {
      args.gitBranch = argv[i + 1] ?? args.gitBranch
      i += 1
      continue
    }
    if (token.startsWith('--git-branch=')) {
      args.gitBranch = token.split('=')[1] ?? args.gitBranch
      continue
    }
    if (token === '--git-author-name') {
      args.gitAuthorName = argv[i + 1] ?? args.gitAuthorName
      i += 1
      continue
    }
    if (token.startsWith('--git-author-name=')) {
      args.gitAuthorName = token.split('=')[1] ?? args.gitAuthorName
      continue
    }
    if (token === '--git-author-email') {
      args.gitAuthorEmail = argv[i + 1] ?? args.gitAuthorEmail
      i += 1
      continue
    }
    if (token.startsWith('--git-author-email=')) {
      args.gitAuthorEmail = token.split('=')[1] ?? args.gitAuthorEmail
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

function buildPrompt(basePrompt, entry) {
  return `${basePrompt.trim()}\n\n<article>\n<url>${entry.url}</url>\n<slug>${entry.slug}</slug>\n<lastmod>${entry.lastmod ?? ''}</lastmod>\n</article>\n`
}

function runCommand(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd,
    encoding: 'utf-8',
    input: options.input,
    stdio: options.stdio ?? ['pipe', 'pipe', 'pipe'],
  })

  if (result.error) {
    throw result.error
  }

  return result
}

function assertSuccess(result, context) {
  if (result.status !== 0) {
    const stderr = result.stderr?.trim()
    throw new Error(`${context} failed with status ${result.status}${stderr ? `: ${stderr}` : ''}`)
  }
}

function parseGitStatusPaths(stdout) {
  return new Set(
    stdout
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const rawPath = line.slice(3)
        const renameParts = rawPath.split(' -> ')
        return renameParts[renameParts.length - 1]
      })
  )
}

function getDirtyPaths(repoRoot) {
  const result = runCommand(
    'git',
    ['status', '--short', '--untracked-files=all'],
    { cwd: repoRoot }
  )
  assertSuccess(result, 'git status')
  return parseGitStatusPaths(result.stdout)
}

function collectNewPaths(beforePaths, afterPaths) {
  return [...afterPaths].filter(filepath => !beforePaths.has(filepath)).sort()
}

function readArticleMetadata(repoRoot, slug) {
  const filepath = path.join(repoRoot, 'content', 'articles', `${slug}.mdx`)
  if (!fs.existsSync(filepath)) {
    return {
      title: slug,
      titleEn: slug,
    }
  }

  const raw = fs.readFileSync(filepath, 'utf-8')
  return {
    title: readFrontmatterValue(raw, 'title') ?? slug,
    titleEn: readFrontmatterValue(raw, 'titleEn') ?? slug,
  }
}

function buildCommitMessage(entry, metadata) {
  const englishTitle = metadata.titleEn || entry.slug

  return {
    subject: `Publish Korean translation for ${englishTitle}`,
    body: [
      `This automated batch run translated ${englishTitle} from Anthropic Research,`,
      'stored the article assets locally, and updated the static site content so',
      'the published site can serve the new Korean entry immediately after push.',
      '',
      'Constraint: Automated batch must commit only files created by this run',
      'Constraint: Translation verification remains tied to the article generation step',
      'Confidence: medium',
      'Scope-risk: narrow',
      'Reversibility: clean',
      'Directive: Keep automated translation commits limited to one article per run unless the publish flow is redesigned',
      'Tested: npm run build',
      'Not-tested: Manual editorial review',
      `Related: ${entry.url}`,
    ].join('\n'),
  }
}

function publishEntry(repoRoot, entry, changedPaths, args) {
  if (changedPaths.length === 0) {
    process.stdout.write(`[publish] No new files for ${entry.slug}; skipping commit/push\n`)
    return
  }

  process.stdout.write(`[publish] Staging ${changedPaths.length} path(s) for ${entry.slug}\n`)
  const addResult = runCommand('git', ['add', '--', ...changedPaths], { cwd: repoRoot })
  assertSuccess(addResult, 'git add')

  const metadata = readArticleMetadata(repoRoot, entry.slug)
  const message = buildCommitMessage(entry, metadata)
  const author = `${args.gitAuthorName} <${args.gitAuthorEmail}>`
  const commitResult = runCommand(
    'git',
    ['commit', `--author=${author}`, '-m', message.subject, '-m', message.body],
    { cwd: repoRoot }
  )
  assertSuccess(commitResult, 'git commit')
  process.stdout.write(`[publish] Committed ${entry.slug}\n`)

  const pushResult = runCommand(
    'git',
    ['push', args.gitRemote, `HEAD:${args.gitBranch}`],
    { cwd: repoRoot, stdio: ['pipe', 'inherit', 'inherit'] }
  )
  assertSuccess(pushResult, 'git push')
  process.stdout.write(`[publish] Pushed ${entry.slug} to ${args.gitRemote}/${args.gitBranch}\n`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const repoRoot = path.resolve(__dirname, '..')
  const contentDir = path.join(repoRoot, 'content', 'articles')
  const defaultPromptFile = path.join(repoRoot, 'ops', 'codex', 'translation-batch-prompt.md')
  const promptFile = args.promptFile || defaultPromptFile
  const basePrompt = fs.readFileSync(promptFile, 'utf-8')

  const { entries, source } = await loadEntries(args)
  const translatedUrls = readTranslatedResearchUrls(contentDir)
  const missingEntries = detectMissingResearchEntries(entries, translatedUrls)
  const batchEntries = missingEntries.slice(
    0,
    Number.isFinite(args.limit) && args.limit > 0 ? args.limit : 1
  )

  process.stdout.write(
    `Source: ${source}\nTranslated locally: ${translatedUrls.length}\nMissing candidates: ${missingEntries.length}\n`
  )

  if (batchEntries.length === 0) {
    process.stdout.write('No untranslated Anthropic research posts found.\n')
    return
  }

  if (args.dryRun) {
    process.stdout.write(`\n${formatMissingEntries(batchEntries)}\n`)
    return
  }

  for (const entry of batchEntries) {
    process.stdout.write(`\n[batch] Translating ${entry.slug}\n`)
    const beforePaths = getDirtyPaths(repoRoot)

    const spawnArgs = [
      'exec',
      '--full-auto',
      '--sandbox',
      args.sandbox,
      '-C',
      repoRoot,
    ]

    if (args.model) {
      spawnArgs.push('--model', args.model)
    }

    spawnArgs.push('-')

    const result = runCommand(args.codexBin, spawnArgs, {
      cwd: repoRoot,
      input: buildPrompt(basePrompt, entry),
      stdio: ['pipe', 'inherit', 'inherit'],
    })
    assertSuccess(result, `Codex translation for ${entry.slug}`)

    if (args.gitPush) {
      const afterPaths = getDirtyPaths(repoRoot)
      const changedPaths = collectNewPaths(beforePaths, afterPaths)
      publishEntry(repoRoot, entry, changedPaths, args)
    }
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
