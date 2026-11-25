import "server-only";

import { cache } from "react";

import {
  createSupabaseServerClient,
  getCurrentUser,
} from "@/lib/supabase/server";

/**
 * 현재 사용자가 관리자인지 — 헬스앱 admins 테이블(이메일) 기반.
 * RLS: 관리자는 admins 조회 가능, 비관리자는 0행 → 결과 유무로 판정.
 * (헬스앱과 동일 로직 — 관리자 계정을 헬스앱 admins 에 추가하면 이 콘솔도 열린다.)
 *
 * 관리자 판정은 여기 한 곳에서 한다(요청당 cache 로 1번). 미들웨어는 로그인 여부만 본다.
 */
export const isAdminUser = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("admins").select("email").limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
});

/** 관리자 아님 — 데이터 함수가 던진다. error.tsx 가 한국어로 보여 준다. */
export class AdminRequiredError extends Error {
  constructor() {
    super("관리자만 볼 수 있어요.");
    this.name = "AdminRequiredError";
  }
}

/**
 * service_role(RLS 우회) 데이터 함수의 첫 줄에 둔다.
 * Next 는 레이아웃과 페이지를 함께 렌더하므로 레이아웃 게이트만 믿으면 페이지 쪽 조회가 먼저 돈다.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminUser())) throw new AdminRequiredError();
}

/** 로그인한 관리자 본인 이메일(소문자). 관리자가 아니면 null. */
export const getCurrentAdminEmail = cache(async (): Promise<string | null> => {
  if (!(await isAdminUser())) return null;
  const user = await getCurrentUser();
  return user?.email?.trim().toLowerCase() ?? null;
});

/**
 * 게시물 관리자(모더레이터)인지 — is_post_moderator() RPC.
 * (관리자는 모두 모더레이터. 헬스 신고관리 게이트에 사용.)
 */
export const isPostModerator = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("is_post_moderator");
  if (error) return false;
  return data === true;
});
