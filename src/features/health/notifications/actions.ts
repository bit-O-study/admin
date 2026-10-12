"use server";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/features/admin/admin";
import { uuid } from "./model";
import { dispatchSupport } from "./messaging.server";
export async function supportNotificationAction(kind: "save" | "disconnect" | "test" | "dispatch", enabled = true, push = false) {
  const user = await getCurrentUser();
  if (!user || !(await isAdminUser())) return { error: "관리자 권한이 필요해요." };
  const db = createSupabaseAdminClient();
  if (!db) return { error: "서버 관리자 키 설정이 필요해요." };
  if (kind === "save") {
    const { error } = await db.from("support_kakao_connections").upsert({ user_id: user.id, enabled, push_enabled: push }, { onConflict: "user_id" });
    if (error) return { error: "설정을 저장하지 못했어요." };
  } else if (kind === "disconnect") {
    const { error } = await db.from("support_kakao_connections").update({ state: "disconnected", tokens: null, kakao_id: null, lease_id: null, lease_until: null }).eq("user_id", user.id);
    if (error) return { error: "연결 해제에 실패했어요." };
    await db.from("support_notification_outbox").update({ status: "canceled" }).eq("recipient_id", user.id).in("status", ["queued", "quota_deferred", "needs_reconnect"]);
  } else if (kind === "test") {
    const { data: c } = await db.from("support_kakao_connections").select("state,enabled").eq("user_id", user.id).maybeSingle();
    if (!c || c.state !== "connected" || !c.enabled) return { error: "먼저 카카오 계정을 연결하고 알림을 켜 주세요." };
    const { count } = await db.from("support_notification_outbox").select("id", { count: "exact", head: true }).eq("recipient_id", user.id).eq("kind", "test").gte("created_at", new Date(Date.now() - 86400000).toISOString());
    if ((count ?? 15) >= 3) return { error: "테스트 발송은 하루 3회까지예요." };
    const { error } = await db.from("support_notification_outbox").insert({ event_id: randomUUID(), recipient_id: user.id, kind: "test" });
    if (error) return { error: "테스트 요청을 저장하지 못했어요." };
    await dispatchSupport({ recipientId: user.id, test: true });
  } else if (kind === "dispatch") await dispatchSupport({ recipientId: user.id });
  revalidatePath("/admin/health/support/notifications");
  return { ok: true };
}

export async function retrySupportNotification(id: string, confirmed: boolean) {
  if (!confirmed || !uuid(id) || !(await isAdminUser())) return { error: "중복 수신 가능성을 확인해 주세요." };
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요해요." };
  const db = await createSupabaseServerClient();
  const { error } = await db.rpc("support_retry", { p_id: id });
  if (error) return { error: "재전송할 수 없어요. 이미 처리된 요청인지 확인해 주세요." };
  after(async () => { await dispatchSupport({recipientId:user.id}).catch(()=>undefined); });
  revalidatePath("/admin/health/support/notifications");return {ok:true};
}
