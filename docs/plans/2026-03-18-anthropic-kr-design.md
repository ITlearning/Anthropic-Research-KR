# Anthropic Research KR — Design Document

## Overview

비영리 목적의 Anthropic 리서치 글 한국어 번역 사이트.
영어 원문을 받아 번역 + humanizer 처리 후 MDX 파일로 게시.

**URL**: `anthropic-kr.vercel.app`

---

## 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| Framework | Next.js 14 (App Router) | MDX 지원, Vercel 최적화 |
| Styling | Tailwind CSS | Anthropic 색상 시스템 커스텀 토큰 적용 |
| Content | MDX | 글 = 파일 하나, 관리 단순 |
| Hosting | Vercel | GitHub 자동 배포, 무료 플랜 |
| Language | TypeScript | |

---

## 색상 시스템 (Anthropic 동일)

```js
// tailwind.config 커스텀 색상
ivory:        '#faf9f5'   // 페이지 배경
ivory-dark:   '#f0eee6'   // 섹션 구분
slate-000:    '#ffffff'
slate-900:    '#1a1918'   // 기본 텍스트
slate-600:    '#5e5d59'   // 서브 텍스트
clay:         '#d97757'   // 포인트, 링크 hover
olive:        '#788c5d'   // 카테고리 태그
oat:          '#e3dacc'   // 구분선, 보조 배경
```

---

## 폰트

- **Pretendard** — UI, 네비게이션, 헤드라인 (Styrene A/B 대체, 한국어 최적화)
- **Noto Serif KR** — 본문 (Tiempos Text 대체, 가독성)

---

## 페이지 구조

### 1. Research Index (`/`)

```
<Header>
  로고 | Research (연구) nav 링크

<Hero>
  h1: "Research (연구)"

<CategoryFilter>
  All | Interpretability | Alignment | Societal Impacts | Frontier Red Team

<FeaturedGrid>
  - 1개 대형 Featured 카드 (featured: true인 최신글)
  - 3~4개 일반 카드

<PublicationsList>
  - 날짜순 전체 글 목록
  - 카테고리 필터 연동

<Footer>
  간단한 푸터 + 원본 Anthropic 링크 표기
```

### 2. Article Detail (`/research/[slug]`)

```
<Header>

<ArticleHero>
  카테고리 태그 | 날짜
  h1: 번역 제목

<ArticleBody>  (reading-column, max-width 680px)
  - MDX 렌더링
  - h2/h3 섹션 구분
  - 원문 링크 표기

<RelatedContent>
  관련 글 카드 3개

<Footer>
```

---

## 콘텐츠 구조

```
/content/articles/
  └── [slug].mdx

# MDX frontmatter 예시
---
title: "AI의 노동시장 영향: 새로운 측정 방법과 초기 증거"
titleEn: "Labor market impacts of AI: A new measure and early evidence"
category: "Societal Impacts"
date: "2025-01-15"
originalUrl: "https://www.anthropic.com/research/labor-market-impacts"
summary: "AI 노출도를 새롭게 측정하는 방법론을 제안하고..."
featured: false
---
```

---

## 번역 워크플로우

1. 사용자가 영어 원문 붙여넣기
2. Claude: 번역 수행
3. Claude: humanizer 스킬로 자연스러운 한국어로 다듬기
4. Claude: MDX 파일 생성 → `content/articles/[slug].mdx`
5. Git commit → Vercel 자동 배포

---

## UI 언어 방침

- 네비게이션: 한/영 혼용 (예: "Research (연구)")
- 카테고리명: 영어 유지 (Interpretability, Alignment 등)
- 글 제목/본문: 한국어
- 원문 출처 링크: 항상 표기
