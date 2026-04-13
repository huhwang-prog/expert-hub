# Expert Hub

전문가 이력 관리 & 기관 매칭 플랫폼. AI가 핵심 전문 분야를 자동 요약해주는 MVP 서비스입니다.

## 기술 스택

- **Next.js 16** (App Router)
- **Tailwind CSS**
- **Lucide React** (아이콘)
- **Anthropic Claude Haiku** (AI 요약)

## 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 서비스 소개 홈 |
| `/expert` | 전문가 이력 등록 폼 + AI 요약 |
| `/search` | 전문가 카드 목록 + 키워드 검색 |
| `/api/summarize` | AI 요약 API 라우트 |

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 에 ANTHROPIC_API_KEY 입력

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com)에서 발급. 미설정 시 AI 요약 기능 비활성화 |

## Vercel 배포

1. [vercel.com](https://vercel.com) → **New Project** → 이 레포 선택
2. **Environment Variables** → `ANTHROPIC_API_KEY` 입력
3. **Deploy** 클릭

이후 `main` 브랜치에 push하면 자동 재배포됩니다.
