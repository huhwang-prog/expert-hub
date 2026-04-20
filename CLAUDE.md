# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**Expert Hub** — 전문가 프로필 관리 및 기관 매칭 플랫폼.
Next.js 16 App Router + TypeScript + Tailwind CSS + Upstash Redis로 구성된 풀스택 웹앱.
배포 주소: https://expert-hub-two.vercel.app

## Running the Project

```bash
npm run dev    # 개발 서버 (localhost:3000)
npm run build  # 프로덕션 빌드 (배포 전 반드시 확인)
```

빌드 통과 확인 후 `git push` → Vercel 자동 배포.

## Architecture

### 기술 스택
- **Next.js 16** App Router, TypeScript
- **Tailwind CSS** — 스타일링
- **Lucide React** — 아이콘
- **Upstash Redis** (`@upstash/redis`) — 서버사이드 데이터 저장소
- **Anthropic Claude Haiku** — 전문가 AI 요약 (`/api/summarize`)

### 파일 구조

```
app/
  page.tsx                        # 홈 랜딩 페이지
  layout.tsx                      # 공통 레이아웃 + 네비게이션
  admin/page.tsx                  # 관리자 대시보드 (비밀번호: admin1234)
  expert/page.tsx                 # 전문가 등록 신청 폼
  search/page.tsx                 # 전문가 검색 (승인된 전문가만 표시)
  institution/page.tsx            # 기관 로그인/가입
  institution/dashboard/page.tsx  # 기관 대시보드 (프로젝트·신청·매칭)
  institutions/page.tsx           # 기관 수요 현황 공개 페이지
  api/
    experts/route.ts              # GET 목록 / POST 등록
    experts/[id]/route.ts         # PATCH 상태 / DELETE
    institutions/route.ts
    institutions/[id]/route.ts
    institutions/login/route.ts   # POST 로그인
    matches/route.ts
    matches/[id]/route.ts
    applications/route.ts         # GET 목록 / POST 신청
    applications/[id]/route.ts    # PATCH 상태 / DELETE
    summarize/route.ts            # POST AI 요약 (Anthropic)
lib/
  types.ts      # 타입 정의 (Expert, Institution, Project, Application, Match)
  constants.ts  # 공유 상수 (EXPERT_FIELDS, COLLABORATION_TYPES)
  storage.ts    # 클라이언트 fetch 헬퍼 함수 (모두 async)
  kv.ts         # Upstash Redis 헬퍼 (kvGet / kvSet)
```

## 데이터 타입 (lib/types.ts)

### Expert
| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | string | 이름 |
| `tagline` | string | 한 줄 소개 |
| `expertise` | string | 전문성 및 이력 |
| `mainField` | string | 메인 전문 분야 (EXPERT_FIELDS 중 하나) |
| `skills` | string[] | 핵심 보유 스킬 태그 |
| `careerSummary` | string | 주요 경력 요약 |
| `portfolioLink` | string? | 포트폴리오/링크드인 (선택) |
| `contact` | string | 이메일 |
| `phone` | string | 전화번호 |
| `collaborationTypes` | string[] | 희망 협업 형태 (COLLABORATION_TYPES) |
| `summary` | string | AI 자동 요약 |
| `fields` | string[] | AI 분야 태그 |
| `status` | pending/approved/rejected | 관리자 승인 상태 |

### Institution
| 필드 | 타입 | 설명 |
|------|------|------|
| `orgName` | string | 기관명 |
| `description` | string | 기관 간단 소개 |
| `referenceLink` | string? | 참고 링크 (선택) |
| `adminName` | string | 담당자 성함 |
| `email` | string | 담당자 이메일 |
| `phone` | string | 담당자 연락처 |
| `password` | string | 로그인 비밀번호 |
| `expertField` | string | 필요한 전문가 분야 |
| `projects` | Project[] | 등록된 프로젝트 목록 |
| `status` | pending/approved/rejected | 관리자 승인 상태 |

### Project (Institution.projects 배열 항목)
| 필드 | 타입 | 설명 |
|------|------|------|
| `title` | string | 프로젝트명/평가명 |
| `period` | string | 필요 기간 |
| `specialties` | string[] | 필요 분야 (EXPERT_FIELDS) |
| `requiredCount` | number | 총 필요 인원 |

### Application (전문가 → 프로젝트 신청)
| 필드 | 타입 | 설명 |
|------|------|------|
| `expertName` | string | 신청자 이름 |
| `expertContact` | string | 이메일 |
| `expertPhone` | string | 전화번호 |
| `expertId` | string? | 등록 전문가 ID (이메일 자동 매칭) |
| `expertMainField` | string? | 전문 분야 |
| `message` | string? | 한 줄 소개 (미등록자) |
| `institutionId/Name` | string | 기관 정보 |
| `projectId/Title` | string | 프로젝트 정보 |
| `status` | pending/approved/rejected | 기관 처리 상태 |

### Match (확정된 매칭)
기관이 Application을 승인하면 자동 생성됨. `status: "confirmed"`.

## 공유 상수 (lib/constants.ts)

```typescript
EXPERT_FIELDS = [
  "투자", "회계/세무", "사업화", "기술/R&D", "문제과제 평가",
  "투자 강연", "사업고도화 강연", "법률/특허", "마케팅/홍보", "기타"
]

COLLABORATION_TYPES = ["프로젝트 외주", "단기 자문", "강연", "파트타임", "기업 평가"]
```

분야 추가/수정 시 `lib/constants.ts`만 수정하면 전체 자동 반영됨.

## 스토리지 패턴

모든 데이터는 Upstash Redis 배열로 저장. Redis 키: `experts`, `institutions`, `matches`, `applications`.

```typescript
// lib/storage.ts — 모두 async fetch 기반. "use client" 필수.
await getAllExperts()
await saveExpert(expert)
await updateExpertStatus(id, status)
await deleteExpert(id)
// institutions, applications, matches도 동일 패턴
```

- 클라이언트 컴포넌트의 `useEffect` 안에서 `await`로 호출
- API 라우트 내부에서만 `lib/kv.ts` 직접 사용

## 매칭 플로우

```
기관 가입 → 관리자 승인(/admin)
기관 로그인 → 프로젝트 등록(/institution/dashboard)
전문가 → 프로젝트 신청(/institutions)
  └─ 이메일 입력 시 등록 전문가 자동 감지 + 프로필 미리보기
기관 → 신청 승인(/institution/dashboard → 전문가 신청 탭)
  └─ 승인 → Match 자동 생성(status: "confirmed")
관리자 → 전체 매칭 관리(/admin → 매칭 관리 탭)
```

## 환경 변수 (Vercel에 설정 필요)

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
ANTHROPIC_API_KEY=...
```

## 주의사항

- `lib/storage.ts` 상단의 `"use client"` 지시어는 필수. 서버 컴포넌트에서 직접 import 금지.
- Upstash Redis 무료 플랜은 값 하나당 1MB 제한. 파일 첨부 기능 추가 시 주의.
- 빌드 전 반드시 `npm run build` 확인 후 push.
- 관리자 비밀번호는 `app/admin/page.tsx`의 `ADMIN_PASSWORD` 상수에 하드코딩되어 있음.
