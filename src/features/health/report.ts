/** 신고 대상 종류/라벨 — 순수 로직. (헬스앱에서 이식) */
export type ReportTargetKind =
  | "community_post"
  | "community_comment"
  | "teaching_post"
  | "teaching_comment";

const KIND_LABEL: Record<ReportTargetKind, string> = {
  community_post: "오운완 게시글",
  community_comment: "댓글",
  teaching_post: "운동 영상",
  teaching_comment: "운동 영상 댓글",
};

export function reportKindLabel(kind: ReportTargetKind): string {
  return KIND_LABEL[kind] ?? "게시물";
}