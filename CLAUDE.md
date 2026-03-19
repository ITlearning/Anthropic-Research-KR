# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run test:run  # 전체 테스트 실행 (vitest)
```

## 번역 글 추가 방법

1. 영어 원문을 Claude Code에 붙여넣기
2. Claude가 번역 + humanizer 스킬 적용 → 자연스러운 한국어
3. `content/articles/[slug].mdx` 파일 생성 (frontmatter 포함)
4. Git commit → Vercel 자동 배포

### MDX frontmatter 형식

```mdx
---
title: "한국어 제목"
titleEn: "English Title"
category: "Societal Impacts"  # Interpretability | Alignment | Societal Impacts | Frontier Red Team
date: "YYYY-MM-DD"
originalUrl: "https://www.anthropic.com/research/..."
summary: "한 두 문장 요약"
featured: false  # true는 글 하나만 (최신 주요 글)
---
```

## 아키텍처

- **콘텐츠**: `content/articles/*.mdx` — frontmatter + MDX 본문
- **데이터 레이어**: `lib/articles.ts` — 빌드 타임 파일 기반 정적 로딩
- **공유 유틸**: `lib/constants.ts` — CATEGORY_COLORS, formatDate
- **라우팅**: `/` (index), `/research/[slug]` (상세, SSG)
- **클라이언트 상태**: 카테고리 필터만 (`ResearchClientWrapper`)
- **Next.js 버전**: 14.x — params는 동기 객체 (15+의 async params 패턴 사용 금지)

## 테스트

```bash
npm run test:run  # 전체 실행
npm run test      # watch 모드
```

테스트 위치: `lib/__tests__/`, `components/**/__tests__/`
