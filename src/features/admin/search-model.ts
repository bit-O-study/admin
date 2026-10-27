/**
 * 통합 검색 순위 (2026-10-27 BOadmin 2.0) — 순수 모듈.
 * 회원·신고는 이미 불러온 목록에서 고르고, 문의는 DB 검색(번호·제목) 결과를 그대로 쓴다.
 * 결과에는 전화번호를 싣지 않는다 — 전화 뒤 4자리로 찾을 수는 있지만 화면에는 이름·메일만.
 */
import { banStateOf, BAN_STATE_LABEL } from "@/features/health/ban";
import { isVerificationUser } from "@/features/health/member-filter";
import { reportKindLabel, type ReportTargetKind } from "@/features/health/report";

export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_LIMIT = 5;

type MemberLike = {
  userId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  suspendedUntil: string | null;
  bannedAt: string | null;
  withdrawnAt: string | null;
};
export type MemberHit = { id: string; name: string; email: string; state: string };

/** 점수: 메일 전체 일치 > 메일 앞부분 > 이름 앞부분 > 전화 뒤 4자리 > 이름 포함 > 메일 포함. */
export function memberScore(m: MemberLike, q: string): number {
  const s = q.trim().toLowerCase();
  if (s.length < SEARCH_MIN_LENGTH) return 0;
  const email = (m.email ?? "").toLowerCase();
  const name = (m.name ?? "").toLowerCase();
  const digits = s.replace(/\D/g, "");
  const phone = (m.phone ?? "").replace(/\D/g, "");
  if (email && email === s) return 100;
  if (email.startsWith(s)) return 80;
  if (name.startsWith(s)) return 70;
  if (/^\d{4}$/.test(s) && phone.endsWith(digits)) return 60;
  if (name.includes(s)) return 50;
  if (email.includes(s)) return 40;
  return 0;
}

export function searchMembers(q: string, members: readonly MemberLike[], now = new Date(), limit = SEARCH_LIMIT): MemberHit[] {
  return members
    .filter((m) => !isVerificationUser(m))
    .map((m) => ({ m, score: memberScore(m, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.m.name ?? "").localeCompare(b.m.name ?? "", "ko"))
    .slice(0, limit)
    .map(({ m }) => ({
      id: m.userId,
      name: m.name ?? "이름 미입력",
      email: m.email ?? "",
      state: m.withdrawnAt ? "탈퇴" : BAN_STATE_LABEL[banStateOf({ suspendedUntil: m.suspendedUntil, bannedAt: m.bannedAt }, now)],
    }));
}

type ReportLike = { id: string; targetKind: ReportTargetKind; targetPreview: string | null; targetAuthor: string | null; reason: string; status: "open" | "resolved" };
export type ReportHit = { id: string; title: string; hint: string; open: boolean };

/** 신고: 사유·내용·작성자에 검색어가 들어 있으면. 미처리를 먼저. */
export function searchReports(q: string, reports: readonly ReportLike[], limit = SEARCH_LIMIT): ReportHit[] {
  const s = q.trim().toLowerCase();
  if (s.length < SEARCH_MIN_LENGTH) return [];
  return reports
    .filter((r) => `${r.reason} ${r.targetPreview ?? ""} ${r.targetAuthor ?? ""}`.toLowerCase().includes(s))
    .sort((a, b) => Number(b.status === "open") - Number(a.status === "open"))
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      title: r.targetPreview?.trim() || r.reason,
      hint: `${reportKindLabel(r.targetKind)} · ${r.status === "open" ? "미처리" : "처리완료"} · 사유: ${r.reason}`,
      open: r.status === "open",
    }));
}
