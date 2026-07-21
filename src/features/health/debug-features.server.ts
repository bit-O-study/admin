import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/features/admin/admin";
import {
  DEBUG_ACCOUNTS_KEY,
  DEBUG_FEATURES,
  debugSettingKey,
  debugValueToVisibility,
  normalizeDebugAccounts,
  type DebugVisibility,
} from "@/features/health/debug-features";

/** 디버그 기능별 노출 범위(미설정=기본 'debug'). */
export async function getDebugFeatureStates(): Promise<
  Record<string, DebugVisibility>
> {
  const out: Record<string, DebugVisibility> = {};
  for (const f of DEBUG_FEATURES) out[f.id] = "debug";
  if (!(await isAdminUser())) return out;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("app_settings")
    .select("key, value")
    .in(
      "key",
      DEBUG_FEATURES.map((f) => debugSettingKey(f.id)),
    );
  for (const r of (data ?? []) as { key: string; value: unknown }[]) {
    const id = r.key.replace(/^debug\./, "");
    if (id in out) out[id] = debugValueToVisibility(r.value);
  }
  return out;
}

/** 지정된 디버그 계정(이메일) 목록. */
export async function getDebugAccounts(): Promise<string[]> {
  if (!(await isAdminUser())) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", DEBUG_ACCOUNTS_KEY)
    .maybeSingle();
  return normalizeDebugAccounts((data as { value: unknown } | null)?.value);
}