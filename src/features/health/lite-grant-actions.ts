"use server";

import { revalidatePath } from "next/cache";

import { isAdminUser } from "@/features/admin/admin";
import { healthSessionDb } from "@/lib/supabase/admin-clients";

export type LiteGrantResult =
  | { ok: true; expiresAt: string | null }
  | { ok: false; error: string };

/** 한 번에 넣을 수 있는 개월 수 — DB 함수(admin_grant_lite)와 같은 범위. */
const MAX_MONTHS = 12;
/** DB 함수가 "결제 중인 구독이 있다"를 알리는 코드. */
const PAID_ACTIVE = "23505";

/**
 * 라이트(990원) 이용권 수동 지급 — **관리자만**. 결제 없이 기간만 넣는다.
 *
 * 🔴 결제 중인 구글 구독이 있는 회원에게는 지급하지 않는다(DB 함수가 거절). 그 행을
 * 덮으면 구매 토큰을 잃어 갱신·환불 소식이 닿지 않는다.
 */
export async function grantLiteAction(
  userId: string,
  months: number,
): Promise<LiteGrantResult> {
  if (!(await isAdminUser())) return { ok: false, error: "관리자만 가능합니다." };
  if (!userId || !Number.isInteger(months) || months < 1 || months > MAX_MONTHS)
    return { ok: false, error: `기간은 1~${MAX_MONTHS}개월로 선택해 주세요.` };
  const db = await healthSessionDb();
  const { data, error } = await db.rpc("admin_grant_lite", {
    p_user: userId,
    p_months: months,
  });
  if (error) {
    if (error.code === PAID_ACTIVE)
      return { ok: false, error: "결제 중인 구독이 있어 지급할 수 없습니다." };
    return { ok: false, error: "지급하지 못했습니다. DB 설정과 권한을 확인해 주세요." };
  }
  revalidatePath("/admin/health/members");
  revalidatePath("/admin/health/coaching");
  return { ok: true, expiresAt: typeof data === "string" ? data : null };
}

/** 지급 회수 — 지급한 이용권만 끝낸다. 결제한 구독은 구글 플레이에서만 끊을 수 있다. */
export async function revokeLiteAction(userId: string): Promise<LiteGrantResult> {
  if (!(await isAdminUser())) return { ok: false, error: "관리자만 가능합니다." };
  if (!userId) return { ok: false, error: "회원을 확인해 주세요." };
  const db = await healthSessionDb();
  const { data, error } = await db.rpc("admin_revoke_lite", { p_user: userId });
  if (error) return { ok: false, error: "회수하지 못했습니다. 다시 시도해 주세요." };
  if (data !== true) return { ok: false, error: "회수할 지급 이용권이 없습니다." };
  revalidatePath("/admin/health/members");
  revalidatePath("/admin/health/coaching");
  return { ok: true, expiresAt: null };
}
