"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/features/admin/admin";
import { safeRedirectPath } from "@/lib/redirect";
import { SIGN_IN_FAILED } from "./messages";

export type SignInState = { error: string | null };

/**
 * 이메일/비밀번호로 로그인 → 관리자(admins)인지 확인.
 * 관리자가 아니면 **이 브라우저 세션만** 로그아웃(scope local — 그 회원의 헬스앱 다른 기기 세션은 그대로)
 * 하고 같은 실패 문구를 돌려준다. 성공 시 redirect(검증된 /admin 경로) 또는 /admin 으로.
 */
export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력하세요." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: SIGN_IN_FAILED };
  }

  if (!(await isAdminUser())) {
    await supabase.auth.signOut({ scope: "local" });
    return { error: SIGN_IN_FAILED };
  }

  redirect(safeRedirectPath(formData.get("redirect")));
}

/** 로그아웃 → 로그인 화면. 이 브라우저(콘솔) 세션만 끝낸다. */
export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
