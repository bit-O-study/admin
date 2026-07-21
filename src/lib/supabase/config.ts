/**
 * 헬스앱 Supabase 공개 설정 (로그인/세션용).
 *
 * publishable 키는 이름 그대로 **클라이언트 노출용 공개 키**라 소스에 두어도 안전하다
 * (이미 헬스앱 브라우저 번들에 공개돼 있음). 우선순위는 env > 기본값 — Vercel 등에서
 * NEXT_PUBLIC_SUPABASE_* 를 설정하면 그 값이 이긴다.
 *
 * ⚠ service_role 같은 비밀키는 여기 절대 넣지 않는다 — admin-clients.ts 에서 env 로만.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://hgfsfupazyjcrmophmzc.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_9QpBzKow2CuUP-5tUZVlCw_BfbM_PYR";