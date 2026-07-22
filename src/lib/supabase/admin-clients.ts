import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 사이트별 데이터 접근용 service_role 클라이언트.
 *
 * ⚠ service_role 키는 RLS 를 우회한다 — 반드시 서버(서버 컴포넌트/서버 액션/route
 *   handler)에서만 import 한다. `server-only` 가 클라이언트 번들에 섞이면 빌드를 깨서
 *   실수로 노출되는 것을 막는다.
 */
export type SiteKey = "liquor" | "iq" | "health";

export const SITE_META: Record<
  SiteKey,
  { label: string; emoji: string }
> = {
  liquor: { label: "양주 가격조회", emoji: "🍶" },
  iq: { label: "아이큐", emoji: "🧠" },
  health: { label: "헬스앱", emoji: "💪" },
};

const CONFIG: Record<SiteKey, { url?: string; key?: string }> = {
  liquor: {
    url: process.env.LIQUOR_SUPABASE_URL,
    key: process.env.LIQUOR_SUPABASE_SERVICE_ROLE_KEY,
  },
  iq: {
    url: process.env.IQ_SUPABASE_URL,
    key: process.env.IQ_SUPABASE_SERVICE_ROLE_KEY,
  },
  health: {
    url: process.env.HEALTH_SUPABASE_URL,
    key: process.env.HEALTH_SUPABASE_SERVICE_ROLE_KEY,
  },
};

const clientCache = new Map<SiteKey, SupabaseClient>();

/**
 * 로그인한 관리자 **세션**(헬스 Supabase)으로 동작하는 사이트 — 별도 service_role
 * env 가 필요 없다. 헬스·아이큐는 admin_* / iq_* RPC 를 세션으로 호출하므로 항상
 * 연결된 것으로 본다. liquor 만 별도 프로젝트라 service_role env 로 판단한다.
 */
const SESSION_BASED: Record<SiteKey, boolean> = {
  liquor: false,
  iq: true,
  health: true,
};

/** 대시보드에서 이 사이트를 "연결됨"으로 볼지. */
export function isSiteConfigured(site: SiteKey): boolean {
  if (SESSION_BASED[site]) return true;
  const { url, key } = CONFIG[site];
  return Boolean(url && key);
}

/**
 * 사이트 데이터 접근용 클라이언트. 세션을 저장하지 않는 순수 service_role 연결.
 * env 가 없으면 명확한 에러를 던진다(페이지는 isSiteConfigured 로 먼저 가드).
 */
export function adminDb(site: SiteKey): SupabaseClient {
  const cached = clientCache.get(site);
  if (cached) return cached;

  const { url, key } = CONFIG[site];
  if (!url || !key) {
    throw new Error(
      `[${site}] Supabase service_role env 가 없습니다. .env.local 에 ` +
        `${site.toUpperCase()}_SUPABASE_URL / ${site.toUpperCase()}_SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.`,
    );
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  clientCache.set(site, client);
  return client;
}