"use server";

import { revalidatePath } from "next/cache";

import { isAdminUser } from "@/features/admin/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isSupportManageInput,
  isUuid,
  SUPPORT_BASE,
  validateSupportReply,
} from "@/features/health/support-model";

type Result = { ok: true } | { ok: false; error: string };

function refresh(id: string) {
  revalidatePath(SUPPORT_BASE);
  revalidatePath(`${SUPPORT_BASE}/${id}`);
}

/**
 * 답변 또는 관리자 전용 메모. support_reply RPC 가 auth.uid()/is_admin() 으로 다시 검사하고,
 * requestId 로 중복 전송(재시도)을 막는다.
 */
export async function replySupportAction(
  id: string,
  requestId: string,
  body: string,
  internal: boolean,
): Promise<Result> {
  const invalid = validateSupportReply(body);
  if (invalid) return { ok: false, error: invalid };
  if (!isUuid(id) || !isUuid(requestId)) return { ok: false, error: "잘못된 요청이에요." };
  if (!(await isAdminUser())) return { ok: false, error: "관리자 권한이 필요해요." };
  const db = await createSupabaseServerClient();
  const { error } = await db.rpc("support_reply", {
    p_ticket: id,
    p_request: requestId,
    p_body: body,
    p_internal: internal,
  });
  if (error) return { ok: false, error: "저장하지 못했어요. 권한과 접속 상태를 확인해 주세요." };
  refresh(id);
  return { ok: true };
}

export async function manageSupportAction(
  id: string,
  status: string,
  priority: string,
  assign: boolean,
): Promise<Result> {
  if (!isUuid(id) || !isSupportManageInput(status, priority)) {
    return { ok: false, error: "잘못된 요청이에요." };
  }
  if (!(await isAdminUser())) return { ok: false, error: "관리자 권한이 필요해요." };
  const db = await createSupabaseServerClient();
  const { error } = await db.rpc("support_manage", {
    p_ticket: id,
    p_status: status,
    p_priority: priority,
    p_assign: assign,
  });
  if (error) return { ok: false, error: "변경하지 못했어요." };
  refresh(id);
  return { ok: true };
}

/** 관리자가 상세를 열면 admin_read_at 기록(미확인 배지 해제). */
export async function readSupportAction(id: string): Promise<void> {
  if (!isUuid(id) || !(await isAdminUser())) return;
  const db = await createSupabaseServerClient();
  await db.rpc("support_read", { p_ticket: id });
}
