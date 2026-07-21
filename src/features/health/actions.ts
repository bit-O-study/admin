"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/features/admin/admin";
import { genTempPassword, tempPasswordEmail } from "@/features/health/password-reset";
import { sendEmail } from "@/lib/email/send";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

export type ResetPasswordResult =
  | { ok: true; tempPassword: string; emailed: boolean; note?: string }
  | { ok: false; error: string };

/** 정지/차단 값을 admin_set_user_ban RPC 로 설정(관리자 게이트는 DB 함수 내부 + 여기 이중). */
async function setUserBan(
  userId: string,
  suspendedUntil: string | null,
  bannedAt: string | null,
  reason: string | null,
): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  if (!userId) return { ok: false, error: "회원이 올바르지 않습니다." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_set_user_ban", {
    p_user_id: userId,
    p_suspended_until: suspendedUntil,
    p_banned_at: bannedAt,
    p_reason: reason,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/members");
  return { ok: true };
}

/** 기간 정지 — days 일 후 자동 해제. */
export async function suspendUserAction(
  userId: string,
  days: number,
  reason?: string,
): Promise<AdminActionResult> {
  if (!Number.isFinite(days) || days <= 0 || days > 3650) {
    return { ok: false, error: "정지 기간(일)이 올바르지 않습니다." };
  }
  const until = new Date(Date.now() + days * 86_400_000).toISOString();
  return setUserBan(userId, until, null, reason?.trim() || null);
}

/** 영구정지. */
export async function banUserAction(
  userId: string,
  reason?: string,
): Promise<AdminActionResult> {
  const now = new Date().toISOString();
  return setUserBan(userId, null, now, reason?.trim() || null);
}

/** 정지/영구정지 해제. */
export async function unbanUserAction(
  userId: string,
): Promise<AdminActionResult> {
  return setUserBan(userId, null, null, null);
}

/** 회원 비밀번호를 임시 비밀번호로 초기화. */
export async function resetMemberPasswordAction(
  userId: string,
  email: string | null,
): Promise<ResetPasswordResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  if (!userId) return { ok: false, error: "회원이 올바르지 않습니다." };

  const supabase = await createSupabaseServerClient();
  const temp = genTempPassword();
  const { error } = await supabase.rpc("admin_reset_user_password", {
    p_user_id: userId,
    p_password: temp,
  });
  if (error) return { ok: false, error: error.message };

  let emailed = false;
  let note: string | undefined;
  if (email) {
    const { subject, html, text } = tempPasswordEmail(temp);
    const r = await sendEmail({ to: email, subject, html, text });
    if (r.ok) {
      emailed = !r.skipped;
      if (r.skipped) {
        note = "메일 발송이 설정되지 않아 보내지 못했습니다. 임시 비번을 직접 전달하세요.";
      }
    } else {
      note = `메일 발송 실패: ${r.error}`;
    }
  } else {
    note = "이메일 정보가 없어 메일을 보내지 못했습니다. 임시 비번을 직접 전달하세요.";
  }

  revalidatePath("/admin/health/members");
  return { ok: true, tempPassword: temp, emailed, note };
}

/** 회원탈퇴 복구 — withdrawn_at = null. */
export async function restoreUserAction(
  userId: string,
): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  if (!userId) return { ok: false, error: "회원이 올바르지 않습니다." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("admin_restore_user", {
    p_user_id: userId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/members");
  return { ok: true };
}