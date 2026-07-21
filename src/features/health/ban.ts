/**
 * 회원 정지/차단 상태 판정 — 순수 함수. (헬스앱에서 이식)
 * - banned_at 있으면 영구정지. suspended_until 미래면 기간정지. 둘 다 아니면 active.
 */
export type BanState = "active" | "suspended" | "banned";

export type BanFields = {
  suspendedUntil: string | null;
  bannedAt: string | null;
  withdrawnAt?: string | null;
};

export function banStateOf(p: BanFields, now: Date = new Date()): BanState {
  if (p.bannedAt) return "banned";
  if (p.suspendedUntil && new Date(p.suspendedUntil).getTime() > now.getTime()) {
    return "suspended";
  }
  return "active";
}

export function isWithdrawn(p: BanFields): boolean {
  return p.withdrawnAt != null;
}

export function isBlocked(p: BanFields, now: Date = new Date()): boolean {
  return isWithdrawn(p) || banStateOf(p, now) !== "active";
}

export const BAN_STATE_LABEL: Record<BanState, string> = {
  active: "정상",
  suspended: "정지",
  banned: "영구정지",
};