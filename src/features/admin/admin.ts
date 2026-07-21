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
 */
export const isAdminUser = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("admins").select("email").limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
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