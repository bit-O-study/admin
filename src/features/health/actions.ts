"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/features/admin/admin";
import { genTempPassword, tempPasswordEmail } from "@/features/health/password-reset";
import { sendEmail } from "@/lib/email/send";
import {
  DEBUG_ACCOUNTS_KEY,
  DEBUG_FEATURES,
  addDebugAccount,
  debugSettingKey,
  isDebugVisibility,
  normalizeDebugAccounts,
  removeDebugAccount,
  type DebugFeatureId,
  type DebugVisibility,
} from "@/features/health/debug-features";
import {
  GROUP_MODE_KEY,
  isGroupMode,
  type GroupMode,
} from "@/features/health/group-mode";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** 회원(이메일)을 관리자로 지정. */
export async function addAdminAction(email: string): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  const e = email.trim().toLowerCase();
  if (!isEmail(e)) return { ok: false, error: "올바른 이메일을 입력하세요." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("admins")
    .upsert({ email: e }, { onConflict: "email" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/settings");
  return { ok: true };
}

/** 관리자 해제. 마지막 1명은 제거 불가. */
export async function removeAdminAction(
  email: string,
): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("admins")
    .select("email", { count: "exact", head: true });
  if ((count ?? 0) <= 1) {
    return { ok: false, error: "마지막 관리자는 해제할 수 없습니다." };
  }
  const { error } = await supabase
    .from("admins")
    .delete()
    .eq("email", email.trim().toLowerCase());
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/settings");
  return { ok: true };
}

/** 게시물 관리자(모더레이터) 지정. */
export async function addPostModeratorAction(
  email: string,
): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  const e = email.trim().toLowerCase();
  if (!isEmail(e)) return { ok: false, error: "올바른 이메일을 입력하세요." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("post_moderators")
    .upsert({ email: e }, { onConflict: "email" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/settings");
  return { ok: true };
}

/** 게시물 관리자 해제. */
export async function removePostModeratorAction(
  email: string,
): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("post_moderators")
    .delete()
    .eq("email", email.trim().toLowerCase());
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/settings");
  return { ok: true };
}

/** 디버그 기능 노출 범위 설정. */
export async function setDebugFeatureAction(
  id: DebugFeatureId,
  visibility: DebugVisibility,
): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  if (!DEBUG_FEATURES.some((f) => f.id === id)) {
    return { ok: false, error: "알 수 없는 디버그 기능입니다." };
  }
  if (!isDebugVisibility(visibility)) {
    return { ok: false, error: "잘못된 노출 범위입니다." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("app_settings").upsert(
    {
      key: debugSettingKey(id),
      value: visibility,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/settings");
  return { ok: true };
}

/** 그룹탭 전역 모드 전환. */
export async function setGroupModeAction(
  mode: GroupMode,
): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  if (!isGroupMode(mode)) {
    return { ok: false, error: "잘못된 그룹 모드입니다." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("app_settings").upsert(
    { key: GROUP_MODE_KEY, value: mode, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/settings");
  return { ok: true };
}

async function readDebugAccounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<string[]> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", DEBUG_ACCOUNTS_KEY)
    .maybeSingle();
  return normalizeDebugAccounts((data as { value: unknown } | null)?.value);
}

async function writeDebugAccounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  list: string[],
): Promise<AdminActionResult> {
  const { error } = await supabase.from("app_settings").upsert(
    { key: DEBUG_ACCOUNTS_KEY, value: list, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/settings");
  return { ok: true };
}

/** 디버그 계정(이메일) 추가. */
export async function addDebugAccountAction(
  email: string,
): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  const supabase = await createSupabaseServerClient();
  const next = addDebugAccount(await readDebugAccounts(supabase), email);
  if (!next) return { ok: false, error: "올바른 이메일을 입력하세요." };
  return writeDebugAccounts(supabase, next);
}

/** 디버그 계정 해제. */
export async function removeDebugAccountAction(
  email: string,
): Promise<AdminActionResult> {
  if (!(await isAdminUser())) {
    return { ok: false, error: "관리자만 가능합니다." };
  }
  const supabase = await createSupabaseServerClient();
  const next = removeDebugAccount(await readDebugAccounts(supabase), email);
  return writeDebugAccounts(supabase, next);
}

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