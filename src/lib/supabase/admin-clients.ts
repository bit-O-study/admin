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

/** 해당 사이트의 service_role 키가 .env 에 설정돼 있는지. */
export function isSiteConfigured(site: SiteKey): boolean {
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