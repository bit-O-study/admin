"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/features/admin/admin";

export type SignInState = { error: string | null };

/**
 * 이메일/비밀번호로 로그인 → 관리자(admins)인지 확인.
 * 관리자가 아니면 즉시 로그아웃하고 에러 반환. 성공 시 /admin 으로.
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
    return { error: "로그인 실패 — 이메일/비밀번호를 확인하세요." };
  }

  if (!(await isAdminUser())) {
    await supabase.auth.signOut();
    return { error: "관리자 계정이 아닙니다. (헬스앱 admins 에 등록 필요)" };
  }

  redirect("/admin");
}

/** 로그아웃 → 로그인 화면 */
export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}