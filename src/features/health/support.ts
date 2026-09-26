import "server-only";

import { notFound } from "next/navigation";

import { isAdminUser } from "@/features/admin/admin";
import { adminDb } from "@/lib/supabase/admin-clients";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import {
  isUuid,
  parseSupportFilters,
  SUPPORT_PAGE_SIZE,
  type SupportFilters,
  type SupportTicket,
} from "@/features/health/support-model";

/**
 * 헬쑤 고객센터 데이터 — 로그인한 관리자 **세션**으로 조회한다.
 * support_* 테이블 RLS 가 public.is_admin() 으로 관리자에게 전체 조회를 허용한다.
 */
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !(await isAdminUser())) notFound();
  return { user, db: await createSupabaseServerClient() };
}

export async function getSupportTickets(filters: SupportFilters) {
  const { user, db } = await requireAdmin();
  const q = parseSupportFilters(filters);

  let query = db
    .from("support_tickets")
    .select(
      "id,number,user_id,title,category,status,priority,assignee,diagnostics,created_at,updated_at,admin_read_at",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });
  if (q.status) query = query.eq("status", q.status);
  if (q.category) query = query.eq("category", q.category);
  if (q.number !== null) query = query.eq("number", q.number);
  if (q.titleLike) query = query.ilike("title", q.titleLike);
  if (q.mine) query = query.eq("assignee", user.id);
  if (q.from) query = query.gte("created_at", q.from);
  if (q.to) query = query.lte("created_at", q.to);

  const [list, unread] = await Promise.all([
    query.range((q.page - 1) * SUPPORT_PAGE_SIZE, q.page * SUPPORT_PAGE_SIZE - 1),
    db
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .is("admin_read_at", null),
  ]);

  return {
    page: q.page,
    tickets: (list.data ?? []) as SupportTicket[],
    total: list.count ?? 0,
    unread: unread.count ?? 0,
    error: Boolean(list.error),
  };
}

/** 첨부 사진은 비공개 버킷 — 서명 URL 은 service_role 로만 만든다. env 가 없으면 URL 없이. */
async function signedUrl(path: string): Promise<string | undefined> {
  try {
    const { data } = await adminDb("health")
      .storage.from("support-private")
      .createSignedUrl(path, 300);
    return data?.signedUrl;
  } catch {
    return undefined;
  }
}

export async function getSupportTicket(id: string) {
  if (!isUuid(id)) notFound();
  const { db } = await requireAdmin();

  const { data: ticket, error } = await db
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("문의를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  if (!ticket) notFound();

  const [messages, files, notes, events, deliveries] = await Promise.all([
    db
      .from("support_messages")
      .select("id,body,is_admin,created_at")
      .eq("ticket_id", id)
      .order("created_at")
      .limit(200),
    db.from("support_attachments").select("id,path").eq("ticket_id", id).eq("ready", true),
    db
      .from("support_internal_notes")
      .select("id,body,created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("support_events")
      .select("id,kind,detail,created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("support_notification_outbox")
      .select("id,status,error_code,created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  if ([messages, files, notes, events, deliveries].some((r) => r.error)) {
    throw new Error("문의 내역을 불러오지 못했어요.");
  }

  const attachments = await Promise.all(
    ((files.data ?? []) as { id: string; path: string }[]).map(async (f) => ({
      id: f.id,
      url: await signedUrl(f.path),
    })),
  );

  return {
    ticket: ticket as SupportTicket,
    messages: (messages.data ?? []) as { id: string; body: string; is_admin: boolean; created_at: string }[],
    attachments,
    notes: (notes.data ?? []) as { id: string; body: string; created_at: string }[],
    events: (events.data ?? []) as { id: string; kind: string; detail: string | null; created_at: string }[],
    deliveries: (deliveries.data ?? []) as { id: string; status: string; error_code: string | null; created_at: string }[],
  };
}
