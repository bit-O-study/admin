"use server";

import { revalidatePath } from "next/cache";

import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { isAdminUser } from "@/features/admin/admin";

export type TeamActionResult = { ok: true } | { ok: false; error: string };

const trim = (v: unknown, max: number): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length === 0 ? null : s.slice(0, max);
};

/**
 * 승인·연장 — **관리자만**. 입금을 확인한 사람이 기간과 금액을 넣는다.
 *
 * 🔴 관리자 여부를 여기서도 본다. RLS 가 이미 막지만, 서버 액션은 주소만 알면 누구나
 * 부를 수 있어서 **막힌 이유가 화면에 안 보이면** 그대로 배포되는 사고가 난다.
 * 여기서 먼저 걸러야 로그와 오류 문구가 정직해진다.
 */
export async function approveTeamPlanAction(input: {
  groupId: string;
  periodStart: string;
  periodEnd: string;
  priceKrw: number;
  seats: number;
  memo?: string;
}): Promise<TeamActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "관리자만 할 수 있어요." };
  const YMD = /^\d{4}-\d{2}-\d{2}$/;
  if (!YMD.test(input.periodStart) || !YMD.test(input.periodEnd))
    return { ok: false, error: "이용 기간을 확인해 주세요." };
  if (input.periodEnd < input.periodStart)
    return { ok: false, error: "종료일이 시작일보다 빠릅니다." };
  const price = Math.max(0, Math.trunc(Number(input.priceKrw) || 0));
  const seats = Math.max(0, Math.trunc(Number(input.seats) || 0));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("team_subscriptions")
    .update({
      status: "active",
      period_start: input.periodStart,
      period_end: input.periodEnd,
      price_krw: price,
      seats,
      memo: trim(input.memo, 500),
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("group_id", input.groupId);
  if (error) return { ok: false, error: "승인하지 못했어요." };

  revalidatePath("/admin/health/billing");
  return { ok: true };
}

/** 해지(관리자) — 기간은 그대로 두고 상태만 바꾼다. 남은 기간은 그대로 쓰게 한다. */
export async function cancelTeamPlanAction(
  groupId: string,
): Promise<TeamActionResult> {
  if (!(await isAdminUser())) return { ok: false, error: "관리자만 할 수 있어요." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("team_subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("group_id", groupId);
  if (error) return { ok: false, error: "해지하지 못했어요." };
  revalidatePath("/admin/health/billing");
  return { ok: true };
}
