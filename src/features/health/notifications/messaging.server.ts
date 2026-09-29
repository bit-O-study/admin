import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { seal, unseal } from "./crypto";
import { kakaoResult, supportConsoleUrl } from "./model";

export function kakaoConfig() {
  const origin = process.env.ADMIN_CONSOLE_ORIGIN || "https://heltch-admin.vercel.app";
  const key = process.env.KAKAO_REST_API_KEY;
  const encryption = process.env.SUPPORT_TOKEN_ENCRYPTION_KEY;
  if (!origin || !key || !encryption || !/^[0-9a-f]{64}$/i.test(encryption)) return null;
  try {
    const url = new URL(origin);
    const authUrl = new URL(process.env.SUPPORT_KAKAO_CALLBACK_ORIGIN || "https://health-app-five-iota.vercel.app");
    for (const value of [url, authUrl]) {
      if (value.username || value.password || (value.protocol !== "https:" && !(value.protocol === "http:" && ["localhost", "127.0.0.1"].includes(value.hostname)))) return null;
    }
    return { origin: url.origin, authOrigin: authUrl.origin, key, encryption, secret: process.env.KAKAO_CLIENT_SECRET, callback: `${authUrl.origin}/api/support/kakao/callback` };
  } catch { return null; }
}
type Tokens = { access_token: string; refresh_token: string };
type Connection = { user_id: string; tokens: string; token_expires_at: string; refresh_expires_at: string; push_enabled: boolean };
export async function dispatchSupport(options: { recipientId?: string; ticketId?: string; test?: boolean } = {}) {
  const db = createSupabaseAdminClient();
  if (!db) return;
  let recipients: string[];
  if (options.recipientId) recipients = [options.recipientId];
  else {
    let q = db.from("support_notification_outbox").select("recipient_id").in("status", ["queued", "quota_deferred", "needs_reconnect"]);
    if (options.ticketId) q = q.eq("ticket_id", options.ticketId);
    const { data } = await q.limit(100);
    recipients = [...new Set((data ?? []).map(r => r.recipient_id as string))].slice(0, 5);
  }
  for (const userId of recipients) {
    const config = kakaoConfig();
    if (!config) continue;
    const { data: claim, error } = await db.rpc("support_claim", { p_user: userId, p_test: options.test ?? false });
    if (error || !claim) continue;
    const { batch, count, connection } = claim as { batch: string; count: number; connection: Connection };
    let result: { status: string; code: string | null } = { status: "unknown", code: "interrupted" };
    try {
      const tokens = JSON.parse(unseal(connection.tokens, config.encryption)) as Tokens;
      if (Date.parse(connection.token_expires_at) <= Date.now() + 60000) {
        const form = new URLSearchParams({ grant_type: "refresh_token", client_id: config.key, refresh_token: tokens.refresh_token });
        if (config.secret) form.set("client_secret", config.secret);
        const refresh = await fetch("https://kauth.kakao.com/oauth/token", { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
        const body = await refresh.json();
        if (!refresh.ok || typeof body.access_token !== "string") {
          result = refresh.status >= 400 && refresh.status < 500 ? { status: "needs_reconnect", code: "refresh_rejected" } : { status: "failed", code: "refresh_unavailable" };
          throw new Error("refresh");
        }
        tokens.access_token = body.access_token;
        if (typeof body.refresh_token === "string") tokens.refresh_token = body.refresh_token;
        const { data: saved, error: saveError } = await db.from("support_kakao_connections").update({
          tokens: seal(JSON.stringify(tokens), config.encryption), token_expires_at: new Date(Date.now() + body.expires_in * 1000).toISOString(),
          ...(body.refresh_token_expires_in ? { refresh_expires_at: new Date(Date.now() + body.refresh_token_expires_in * 1000).toISOString() } : {}),
        }).eq("user_id", userId).eq("lease_id", batch).eq("state", "connected").select("user_id").maybeSingle();
        if (saveError || !saved) { result = { status: "canceled", code: "connection_changed" }; throw new Error("changed"); }
      }
      // Recheck after refresh; never continue with a revoked local connection.
      const { data: active } = await db.from("support_kakao_connections").select("user_id").eq("user_id", userId).eq("state", "connected").eq("enabled", true).eq("lease_id", batch).maybeSingle();
      if (!active) { result = { status: "canceled", code: "connection_changed" }; throw new Error("changed"); }
      const { data: items } = await db.from("support_notification_outbox").select("ticket_id,kind").eq("batch_id", batch);
      const single = count === 1 ? items?.[0]?.ticket_id : null;
      const link = supportConsoleUrl(single);
      const text = options.test ? "[헬쑤 고객센터] 무료 카카오 연결 테스트입니다." : `[헬쑤 고객센터] 확인할 문의 알림 ${count}건이 있습니다. 통합 관리자 콘솔에서 확인해 주세요.`;
      const form = new URLSearchParams({ template_object: JSON.stringify({ object_type: "text", text: `${text}\n${link}`, link: { web_url: link, mobile_web_url: link }, button_title: "통합 관리자에서 확인" }) });
      const response = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", { method: "POST", headers: { Authorization: `Bearer ${tokens.access_token}` }, body: form, signal: AbortSignal.timeout(8000) });
      result = kakaoResult(response.status, await response.json());
    } catch { /* No raw token/provider response in logs; an uncertain send is never retried automatically. */ }
    await db.from("support_notification_outbox").update({ status: result.status, error_code: result.code }).eq("batch_id", batch).eq("status", "processing");
    await db.from("support_kakao_connections").update({ lease_id: null, lease_until: null, ...(result.status === "needs_reconnect" ? { state: "needs_reconnect" } : {}) }).eq("user_id", userId).eq("lease_id", batch);
  }
}
