# Expert Hub

**라이브 서비스 → https://expert-hub-two.vercel.app**

전문가 이력 관리 & 기관 매칭 플랫폼. AI가 핵심 전문 분야를 자동 요약하고, 관리자가 전문가와 기관을 직접 연결합니다.

## 기술 스택

- **Next.js 16** (App Router)
- **Tailwind CSS**
- **Lucide React** (아이콘)
- **Anthropic Claude Haiku** (AI 요약)

## 페이지 구성

| 경로 | 대상 | 설명 |
|------|------|------|
| `/` | 전체 | 서비스 소개 홈 |
| `/expert` | 전문가 | 이력 등록 신청 폼 + AI 자동 요약 + 위촉 증빙 첨부 |
| `/search` | 전체 | 승인된 전문가 카드 목록 + 키워드 검색 |
| `/institution` | 기관 | 기관 담당자 로그인 / 가입 신청 |
| `/institution/dashboard` | 기관 | 정부과제 등록·관리, 매칭 현황 확인 |
| `/institutions` | 전체 | 기관별 정부과제 수요 목록 (필요 분야·위원 수) |
| `/admin` | 관리자 | 전문가·기관 승인/거절/삭제, 매칭 제안·확정 |
| `/api/summarize` | 서버 | AI 요약 API 라우트 |

## 핵심 흐름

```
전문가 등록 신청 → 관리자 승인 → 전문가 검색에 노출
기관 가입 신청   → 관리자 승인 → 기관 수요 목록에 노출
관리자 매칭 제안 → 기관 대시보드에서 매칭 현황 확인
```

## 관리자 접속

- URL: `/admin`
- 비밀번호: `admin1234` (변경: `app/admin/page.tsx`의 `ADMIN_PASSWORD`)

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
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com)에서 발급. 미설정 시 AI 요약 비활성화 (나머지 기능 정상 동작) |

## Vercel 배포

1. [vercel.com](https://vercel.com) → **New Project** → 이 레포 선택
2. **Environment Variables** → `ANTHROPIC_API_KEY` 입력
3. **Deploy** 클릭

이후 `main` 브랜치에 push하면 자동 재배포됩니다.
