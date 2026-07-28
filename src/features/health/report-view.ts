/**
 * 신고 처리 화면의 행 상태 판정 — 순수 함수(서버·UI 공용). (헬스앱과 동일 로직)
 *
 * 원칙: **어떤 조치도 다른 조치를 막지 않는다.**
 * - 작성자를 정지해도 그 신고는 닫히지 않는다 → 이어서 게시글/댓글 삭제 가능.
 * - 신고가 '처리완료' 여도 콘텐츠가 남아 있으면 삭제할 수 있고, 정지도 걸 수 있다.
 */
// 테스트(vitest, alias 없음)에서도 그대로 import 되도록 상대경로.
import { banStateOf, type BanState } from "./ban";

export type ReportActionInput = {
  status: "open" | "resolved";
  /** 신고 대상 글/댓글이 아직 DB에 남아 있는지. */
  contentExists: boolean;
  targetUserId: string | null;
  suspendedUntil?: string | null;
  bannedAt?: string | null;
};

export type ReportActionState = {
  resolved: boolean;
  contentDeleted: boolean;
  banState: BanState;
  canDelete: boolean;
  canSuspend: boolean;
};

export function reportActionState(
  input: ReportActionInput,
  now: Date = new Date(),
): ReportActionState {
  const banState = banStateOf(
    {
      suspendedUntil: input.suspendedUntil ?? null,
      bannedAt: input.bannedAt ?? null,
    },
    now,
  );
  return {
    resolved: input.status === "resolved",
    contentDeleted: !input.contentExists,
    banState,
    canDelete: input.contentExists,
    canSuspend: Boolean(input.targetUserId),
  };
}

/** 정지 버튼 문구 — 이미 정지 중이면 '기간 변경'으로. */
export function suspendButtonLabel(banState: BanState): string {
  if (banState === "banned") return "정지 기간 지정";
  if (banState === "suspended") return "정지 기간 변경";
  return "작성자 정지";
}

/**
 * 신고 시각 표기 — 한국시간 고정으로 **직접 조립**한다.
 * `toLocaleString("ko-KR")` 은 서버(Node ICU)와 브라우저의 로케일 데이터가 달라
 * "오전" vs "AM" 으로 갈리면서 하이드레이션 미스매치를 냈다.
 */
export function formatReportTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const kst = new Date(t + 9 * 60 * 60 * 1000); // UTC+9 고정
  const mm = String(kst.getUTCMinutes()).padStart(2, "0");
  const h24 = kst.getUTCHours();
  const half = h24 < 12 ? "오전" : "오후";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${kst.getUTCFullYear()}. ${kst.getUTCMonth() + 1}. ${kst.getUTCDate()}. ${half} ${h12}:${mm}`;
}

/** 정지 상태 뱃지 문구. active 면 null(뱃지 없음). */
export function banBadgeLabel(
  banState: BanState,
  suspendedUntil?: string | null,
): string | null {
  if (banState === "banned") return "영구정지";
  if (banState !== "suspended") return null;
  if (!suspendedUntil) return "정지 중";
  const t = new Date(suspendedUntil).getTime();
  if (!Number.isFinite(t)) return "정지 중";
  const kst = new Date(t + 9 * 60 * 60 * 1000);
  return `정지 중 · ~${kst.getUTCFullYear()}. ${kst.getUTCMonth() + 1}. ${kst.getUTCDate()}.`;
}