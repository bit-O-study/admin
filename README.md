# heltch-admin — 통합 관리자 콘솔

양주 가격조회 · 아이큐 · 헬스앱 **세 사이트를 하나의 관리자 UI**에서 관리합니다.

## 구조

- **스택**: Next.js 16 (App Router) · React 19 · Tailwind v4 · @supabase/ssr
- **로그인 1번**: 헬스앱 Supabase Auth + `admins` 테이블(RLS)로 관리자 판별
- **데이터 접근**: 사이트별 Supabase `service_role` 서버 클라이언트 (RLS 우회, 서버 전용)

```
src/
├─ middleware.ts                     # 세션 갱신 + /admin 게이트
├─ app/
│  ├─ login/                         # 관리자 로그인
│  └─ admin/
│     ├─ page.tsx                    # 대시보드(3사이트 카드)
│     ├─ liquor/  · iq/  · health/   # 사이트별 섹션
├─ lib/supabase/
│  ├─ server.ts                      # 로그인/세션 (헬스 프로젝트)
│  ├─ admin-clients.ts               # 3개 service_role 클라이언트 ⚠서버 전용
│  └─ middleware.ts
└─ features/
   ├─ auth/                          # signIn / signOut
   └─ admin/                         # isAdminUser · 사이드바
```

## 시작하기

```bash
cp .env.example .env.local     # 값 채우기 (아래)
corepack pnpm install
corepack pnpm dev              # http://localhost:3000
```

### .env.local 채우기

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._PUBLISHABLE_KEY` | 관리자 로그인용 = **헬스앱** Supabase 공개 키 |
| `LIQUOR_SUPABASE_URL` / `..._SERVICE_ROLE_KEY` | 🍶 양주 프로젝트 service_role |
| `IQ_SUPABASE_URL` / `..._SERVICE_ROLE_KEY` | 🧠 아이큐 프로젝트 service_role |
| `HEALTH_SUPABASE_URL` / `..._SERVICE_ROLE_KEY` | 💪 헬스앱 프로젝트 service_role |

> ⚠ `service_role` 키는 RLS 를 우회하는 **비밀 키**입니다. 절대 클라이언트/깃에 노출하지 마세요.
> `admin-clients.ts` 는 `server-only` 로 보호돼 클라이언트 번들에 섞이면 빌드가 깨집니다.

## 관리자 추가

헬스앱 Supabase 의 `admins` 테이블에 이메일을 추가하면 그 계정으로 이 콘솔에 로그인됩니다.
(헬스앱 관리자 = 통합 콘솔 관리자.)

## 다음 작업 (사이트별 UI 채우기)

각 사이트의 관리할 **테이블 목록**을 알려주면 `admin/<site>/` 에 목록·검색·수정 UI를 붙입니다.
헬스앱은 `profiles` 회원수 지표가 예시로 연결돼 있습니다.