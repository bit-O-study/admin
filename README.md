# heltch-admin — 통합 관리자 콘솔

## 짐꾼 수동 코칭

`/admin/health/coaching`에서 월990원 코칭 요청을 확인합니다. 활성 회원을 선택해 오늘 운동 추천이나 이번 주 리포트를 준비할 수도 있습니다. 초안 요청 내용을 복사해 Codex에 수동으로 작성 요청하고, 초안을 저장·검토한 뒤 **검토 완료 · 회원에게 전달**을 누릅니다. 초안은 회원에게 보이지 않으며 자동 AI 호출이나 자동 전송은 없습니다.

배포 전 헬스앱 저장소의 `supabase/migrations/202610010001_manual_coach.sql`을 같은 Supabase에 적용해야 합니다. 관리자 세션과 RLS/RPC를 사용하며 별도 service-role 키가 필요하지 않습니다. 앱에서는 Play 상품 `helssu_coach_monthly`와 결제 연동을 확인한 후에만 `MANUAL_COACH_BILLING_ENABLED=true`로 결제를 활성화합니다. 기존 개인 프리미엄은 월3,990원·오픈 준비 중으로 표시합니다.

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

## 헬쑤 관리

`/admin/health` 아래에서 회원·신고·운동 영상·요금제·트레이너·오류·크론·테스트·운영 설정·고객센터를 관리합니다. 입금 계좌와 펫 노출 설정, 카카오 연결·발송 내역·재전송도 콘솔에서 처리합니다. 사용자 작업은 관리자 확인 후 세션/RLS 또는 관리자 RPC를 사용합니다.

카카오 연결에는 헬쑤 서버와 같은 `KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`, `SUPPORT_TOKEN_ENCRYPTION_KEY`가 필요합니다. 기존 암호화 키를 그대로 사용해야 저장된 연결을 읽을 수 있습니다. 등록된 헬쑤 콜백이 콘솔로 전달하고 콘솔이 세션과 일회용 state를 검증하므로 두 저장소를 함께 배포해야 합니다. 운영 origin은 `.env.example`을 참고합니다. 문의 자동 발송·푸시·일일 크론은 헬쑤 서버에서 계속 실행합니다.

통합 로컬 E2E는 헬쑤 서버 `http://127.0.0.1:3000`, 콘솔 `http://127.0.0.1:3120`으로 실행하고 `E2E_BASE_URL`, `E2E_ADMIN_URL`에 각각 지정합니다. 실제 기기 카카오/푸시 클릭과 운영 배포는 별도 확인이 필요합니다.
