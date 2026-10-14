import { banStateOf } from "@/features/health/ban";
import type { MemberRow } from "@/features/health/data";

/**
 * 회원 목록 검색·상태 칩·페이지 나눔 (2026-10-14 리뉴얼).
 * 예전엔 검색·필터 없이 전체 회원을 한 번에 그렸다. 데이터는 그대로 받고 그리는 양만 줄인다.
 */
export type MemberView = "all" | "active" | "paid" | "blocked" | "withdrawn";
export const MEMBER_VIEWS: { value: MemberView; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "이용 중" },
  { value: "paid", label: "요금제" },
  { value: "blocked", label: "정지·차단" },
  { value: "withdrawn", label: "탈퇴" },
];
export const MEMBER_PAGE_SIZE = 30;

export function parseMemberView(v: string | undefined): MemberView {
  return MEMBER_VIEWS.some((x) => x.value === v) ? (v as MemberView) : "all";
}

/** 이름·이메일·전화(숫자만 비교) 부분 일치. 공백으로 나눈 낱말이 모두 들어 있어야 한다. */
export function matchesMember(m: Pick<MemberRow, "name" | "email" | "phone">, q: string): boolean {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = `${m.name ?? ""} ${m.email ?? ""}`.toLowerCase();
  const phone = (m.phone ?? "").replace(/\D/g, "");
  return words.every((w) => hay.includes(w) || (/\d/.test(w) && phone.includes(w.replace(/\D/g, ""))));
}

export function inView(m: MemberRow, view: MemberView, hasPlan: boolean, now = new Date()): boolean {
  if (view === "all") return true;
  if (view === "withdrawn") return Boolean(m.withdrawnAt);
  if (m.withdrawnAt) return false;
  const state = banStateOf({ suspendedUntil: m.suspendedUntil, bannedAt: m.bannedAt }, now);
  if (view === "blocked") return state !== "active";
  if (view === "paid") return hasPlan;
  return state === "active";
}

export function paginate<T>(rows: T[], page: number, size = MEMBER_PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pages);
  return { rows: rows.slice((current - 1) * size, current * size), page: current, pages };
}
