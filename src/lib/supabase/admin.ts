import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Privileged notification operations only; callers must verify the admin session first. */
export function createSupabaseAdminClient() {
  const url = process.env.HEALTH_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.HEALTH_SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
