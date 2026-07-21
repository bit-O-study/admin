import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * IQ 통계 조회 — 관리자 세션으로 헬스 Supabase 의 public RPC 호출.
 * (RPC 내부에서 is_admin() 게이트 → 비관리자는 0행)
 */
export type IqStats = {
  totalTests: number;
  avgIq: number | null;
  todayTests: number;
  totalVisits: number;
  todayVisits: number;
};

export async function getIqStats(): Promise<IqStats | null> {
  const s = await createSupabaseServerClient();
  const { data, error } = await s.rpc("iq_admin_stats");
  if (error || !Array.isArray(data) || data.length === 0) return null;
  const r = data[0] as {
    total_tests: number | string;
    avg_iq: number | string | null;
    today_tests: number | string;
    total_visits: number | string;
    today_visits: number | string;
  };
  return {
    totalTests: Number(r.total_tests),
    avgIq: r.avg_iq == null ? null : Number(r.avg_iq),
    todayTests: Number(r.today_tests),
    totalVisits: Number(r.total_visits),
    todayVisits: Number(r.today_visits),
  };
}

export type GradeCount = { grade: string; cnt: number };

export async function getIqGradeDistribution(): Promise<GradeCount[]> {
  const s = await createSupabaseServerClient();
  const { data } = await s.rpc("iq_grade_distribution");
  return ((data ?? []) as { grade: string; cnt: number | string }[]).map((r) => ({
    grade: r.grade ?? "-",
    cnt: Number(r.cnt),
  }));
}

export type IqResult = {
  name: string | null;
  age: number | null;
  correct: number;
  total: number;
  iq: number;
  grade: string | null;
  createdAt: string;
};

export async function getIqRecentResults(limit = 50): Promise<IqResult[]> {
  const s = await createSupabaseServerClient();
  const { data } = await s.rpc("iq_recent_results", { p_limit: limit });
  return (
    (data ?? []) as {
      name: string | null;
      age: number | null;
      correct: number;
      total: number;
      iq: number;
      grade: string | null;
      created_at: string;
    }[]
  ).map((r) => ({
    name: r.name,
    age: r.age,
    correct: r.correct,
    total: r.total,
    iq: r.iq,
    grade: r.grade,
    createdAt: r.created_at,
  }));
}