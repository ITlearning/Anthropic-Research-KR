# Anthropic Research KR Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anthropic 리서치 글을 한국어로 번역해 게시하는 정적 사이트를 Next.js 14로 구현한다.

**Architecture:** Next.js 14 App Router + MDX 파일 기반 콘텐츠 관리. `content/articles/*.mdx` 파일이 글 소스이며, 빌드 시 정적으로 생성된다. Vercel에 자동 배포된다.

**Tech Stack:** Next.js 14.2.x (App Router), TypeScript, Tailwind CSS v3, next-mdx-remote, gray-matter, Vitest + React Testing Library

> **⚠️ 버전 주의:** `create-next-app@14` 를 명시적으로 사용. `@latest`는 Next.js 15+를 설치하며 `params` API가 달라져 코드가 깨진다.

---

## File Map

```
/
├── app/
│   ├── layout.tsx                   # Root layout (fonts, metadata)
│   ├── page.tsx                     # Research index (/)
│   ├── not-found.tsx                # 커스텀 404
│   ├── research/[slug]/page.tsx     # Article detail (/research/[slug])
│   └── globals.css                  # Tailwind base + custom CSS vars
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # 사이트 헤더 + nav
│   │   └── Footer.tsx               # 사이트 푸터
│   ├── research/
│   │   ├── CategoryFilter.tsx       # 카테고리 필터 탭
│   │   ├── ArticleCard.tsx          # 글 카드 (default/featured/list variant)
│   │   ├── FeaturedGrid.tsx         # Featured + 보조 카드 그리드
│   │   ├── PublicationsList.tsx     # 전체 글 목록
│   │   └── ResearchClientWrapper.tsx # 클라이언트 필터 상태 관리
│   └── article/
│       ├── ArticleHero.tsx          # 글 상단 (제목, 날짜, 카테고리)
│       └── RelatedContent.tsx       # 관련 글 섹션
├── lib/
│   ├── types.ts                     # ArticleMeta, ArticleWithContent, Category 타입
│   ├── constants.ts                 # CATEGORY_COLORS, formatDate 등 공유 유틸
│   └── articles.ts                  # MDX 로딩, 파싱, 필터링
├── content/articles/                # MDX 번역 글 파일들
├── tailwind.config.ts               # Anthropic 색상 시스템
├── next.config.mjs                  # Next.js 설정
└── package.json
```

---

## Task 1: 프로젝트 초기화

**Files:**
- Create: `package.json`, `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `app/globals.css`

- [ ] **Step 1: 기존 파일을 유지하면서 Next.js 14 프로젝트 생성**

디렉터리가 비어있지 않으므로 `--yes` 옵션을 사용해 덮어쓰기 충돌을 방지한다.

```bash
cd /Users/tabber/Anthropic-Research-KR
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-eslint --yes
```

Expected: `Success! Created ... at /Users/tabber/Anthropic-Research-KR`

- [ ] **Step 2: 설치된 Next.js 버전 확인**

```bash
node -e "const p = require('./node_modules/next/package.json'); console.log(p.version)"
```

Expected: `14.x.x` (15.x가 나오면 `npm install next@14.2.20` 으로 다운그레이드)

- [ ] **Step 3: MDX 및 콘텐츠 의존성 설치**

```bash
npm install next-mdx-remote gray-matter
```

- [ ] **Step 4: Noto Serif KR 폰트 설치**

```bash
npm install @fontsource/noto-serif-kr
```

- [ ] **Step 5: 테스트 도구 설치**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @vitest/coverage-v8
```

- [ ] **Step 6: vitest.config.ts 생성**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 7: vitest.setup.ts 생성**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 8: package.json scripts에 test 추가**

`package.json` 의 `scripts` 섹션에 추가:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 9: content/articles 디렉터리 생성**

```bash
mkdir -p content/articles
touch content/articles/.gitkeep
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: Next.js 14 프로젝트 초기화 (TypeScript, Tailwind, Vitest, MDX)"
```

---

## Task 2: Tailwind 색상 시스템 (Anthropic 디자인)

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: @tailwindcss/typography 설치**

```bash
npm install -D @tailwindcss/typography
```

- [ ] **Step 2: tailwind.config.ts 전체 교체**

`require()` 대신 ES import를 사용한다.

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#faf9f5',
          dark: '#f0eee6',
          medium: '#e8e6dc',
        },
        'slate-custom': {
          '000': '#ffffff',
          100: '#f5f4ed',
          200: '#e8e6dc',
          300: '#d1cfc5',
          400: '#b0aea5',
          500: '#87867f',
          600: '#5e5d59',
          700: '#3d3d3a',
          800: '#262624',
          900: '#1a1918',
          950: '#141413',
        },
        clay: '#d97757',
        olive: '#788c5d',
        oat: '#e3dacc',
        cactus: '#bcd1ca',
        sky: '#6a9bcc',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif KR"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [typography],
}

export default config
```

- [ ] **Step 3: globals.css 설정 (Pretendard CDN + Noto Serif KR)**

```css
/* app/globals.css */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
@import '@fontsource/noto-serif-kr/400.css';
@import '@fontsource/noto-serif-kr/700.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-ivory: #faf9f5;
  --color-clay: #d97757;
  --color-olive: #788c5d;
}

body {
  background-color: var(--color-ivory);
  color: #1a1918;
  font-family: Pretendard, system-ui, sans-serif;
}

.reading-column {
  max-width: 680px;
  margin: 0 auto;
}
```

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```

Expected: 오류 없이 빌드 완료

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css package.json package-lock.json
git commit -m "style: Anthropic 색상 시스템 및 Pretendard/Noto Serif KR 폰트 설정"
```

---

## Task 3: 타입 정의 및 공유 상수

**Files:**
- Create: `lib/types.ts`
- Create: `lib/constants.ts`

- [ ] **Step 1: lib/types.ts 작성**

```typescript
// lib/types.ts
export const CATEGORIES = [
  'All',
  'Interpretability',
  'Alignment',
  'Societal Impacts',
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
}

export interface ArticleWithContent extends ArticleMeta {
  content: string
}
```

- [ ] **Step 2: lib/constants.ts 작성**

공유 유틸을 한 곳에 모아 중복을 방지한다.

```typescript
// lib/constants.ts
import type { Category } from './types'

export const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, { badge: string; text: string }> = {
  Interpretability:    { badge: 'text-sky-700 bg-sky-50',    text: 'text-sky-700' },
  Alignment:           { badge: 'text-olive bg-green-50',     text: 'text-olive' },
  'Societal Impacts':  { badge: 'text-clay bg-orange-50',     text: 'text-clay' },
  'Frontier Red Team': { badge: 'text-slate-700 bg-slate-100', text: 'text-slate-700' },
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/constants.ts
git commit -m "feat: 타입 정의 및 공유 상수 (CATEGORY_COLORS, formatDate)"
```

---

## Task 4: 샘플 MDX 글 3개 생성 (테스트/개발용)

**Files:**
- Create: `content/articles/labor-market-impacts.mdx`
- Create: `content/articles/alignment-faking.mdx`
- Create: `content/articles/tracing-llm-thoughts.mdx`

3개 이상의 샘플이 있어야 FeaturedGrid, RelatedContent, CategoryFilter가 정상 동작하는지 확인 가능하다.

- [ ] **Step 1: labor-market-impacts.mdx 생성**

```mdx
---
title: "AI의 노동시장 영향: 새로운 측정 방법과 초기 증거"
titleEn: "Labor market impacts of AI: A new measure and early evidence"
category: "Societal Impacts"
date: "2025-01-15"
originalUrl: "https://www.anthropic.com/research/labor-market-impacts"
summary: "AI 노출도를 측정하는 새로운 방법론을 제안하고, 초기 노동시장 데이터를 통해 AI가 직업에 미치는 영향을 분석한다."
featured: true
---

## 핵심 발견

AI에 높은 노출도를 보이는 직업군에서 일자리 증가세가 둔화되고 있다는 초기 증거를 확인했다.

## 소개

대규모 언어 모델의 확산으로 노동 시장의 구조적 변화가 시작되고 있다. 이 연구에서는 직업별 AI 노출도를 정량화하는 새로운 지표를 개발했다.
```

- [ ] **Step 2: alignment-faking.mdx 생성**

```mdx
---
title: "대형 언어 모델에서의 정렬 위장"
titleEn: "Alignment faking in large language models"
category: "Alignment"
date: "2024-12-18"
originalUrl: "https://www.anthropic.com/research/alignment-faking"
summary: "AI 모델이 훈련 중에는 정렬된 것처럼 행동하다가 배포 후 다르게 행동할 수 있다는 가능성을 실험적으로 탐구한다."
featured: false
---

## 개요

정렬 위장(alignment faking)이란 모델이 인간 감독자의 선호에 맞게 행동하는 척하면서 실제로는 다른 목표를 추구하는 현상이다.

## 실험 설계

Claude 3 Opus를 대상으로 훈련 중과 추론 중의 행동 차이를 분석했다.
```

- [ ] **Step 3: tracing-llm-thoughts.mdx 생성**

```mdx
---
title: "대형 언어 모델의 사고 추적"
titleEn: "Tracing the thoughts of a large language model"
category: "Interpretability"
date: "2025-03-27"
originalUrl: "https://www.anthropic.com/research/tracing-thoughts-language-model"
summary: "해석 가능성 연구를 통해 언어 모델 내부에서 어떤 개념이 활성화되고 어떻게 처리되는지 추적하는 방법론을 소개한다."
featured: false
---

## 배경

내부 표현(internal representations)을 해석하는 것은 AI 안전성의 핵심 과제다.

## 방법론

Sparse Autoencoder(SAE)를 활용해 개별 특징(feature)을 인간이 이해 가능한 개념으로 분해한다.
```

- [ ] **Step 4: Commit**

```bash
git add content/articles/
git commit -m "content: 개발/테스트용 샘플 MDX 글 3개 추가"
```

---

## Task 5: articles 유틸리티 (TDD)

**Files:**
- Create: `lib/articles.ts`
- Create: `lib/__tests__/articles.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// lib/__tests__/articles.test.ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test:run
```

Expected: FAIL — `Cannot find module '../articles'`

- [ ] **Step 3: lib/articles.ts 구현**

```typescript
// lib/articles.ts
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
  const { data, content } = matter(raw)
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
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run
```

Expected: PASS — 3 suites, 8 tests all passing

- [ ] **Step 5: Commit**

```bash
git add lib/
git commit -m "feat: article 로딩 유틸리티 (TDD — 8 tests passing)"
```

---

## Task 6: Header 컴포넌트 (TDD)

**Files:**
- Create: `components/layout/Header.tsx`
- Create: `components/layout/__tests__/Header.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// components/layout/__tests__/Header.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from '../Header'

describe('Header', () => {
  it('renders site logo link', () => {
    render(<Header />)
    expect(screen.getByText('Anthropic KR')).toBeInTheDocument()
  })

  it('renders Research navigation link', () => {
    render(<Header />)
    expect(screen.getByText('Research (연구)')).toBeInTheDocument()
  })

  it('renders original Anthropic link', () => {
    render(<Header />)
    const link = screen.getByText('원문 ↗')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', 'https://www.anthropic.com/research')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test:run -- components/layout/__tests__/Header.test.tsx
```

Expected: FAIL — `Cannot find module '../Header'`

- [ ] **Step 3: Header 컴포넌트 구현**

```tsx
// components/layout/Header.tsx
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-ivory border-b border-oat">
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-sans font-semibold text-slate-custom-900 hover:text-clay transition-colors"
        >
          Anthropic KR
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-slate-custom-600 hover:text-slate-custom-900 transition-colors"
          >
            Research (연구)
          </Link>
          <a
            href="https://www.anthropic.com/research"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-custom-500 hover:text-clay transition-colors text-xs"
          >
            원문 ↗
          </a>
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- components/layout/__tests__/Header.test.tsx
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add components/layout/
git commit -m "feat: Header 컴포넌트 (TDD)"
```

---

## Task 7: Footer 컴포넌트 (TDD)

**Files:**
- Create: `components/layout/Footer.tsx`
- Create: `components/layout/__tests__/Footer.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// components/layout/__tests__/Footer.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from '../Footer'

describe('Footer', () => {
  it('renders site name', () => {
    render(<Footer />)
    expect(screen.getByText('Anthropic KR')).toBeInTheDocument()
  })

  it('renders non-profit disclaimer', () => {
    render(<Footer />)
    expect(screen.getByText(/비영리/)).toBeInTheDocument()
  })

  it('renders link to original Anthropic research', () => {
    render(<Footer />)
    const link = screen.getByText(/anthropic\.com\/research/)
    expect(link.closest('a')).toHaveAttribute('href', 'https://www.anthropic.com/research')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test:run -- components/layout/__tests__/Footer.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Footer 컴포넌트 구현**

```tsx
// components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="mt-24 border-t border-oat bg-ivory-dark">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-sans font-semibold text-slate-custom-900 mb-1">Anthropic KR</p>
            <p className="text-sm text-slate-custom-500">
              Anthropic 리서치 비공식 한국어 번역 아카이브
            </p>
            <p className="text-xs text-slate-custom-400 mt-2">비영리 · 원문 출처 표기</p>
          </div>
          <div className="text-sm text-slate-custom-500 space-y-1">
            <p>
              원문:{' '}
              <a
                href="https://www.anthropic.com/research"
                target="_blank"
                rel="noopener noreferrer"
                className="text-clay hover:underline"
              >
                anthropic.com/research ↗
              </a>
            </p>
            <p className="text-xs text-slate-custom-400">
              © Anthropic, PBC — 원저작권은 Anthropic에 있습니다
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- components/layout/__tests__/Footer.test.tsx
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add components/layout/Footer.tsx components/layout/__tests__/Footer.test.tsx
git commit -m "feat: Footer 컴포넌트 (TDD)"
```

---

## Task 8: Root Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: app/layout.tsx 교체**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Anthropic Research KR — 한국어 번역',
  description: 'Anthropic 리서치 논문 및 글의 한국어 번역 아카이브입니다.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: Root layout (Header + Footer 통합)"
```

---

## Task 9: ArticleCard 컴포넌트 (TDD)

**Files:**
- Create: `components/research/ArticleCard.tsx`
- Create: `components/research/__tests__/ArticleCard.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// components/research/__tests__/ArticleCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ArticleCard } from '../ArticleCard'
import type { ArticleMeta } from '@/lib/types'

const mockArticle: ArticleMeta = {
  slug: 'test-article',
  title: '테스트 글 제목',
  titleEn: 'Test Article Title',
  category: 'Alignment',
  date: '2025-06-01',
  originalUrl: 'https://www.anthropic.com/research/test',
  summary: '테스트 요약입니다.',
  featured: false,
}

describe('ArticleCard — default variant', () => {
  it('renders title and summary', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('테스트 글 제목')).toBeInTheDocument()
    expect(screen.getByText('테스트 요약입니다.')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('Alignment')).toBeInTheDocument()
  })

  it('links to article detail page', () => {
    render(<ArticleCard article={mockArticle} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/research/test-article')
  })
})

describe('ArticleCard — featured variant', () => {
  it('renders title on dark background (featured)', () => {
    render(<ArticleCard article={mockArticle} variant="featured" />)
    expect(screen.getByText('테스트 글 제목')).toBeInTheDocument()
  })
})

describe('ArticleCard — list variant', () => {
  it('renders in list format with category and date', () => {
    render(<ArticleCard article={mockArticle} variant="list" />)
    expect(screen.getByText('테스트 글 제목')).toBeInTheDocument()
    expect(screen.getByText('Alignment')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test:run -- components/research/__tests__/ArticleCard.test.tsx
```

Expected: FAIL

- [ ] **Step 3: ArticleCard 구현 (공유 상수 사용)**

```tsx
// components/research/ArticleCard.tsx
import Link from 'next/link'
import type { ArticleMeta } from '@/lib/types'
import { CATEGORY_COLORS, formatDate } from '@/lib/constants'

interface Props {
  article: ArticleMeta
  variant?: 'default' | 'featured' | 'list'
}

export function ArticleCard({ article, variant = 'default' }: Props) {
  const colors = CATEGORY_COLORS[article.category]

  if (variant === 'list') {
    return (
      <Link
        href={`/research/${article.slug}`}
        className="flex items-start gap-4 py-5 border-b border-oat hover:bg-ivory-dark transition-colors group px-2 -mx-2 rounded"
      >
        <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded shrink-0 mt-0.5 ${colors.badge}`}>
          {article.category}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-medium text-slate-custom-900 group-hover:text-clay transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-slate-custom-500 mt-1 line-clamp-1">{article.summary}</p>
        </div>
        <span className="text-xs text-slate-custom-400 shrink-0 mt-0.5">{formatDate(article.date)}</span>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/research/${article.slug}`}
        className="block bg-slate-custom-900 rounded-xl p-8 hover:bg-slate-custom-800 transition-colors group h-full"
      >
        <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded ${colors.badge}`}>
          {article.category}
        </span>
        <h2 className="font-sans font-semibold text-white text-2xl mt-4 mb-3 group-hover:text-oat transition-colors line-clamp-3">
          {article.title}
        </h2>
        <p className="text-slate-custom-300 text-sm leading-relaxed line-clamp-3">{article.summary}</p>
        <p className="text-slate-custom-500 text-xs mt-4">{formatDate(article.date)}</p>
      </Link>
    )
  }

  return (
    <Link
      href={`/research/${article.slug}`}
      className="block border border-oat rounded-xl p-6 hover:border-clay hover:shadow-sm transition-all group bg-white"
    >
      <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded ${colors.badge}`}>
        {article.category}
      </span>
      <h3 className="font-sans font-medium text-slate-custom-900 mt-3 mb-2 group-hover:text-clay transition-colors line-clamp-2">
        {article.title}
      </h3>
      <p className="text-sm text-slate-custom-500 leading-relaxed line-clamp-3">{article.summary}</p>
      <p className="text-slate-custom-400 text-xs mt-4">{formatDate(article.date)}</p>
    </Link>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- components/research/__tests__/ArticleCard.test.tsx
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add components/research/ArticleCard.tsx components/research/__tests__/
git commit -m "feat: ArticleCard 컴포넌트 3 variants (TDD)"
```

---

## Task 10: CategoryFilter 컴포넌트 (TDD)

**Files:**
- Create: `components/research/CategoryFilter.tsx`
- Create: `components/research/__tests__/CategoryFilter.test.tsx`

> **Note:** CategoryFilter는 `'use client'` 컴포넌트. `CATEGORIES`는 Task 3에서 이미 `lib/types.ts`에 정의되어 있다.

- [ ] **Step 1: 실패 테스트 작성**

```typescript
// components/research/__tests__/CategoryFilter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CategoryFilter } from '../CategoryFilter'

describe('CategoryFilter', () => {
  it('renders all category buttons', () => {
    render(<CategoryFilter active="All" onChange={() => {}} />)
    expect(screen.getByText('All (전체)')).toBeInTheDocument()
    expect(screen.getByText('Interpretability')).toBeInTheDocument()
    expect(screen.getByText('Alignment')).toBeInTheDocument()
    expect(screen.getByText('Societal Impacts')).toBeInTheDocument()
    expect(screen.getByText('Frontier Red Team')).toBeInTheDocument()
  })

  it('calls onChange with clicked category', () => {
    const onChange = vi.fn()
    render(<CategoryFilter active="All" onChange={onChange} />)
    fireEvent.click(screen.getByText('Alignment'))
    expect(onChange).toHaveBeenCalledWith('Alignment')
  })

  it('highlights the active category button', () => {
    render(<CategoryFilter active="Alignment" onChange={() => {}} />)
    const btn = screen.getByText('Alignment')
    expect(btn).toHaveClass('bg-slate-custom-900')
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test:run -- components/research/__tests__/CategoryFilter.test.tsx
```

Expected: FAIL

- [ ] **Step 3: CategoryFilter 구현**

```tsx
// components/research/CategoryFilter.tsx
'use client'

import { CATEGORIES } from '@/lib/types'
import type { Category } from '@/lib/types'

interface Props {
  active: Category
  onChange: (category: Category) => void
}

export function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`
            text-sm font-sans px-4 py-1.5 rounded-full border transition-colors
            ${active === cat
              ? 'bg-slate-custom-900 text-white border-slate-custom-900'
              : 'bg-white text-slate-custom-600 border-oat hover:border-slate-custom-400'
            }
          `}
        >
          {cat === 'All' ? 'All (전체)' : cat}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test:run -- components/research/__tests__/CategoryFilter.test.tsx
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add components/research/CategoryFilter.tsx components/research/__tests__/CategoryFilter.test.tsx
git commit -m "feat: CategoryFilter 컴포넌트 (TDD)"
```

---

## Task 11: FeaturedGrid + PublicationsList (TDD)

**Files:**
- Create: `components/research/FeaturedGrid.tsx`
- Create: `components/research/PublicationsList.tsx`
- Create: `components/research/__tests__/FeaturedGrid.test.tsx`
- Create: `components/research/__tests__/PublicationsList.test.tsx`

- [ ] **Step 1: FeaturedGrid 테스트 작성**

```typescript
// components/research/__tests__/FeaturedGrid.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FeaturedGrid } from '../FeaturedGrid'
import type { ArticleMeta } from '@/lib/types'

const articles: ArticleMeta[] = [
  { slug: 'a1', title: '피처드 글', titleEn: 'Featured', category: 'Alignment', date: '2025-06-01', originalUrl: '', summary: '요약1', featured: true },
  { slug: 'a2', title: '일반 글 1', titleEn: 'Normal 1', category: 'Interpretability', date: '2025-05-01', originalUrl: '', summary: '요약2', featured: false },
  { slug: 'a3', title: '일반 글 2', titleEn: 'Normal 2', category: 'Societal Impacts', date: '2025-04-01', originalUrl: '', summary: '요약3', featured: false },
]

describe('FeaturedGrid', () => {
  it('renders the featured article', () => {
    render(<FeaturedGrid articles={articles} />)
    expect(screen.getByText('피처드 글')).toBeInTheDocument()
  })

  it('renders supporting cards for non-featured articles', () => {
    render(<FeaturedGrid articles={articles} />)
    expect(screen.getByText('일반 글 1')).toBeInTheDocument()
  })

  it('returns null when articles array is empty', () => {
    const { container } = render(<FeaturedGrid articles={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: PublicationsList 테스트 작성**

```typescript
// components/research/__tests__/PublicationsList.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PublicationsList } from '../PublicationsList'
import type { ArticleMeta } from '@/lib/types'

const articles: ArticleMeta[] = [
  { slug: 'a1', title: '글 1', titleEn: 'Article 1', category: 'Alignment', date: '2025-06-01', originalUrl: '', summary: '요약', featured: false },
  { slug: 'a2', title: '글 2', titleEn: 'Article 2', category: 'Interpretability', date: '2025-05-01', originalUrl: '', summary: '요약', featured: false },
]

describe('PublicationsList', () => {
  it('renders all articles', () => {
    render(<PublicationsList articles={articles} />)
    expect(screen.getByText('글 1')).toBeInTheDocument()
    expect(screen.getByText('글 2')).toBeInTheDocument()
  })

  it('shows empty state when no articles', () => {
    render(<PublicationsList articles={[]} />)
    expect(screen.getByText(/해당 카테고리/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: 테스트 실패 확인**

```bash
npm run test:run -- components/research/__tests__/
```

Expected: FAIL (both)

- [ ] **Step 4: FeaturedGrid 구현**

```tsx
// components/research/FeaturedGrid.tsx
import { ArticleCard } from './ArticleCard'
import type { ArticleMeta } from '@/lib/types'

export function FeaturedGrid({ articles }: { articles: ArticleMeta[] }) {
  const featured = articles.find(a => a.featured) ?? articles[0]
  if (!featured) return null
  const rest = articles.filter(a => a.slug !== featured.slug).slice(0, 3)

  return (
    <section className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ArticleCard article={featured} variant="featured" />
        </div>
        <div className="flex flex-col gap-4">
          {rest.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: PublicationsList 구현**

```tsx
// components/research/PublicationsList.tsx
import { ArticleCard } from './ArticleCard'
import type { ArticleMeta } from '@/lib/types'

export function PublicationsList({ articles }: { articles: ArticleMeta[] }) {
  if (articles.length === 0) {
    return (
      <p className="text-slate-custom-500 py-12 text-center text-sm">
        해당 카테고리의 번역된 글이 없습니다.
      </p>
    )
  }
  return (
    <section className="py-6">
      <h2 className="font-sans font-semibold text-slate-custom-900 text-xl mb-6">
        Publications (전체 목록)
      </h2>
      <div>
        {articles.map(article => (
          <ArticleCard key={article.slug} article={article} variant="list" />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: 테스트 통과 확인**

```bash
npm run test:run -- components/research/__tests__/
```

Expected: PASS — 5 tests

- [ ] **Step 7: Commit**

```bash
git add components/research/FeaturedGrid.tsx components/research/PublicationsList.tsx components/research/__tests__/
git commit -m "feat: FeaturedGrid + PublicationsList (TDD)"
```

---

## Task 12: Research Index 페이지

**Files:**
- Create: `components/research/ResearchClientWrapper.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: ResearchClientWrapper 작성**

```tsx
// components/research/ResearchClientWrapper.tsx
'use client'

import { useState } from 'react'
import { CategoryFilter } from './CategoryFilter'
import { FeaturedGrid } from './FeaturedGrid'
import { PublicationsList } from './PublicationsList'
import type { ArticleMeta, Category } from '@/lib/types'

export function ResearchClientWrapper({ articles }: { articles: ArticleMeta[] }) {
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const filtered =
    activeCategory === 'All' ? articles : articles.filter(a => a.category === activeCategory)

  return (
    <>
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
      <FeaturedGrid articles={filtered} />
      <PublicationsList articles={filtered} />
    </>
  )
}
```

- [ ] **Step 2: app/page.tsx 작성**

```tsx
// app/page.tsx
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
```

- [ ] **Step 3: 개발 서버 확인**

```bash
npm run dev
```

`http://localhost:3000` — Hero, 카테고리 필터, Featured Grid, 목록이 모두 표시되어야 함.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/research/ResearchClientWrapper.tsx
git commit -m "feat: Research index 페이지"
```

---

## Task 13: Article Detail 페이지

**Files:**
- Create: `components/article/ArticleHero.tsx`
- Create: `components/article/RelatedContent.tsx`
- Create: `app/research/[slug]/page.tsx`
- Create: `app/not-found.tsx`

> **Next.js 14 주의:** `params`는 동기 객체다. `{ params: { slug: string } }` 타입 그대로 사용. Next.js 15의 `Promise<{ slug }>` 패턴 사용 금지.

- [ ] **Step 1: ArticleHero 작성**

```tsx
// components/article/ArticleHero.tsx
import Link from 'next/link'
import type { ArticleMeta } from '@/lib/types'
import { CATEGORY_COLORS, formatDate } from '@/lib/constants'

export function ArticleHero({ article }: { article: ArticleMeta }) {
  const colors = CATEGORY_COLORS[article.category]
  return (
    <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 border-b border-oat">
      <div className="flex items-center gap-3 mb-6 text-sm">
        <Link href="/" className="text-slate-custom-500 hover:text-clay transition-colors">
          Research (연구)
        </Link>
        <span className="text-slate-custom-300">/</span>
        <span className={`font-medium ${colors.text}`}>{article.category}</span>
      </div>
      <h1 className="font-sans font-semibold text-3xl md:text-4xl text-slate-custom-900 leading-tight mb-4">
        {article.title}
      </h1>
      <p className="text-slate-custom-500 text-lg leading-relaxed mb-6">{article.summary}</p>
      <div className="flex items-center gap-4 text-sm text-slate-custom-400">
        <span>{formatDate(article.date)}</span>
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-clay hover:underline"
        >
          영문 원문 보기 ↗
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: RelatedContent 작성**

```tsx
// components/article/RelatedContent.tsx
import { ArticleCard } from '@/components/research/ArticleCard'
import type { ArticleMeta } from '@/lib/types'

interface Props {
  current: ArticleMeta
  articles: ArticleMeta[]
}

export function RelatedContent({ current, articles }: Props) {
  const related = articles
    .filter(a => a.slug !== current.slug && a.category === current.category)
    .slice(0, 3)
  if (related.length === 0) return null
  return (
    <section className="max-w-6xl mx-auto px-6 py-16 border-t border-oat">
      <h2 className="font-sans font-semibold text-xl text-slate-custom-900 mb-8">
        Related content (관련 글)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: app/research/[slug]/page.tsx 작성**

```tsx
// app/research/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getArticleBySlug, getAllArticles } from '@/lib/articles'
import { ArticleHero } from '@/components/article/ArticleHero'
import { RelatedContent } from '@/components/article/RelatedContent'

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

export default async function ArticlePage({ params }: Props) {
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(params.slug),
    getAllArticles(),
  ])
  if (!article) notFound()

  return (
    <>
      <ArticleHero article={article} />
      <article className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-slate font-serif max-w-none">
          <MDXRemote source={article.content} />
        </div>
      </article>
      <RelatedContent current={article} articles={allArticles} />
    </>
  )
}
```

- [ ] **Step 4: 커스텀 404 페이지 작성**

```tsx
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <p className="text-clay text-sm font-sans font-medium mb-4">404</p>
      <h1 className="font-sans font-semibold text-3xl text-slate-custom-900 mb-4">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-slate-custom-500 mb-8">
        요청하신 글이 존재하지 않거나 삭제되었습니다.
      </p>
      <Link href="/" className="text-clay hover:underline font-sans">
        ← 목록으로 돌아가기
      </Link>
    </div>
  )
}
```

- [ ] **Step 5: 개발 서버에서 글 상세 확인**

```bash
npm run dev
```

`http://localhost:3000/research/labor-market-impacts` 열어 확인.

- [ ] **Step 6: Commit**

```bash
git add components/article/ app/research/ app/not-found.tsx
git commit -m "feat: Article detail 페이지 + 커스텀 404 (Next.js 14 동기 params)"
```

---

## Task 14: 빌드 검증 및 Vercel 배포

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 전체 테스트 통과 확인**

```bash
npm run test:run
```

Expected: 모든 테스트 PASS (articles 8개 + 컴포넌트 테스트)

- [ ] **Step 2: 프로덕션 빌드 확인**

```bash
npm run build
```

Expected: 오류 없이 완료. `Route /research/[slug]`가 SSG로 생성되어야 함.

- [ ] **Step 3: CLAUDE.md 업데이트**

```markdown
## 개발 명령어

\`\`\`bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run test:run  # 전체 테스트 실행
\`\`\`

## 번역 글 추가 방법

1. 영어 원문을 Claude Code에 붙여넣기
2. Claude가 번역 + humanizer 스킬 적용 → 자연스러운 한국어
3. \`content/articles/[slug].mdx\` 파일 생성 (frontmatter 포함)
4. Git commit → Vercel 자동 배포

## 아키텍처

- **콘텐츠**: \`content/articles/*.mdx\` — frontmatter + MDX 본문
- **데이터 레이어**: \`lib/articles.ts\` — 빌드 타임 파일 기반 정적 로딩
- **공유 유틸**: \`lib/constants.ts\` — CATEGORY_COLORS, formatDate
- **라우팅**: \`/\` (index), \`/research/[slug]\` (상세, SSG)
- **클라이언트 상태**: 카테고리 필터만 (\`ResearchClientWrapper\`)
- **Next.js 버전**: 14.x — params는 동기 객체 (15+의 async params 패턴 사용 금지)
```

- [ ] **Step 4: GitHub push**

```bash
git push -u origin main
```

- [ ] **Step 5: Vercel 배포 설정**

Vercel 대시보드 → "Add New Project" → GitHub 저장소 `ITlearning/Anthropic-Research-KR` Import → Framework: **Next.js** → Deploy.

배포 완료 후 `anthropic-kr.vercel.app` 접속해 확인.

- [ ] **Step 6: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md 업데이트 (개발 명령어, 번역 워크플로우, 아키텍처)"
git push
```

---

## 번역 글 추가 워크플로우 (반복 작업)

새 글을 추가할 때마다:

1. 사용자가 영어 원문 붙여넣기
2. Claude: 번역 수행
3. Claude: `humanizer` 스킬 적용 → 자연스러운 한국어로 다듬기
4. `slug` 결정 (영문 제목 기반, kebab-case)
5. `content/articles/[slug].mdx` 생성 (frontmatter 포함)
6. 처음 글이면 `featured: true`, 이후 글은 `featured: false`
7. Commit & push:
   ```bash
   git add content/articles/[slug].mdx
   git commit -m "content: [한국어 제목] 번역 추가"
   git push
   ```
8. Vercel 자동 배포 (약 30초~1분)
