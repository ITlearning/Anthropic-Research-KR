# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run test:run  # 전체 테스트 실행 (vitest)
```

## 번역 글 추가 — 자동 워크플로우

**URL 하나만 주면 된다.** `https://www.anthropic.com/research/[slug]` 형태의 링크를 받으면 `translate-article` 스킬을 자동으로 실행한다.

### 처리 순서 (스킬이 자동 수행)

1. HTML 다운로드 → 텍스트 + 이미지 URL 추출
2. 전체 한국어 번역 (학술 톤 유지)
3. `humanizer` 스킬로 자연스러운 한국어 다듬기
4. 이미지 → `public/images/[slug]/figure-N.png` 로컬 저장
5. `content/articles/[slug].mdx` 생성 (이미지 원문 위치에 삽입)
6. `npm run build` 검증
7. Git commit (`IT learning <yo7504@naver.com>`) → push → Vercel 자동 배포

### MDX frontmatter 형식

```mdx
---
title: "한국어 제목"
titleEn: "English Title"
category: "Societal Impacts"  # Interpretability | Alignment | Societal Impacts | Frontier Red Team
date: "YYYY-MM-DD"
originalUrl: "https://www.anthropic.com/research/..."
summary: "한 두 문장 요약"
featured: false  # true는 전체 중 하나만
---
```

## 아키텍처

- **콘텐츠**: `content/articles/*.mdx` — frontmatter + MDX 본문
- **데이터 레이어**: `lib/articles.ts` — 빌드 타임 파일 기반 정적 로딩
- **공유 유틸**: `lib/constants.ts` — CATEGORY_COLORS, formatDate
- **TOC 유틸**: `lib/toc.ts` — extractHeadings, slugify
- **라우팅**: `/` (index), `/research/[slug]` (상세, SSG)
- **클라이언트 상태**: 카테고리 필터만 (`ResearchClientWrapper`)
- **Next.js 버전**: 14.x — params는 동기 객체 (15+의 async params 패턴 사용 금지)

## 아티클 페이지 구조

- CSS Grid `[240px | 1fr]` — 좌측 목차 사이드바 + 본문
- `TableOfContents` — sticky 사이드바, 스크롤 추적 active 강조
- `MdxHeading` — h2/h3에 scroll-mt ID 자동 부여
- 모바일: 상단 고정 접이식 목차

## 테스트

```bash
npm run test:run  # 전체 실행
npm run test      # watch 모드
```

테스트 위치: `lib/__tests__/`, `components/**/__tests__/`
