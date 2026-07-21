import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isPostModerator } from "@/features/admin/admin";
import type { ReportTargetKind } from "@/features/health/report";

export type ReportRow = {
  id: string;
  targetKind: ReportTargetKind;
  targetId: string;
  targetUserId: string | null;
  targetAuthor: string | null;
  targetPreview: string | null;
  reason: string;
  status: "open" | "resolved";
  createdAt: string;
};

/** 신고 목록(모더레이터 전용). 미처리(open) 우선, 최신순. */
export async function getReports(limit = 200): Promise<ReportRow[]> {
  if (!(await isPostModerator())) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("post_reports")
    .select(
      "id, target_kind, target_id, target_user_id, target_author, target_preview, reason, status, created_at",
    )
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  return (
    (data ?? []) as {
      id: string;
      target_kind: ReportTargetKind;
      target_id: string;
      target_user_id: string | null;
      target_author: string | null;
      target_preview: string | null;
      reason: string;
      status: "open" | "resolved";
      created_at: string;
    }[]
  ).map((r) => ({
    id: r.id,
    targetKind: r.target_kind,
    targetId: r.target_id,
    targetUserId: r.target_user_id,
    targetAuthor: r.target_author,
    targetPreview: r.target_preview,
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at,
  }));
}