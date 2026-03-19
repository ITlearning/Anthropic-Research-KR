# AGENTS.md

Codex, Gemini CLI 등 Claude Code 외 환경에서 이 프로젝트를 작업할 때 읽는 파일.

## 개발 명령어

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run test:run  # 전체 테스트 실행 (vitest)
```

## 번역 글 추가 — 자동 워크플로우

`https://www.anthropic.com/research/[slug]` 형태의 링크를 받으면 아래 단계를 자동으로 수행한다.

### 처리 순서

**1. HTML 다운로드**
```bash
curl -sL "[URL]" -o "temp/[slug].html"
```

**2. 텍스트 추출**
```python
from html.parser import HTMLParser
import re

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.skip = False
        self.skip_tags = {'script', 'style', 'nav', 'header', 'footer'}
    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags: self.skip = True
    def handle_endtag(self, tag):
        if tag in self.skip_tags: self.skip = False
        if tag in ('p','h1','h2','h3','h4','li'): self.text.append('\n')
    def handle_data(self, data):
        if not self.skip and data.strip(): self.text.append(data.strip())

with open('temp/[slug].html', 'r', encoding='utf-8') as f:
    content = f.read()
parser = TextExtractor()
parser.feed(content)
text = ' '.join(parser.text)
text = re.sub(r'\s+', ' ', text)
```

**3. 이미지 추출 및 다운로드**
```python
import re, urllib.parse

# 히어로 이미지 + 배경색
hero_url = re.search(r'https://www-cdn\.anthropic\.com/images/[^\s"\']+\.svg', content)
bg_color = re.search(r'backgroundColor.*?"(\w+)"', content)

# 본문 그래프 이미지
figure_urls = re.findall(r'url=(https%3A%2F%2Fwww-cdn\.anthropic\.com[^&"]+)', content)
figures = list(dict.fromkeys(urllib.parse.unquote(u).split('?')[0] for u in figure_urls))
```

```bash
mkdir -p public/images/[slug]
# 히어로: hero.svg 또는 hero.png로 저장
curl -sO "[HERO_URL]" && mv [filename] public/images/[slug]/hero.svg
# 그래프: figure-1.png, figure-2.png, ... 순서대로
curl -sO "[FIGURE_URL]" && mv [filename] public/images/[slug]/figure-1.png
```

**배경색 매핑** (`heroImageBg` hex값):
- `cactus` → `#bcd1ca`
- `olive` → `#788c5d`
- `sky` → `#6a9bcc`
- `heather` → `#cbcadb`
- `coral` → `#ebcece`

**4. 번역 원칙**
- 학술/연구 톤 유지 (격식체)
- 고유명사(BLS, O*NET, ChatGPT 등) 영어 유지
- 연구 용어는 첫 등장 시 한국어 + 영어 병기: `관찰 노출도(observed exposure)`
- 각주, 인용 원문 구조 그대로 유지
- AI 작문 패턴 제거 (쉼표 과다, AI 유행어, 문장 단조로움 등)

**5. MDX frontmatter 형식**
```mdx
---
title: "한국어 제목"
titleEn: "English Title"
category: "Societal Impacts"  # Interpretability | Alignment | Societal Impacts | Frontier Red Team
date: "YYYY-MM-DD"
originalUrl: "https://www.anthropic.com/research/[slug]"
summary: "한 두 문장 요약"
featured: false  # 최신 주요 글 하나만 true
heroImage: "/images/[slug]/hero.svg"
heroImageBg: "#bcd1ca"  # 원문 illustration backgroundColor hex값
---
```

**이미지 삽입** (원문과 동일한 위치):
```mdx
![그림 N: 설명](/images/[slug]/figure-N.png)

**그림 N**: 한국어 캡션
```

**6. 빌드 검증**
```bash
npm run build
```

**7. 커밋 및 푸시**
```bash
git add content/articles/[slug].mdx public/images/[slug]/
git commit --author="IT learning <yo7504@naver.com>" -m "feat: [제목] 번역 추가"
git push origin main
```

---

## 아키텍처

- **콘텐츠**: `content/articles/*.mdx` — frontmatter + MDX 본문
- **데이터 레이어**: `lib/articles.ts` — 빌드 타임 파일 기반 정적 로딩
- **공유 유틸**: `lib/constants.ts` — CATEGORY_COLORS, formatDate
- **TOC 유틸**: `lib/toc.ts` — extractHeadings, slugify
- **라우팅**: `/` (index), `/research/[slug]` (상세, SSG)
- **Next.js 14**: params는 동기 객체 (15+의 async params 패턴 사용 금지)

## 아티클 페이지 구조

- CSS Grid `[240px | 1fr]` — 좌측 목차 사이드바 + 본문
- `TableOfContents` — sticky 사이드바, 스크롤 추적 active 강조
- `MdxHeading` — h2/h3에 scroll-mt ID 자동 부여
- `ArticleHero` — heroImage + heroImageBg 지원
- 모바일: 상단 고정 접이식 목차

## 커밋 규칙

- author는 항상 `IT learning <yo7504@naver.com>`
- 스크린샷 등 불필요한 파일이 커밋에 포함되지 않도록 확인
- `featured: true`는 전체 글 중 하나만 유지
