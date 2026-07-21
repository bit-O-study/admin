# CLAUDE.md — heltch-admin

이 파일은 세션 시작 시 자동으로 읽힌다. 따를 것.

## 🔴 커밋 기여자 규칙 (Commit author — mandatory)

**모든 커밋은 `bong94688 <bong94688@gmail.com>` 이름/이메일로만 한다.**
커밋 작성자·기여자에 **Claude / Anthropic / Co-Authored-By 가 절대 남으면 안 된다.**

- 커밋 메시지에 `Co-Authored-By: Claude ...`, `Generated with Claude Code` 같은 트레일러 금지.
- 커밋 실행: `git -c user.name="bong94688" -c user.email="bong94688@gmail.com" commit ...`
- PR 본문에도 Claude 생성 표기를 넣지 않는다.

## 🔴 커밋만 한다 — push·PR 은 사용자가

작업이 끝나면 커밋까지만. `git push` / PR 생성 / 배포 승격은 사용자가 직접 (명시 요청 시 예외).

## 🔴 멈추지 말고 자율 진행

받은 작업은 불필요한 진행 확인 없이 끝까지 자율적으로. (단, 파괴적/되돌리기 어려운 작업·진짜 갈림길은 확인.)

## 🔴 보안 — service_role 키

- `service_role` 키는 RLS 를 우회하는 비밀 키다. **절대 클라이언트 번들/깃에 노출 금지.**
- 데이터 접근은 반드시 서버(서버 컴포넌트/서버 액션/route handler)에서 `admin-clients.ts` 경유.
- `.env*.local` 은 gitignore — 키를 커밋하지 않는다.

## 프로젝트 개요

양주 가격조회 · 아이큐 · 헬스앱 **3개 Supabase 백엔드를 하나로 관리**하는 콘솔.

- 스택: Next 16 App Router · React 19 · Tailwind v4 · @supabase/ssr
- 로그인: 헬스앱 Supabase Auth + `admins` 테이블(RLS) 재사용
- 데이터: 사이트별 `service_role` 서버 클라이언트 (`src/lib/supabase/admin-clients.ts`)
- 패키지 매니저: `corepack pnpm <cmd>`
- middleware 는 `src/middleware.ts` (src 디렉터리 사용)

구조·env 는 `README.md` 참고.