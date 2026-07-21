import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 헬스앱 관리자 데이터 조회 — 로그인한 관리자 **세션**으로 호출한다.
 * (통합 콘솔은 헬스 Supabase 로 로그인하므로 admin_* RPC 의 is_admin() 게이트를 통과.
 *  service_role 이 아니라 세션이어야 JWT 이메일이 admins 에 매칭됨.)
 */
export type MemberRow = {
  userId: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  gender: string | null;
  experience: string | null;
  heightCm: number | null;
  weightKg: number | null;
  createdAt: string;
  suspendedUntil: string | null;
  bannedAt: string | null;
  banReason: string | null;
  withdrawnAt: string | null;
};

/** 전체 회원 목록 — admin_members() RPC (SECURITY DEFINER, is_admin 게이트). */
export async function getMembers(): Promise<MemberRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_members");
  if (error || !data) return [];
  return (
    data as {
      user_id: string;
      email: string | null;
      name: string | null;
      phone: string | null;
      gender: string | null;
      experience: string | null;
      height_cm: number | null;
      weight_kg: number | string | null;
      created_at: string;
      suspended_until: string | null;
      banned_at: string | null;
      ban_reason: string | null;
      withdrawn_at: string | null;
    }[]
  ).map((r) => ({
    userId: r.user_id,
    email: r.email,
    name: r.name,
    phone: r.phone,
    gender: r.gender,
    experience: r.experience,
    heightCm: r.height_cm,
    weightKg:
      r.weight_kg === null || r.weight_kg === "" ? null : Number(r.weight_kg),
    createdAt: r.created_at,
    suspendedUntil: r.suspended_until,
    bannedAt: r.banned_at,
    banReason: r.ban_reason,
    withdrawnAt: r.withdrawn_at,
  }));
}

/** 활동(접속) 유저수 시계열 — admin_active_users(p_gran) RPC. */
export async function getActiveUsersSeries(
  gran: "day" | "month" | "year",
): Promise<{ bucket: string; users: number }[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("admin_active_users", {
    p_gran: gran,
  });
  if (error || !data) return [];
  return (data as { bucket: string; users: number }[]).map((r) => ({
    bucket: typeof r.bucket === "string" ? r.bucket.slice(0, 10) : r.bucket,
    users: r.users,
  }));
}