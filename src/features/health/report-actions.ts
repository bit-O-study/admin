"use server";

import { revalidatePath } from "next/cache";

import {
  createSupabaseServerClient,
  getCurrentUser,
} from "@/lib/supabase/server";
import { isPostModerator } from "@/features/admin/admin";
import { suspendUserAction } from "@/features/health/actions";
import type { ReportTargetKind } from "@/features/health/report";

type Result = { ok: true } | { ok: false; error: string };

const TABLE: Record<ReportTargetKind, string> = {
  community_post: "community_posts",
  community_comment: "community_comments",
  teaching_post: "teaching_posts",
  teaching_comment: "teaching_comments",
};

async function requireModerator() {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "로그인이 필요합니다." };
  if (!(await isPostModerator())) {
    return { ok: false as const, error: "권한이 없습니다." };
  }
  return { ok: true as const };
}

/** 신고 처리완료 표시. */
export async function resolveReportAction(reportId: string): Promise<Result> {
  return setReportStatus(reportId, "resolved");
}

/** 처리완료한 신고를 다시 미처리로(잘못 닫았을 때 되돌리기). */
export async function reopenReportAction(reportId: string): Promise<Result> {
  return setReportStatus(reportId, "open");
}

async function setReportStatus(
  reportId: string,
  status: "open" | "resolved",
): Promise<Result> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("post_reports")
    .update({ status })
    .eq("id", reportId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/reports");
  return { ok: true };
}

/**
 * 신고된 글/댓글 삭제. 댓글 신고면 그 댓글만 지운다(글은 그대로).
 * 삭제해도 신고는 열어둔 채로 둔다 — 이어서 작성자 정지도 걸 수 있어야 하므로.
 */
export async function deleteReportedContentAction(
  targetKind: ReportTargetKind,
  targetId: string,
): Promise<Result> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;
  const supabase = await createSupabaseServerClient();

  // .select() 로 실제 지워진 행을 확인한다 — RLS 로 0행만 지워져도 error 는 안 난다.
  const del = await supabase
    .from(TABLE[targetKind])
    .delete()
    .eq("id", targetId)
    .select("id");
  if (del.error) return { ok: false, error: del.error.message };
  if (!del.data || del.data.length === 0) {
    return { ok: false, error: "이미 삭제됐거나 삭제 권한이 없습니다." };
  }

  revalidatePath("/admin/health/reports");
  return { ok: true };
}

/**
 * 신고된 작성자 정지.
 * ⚠ 정지해도 신고는 닫지 않는다 — 정지 뒤에 게시글/댓글 삭제도 해야 하기 때문.
 */
export async function suspendReportedUserAction(
  userId: string,
  days: number,
  reason?: string,
): Promise<Result> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;

  const r = await suspendUserAction(userId, days, reason);
  if (!r.ok) return r;

  revalidatePath("/admin/health/reports");
  return { ok: true };
}