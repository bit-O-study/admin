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
  const gate = await requireModerator();
  if (!gate.ok) return gate;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("post_reports")
    .update({ status: "resolved" })
    .eq("id", reportId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/health/reports");
  return { ok: true };
}

/** 신고된 글/댓글 삭제 + 그 대상 신고 모두 처리완료. */
export async function deleteReportedContentAction(
  targetKind: ReportTargetKind,
  targetId: string,
): Promise<Result> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;
  const supabase = await createSupabaseServerClient();

  const del = await supabase.from(TABLE[targetKind]).delete().eq("id", targetId);
  if (del.error) return { ok: false, error: del.error.message };

  await supabase
    .from("post_reports")
    .update({ status: "resolved" })
    .eq("target_kind", targetKind)
    .eq("target_id", targetId);

  revalidatePath("/admin/health/reports");
  return { ok: true };
}

/** 신고된 작성자 정지 + 그 유저 관련 신고 닫기. */
export async function suspendReportedUserAction(
  userId: string,
  days: number,
  reason?: string,
): Promise<Result> {
  const gate = await requireModerator();
  if (!gate.ok) return gate;

  const r = await suspendUserAction(userId, days, reason);
  if (!r.ok) return r;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("post_reports")
    .update({ status: "resolved" })
    .eq("target_user_id", userId);

  revalidatePath("/admin/health/reports");
  return { ok: true };
}