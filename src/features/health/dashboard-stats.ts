/**
 * 관리자 대시보드 통계 — 순수 모듈.
 * 회원수/가입수/탈퇴수는 회원 목록(createdAt/withdrawnAt)에서 버킷팅으로 만들고,
 * 접속유저수는 DB 집계(admin_active_users RPC)를 그대로 쓴다. (헬스앱에서 이식)
 */
import { kstRecentDayKeys } from "@/lib/date";
import { isVerificationUser } from "@/features/health/member-filter";

export type Granularity = "day" | "month" | "year";

export type SeriesPoint = { bucket: string; value: number };

export type MemberLite = {
  createdAt: string;
  withdrawnAt: string | null;
};

/** ISO timestamp → Asia/Seoul 기준 YYYY-MM-DD. */
export function seoulYmd(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** YYYY-MM-DD → 버킷 키(연/월/일). */
export function bucketOf(ymd: string, gran: Granularity): string {
  if (gran === "year") return ymd.slice(0, 4);
  if (gran === "month") return ymd.slice(0, 7);
  return ymd;
}

/** 버킷별 개수 시계열(버킷 오름차순). */
export function countSeries(ymds: string[], gran: Granularity): SeriesPoint[] {
  const m = new Map<string, number>();
  for (const ymd of ymds) {
    const b = bucketOf(ymd, gran);
    m.set(b, (m.get(b) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([bucket, value]) => ({ bucket, value }));
}

/** 가입수 시계열. */
export function signupSeries(
  members: MemberLite[],
  gran: Granularity,
): SeriesPoint[] {
  return countSeries(
    members.map((m) => seoulYmd(m.createdAt)),
    gran,
  );
}

/** 탈퇴수 시계열. */
export function withdrawalSeries(
  members: MemberLite[],
  gran: Granularity,
): SeriesPoint[] {
  return countSeries(
    members.filter((m) => m.withdrawnAt).map((m) => seoulYmd(m.withdrawnAt!)),
    gran,
  );
}

/** 회원수(순누적) 시계열 — 가입 +1, 탈퇴 -1 시간순 누적. */
export function memberCountSeries(
  members: MemberLite[],
  gran: Granularity,
): SeriesPoint[] {
  const delta = new Map<string, number>();
  for (const m of members) {
    const inB = bucketOf(seoulYmd(m.createdAt), gran);
    delta.set(inB, (delta.get(inB) ?? 0) + 1);
    if (m.withdrawnAt) {
      const outB = bucketOf(seoulYmd(m.withdrawnAt), gran);
      delta.set(outB, (delta.get(outB) ?? 0) - 1);
    }
  }
  const buckets = [...delta.keys()].sort();
  let running = 0;
  return buckets.map((bucket) => {
    running += delta.get(bucket) ?? 0;
    return { bucket, value: running };
  });
}

/** 활동(접속) 시계열. */
export function activeSeries(
  rows: { bucket: string; users: number }[],
): SeriesPoint[] {
  return [...rows]
    .sort((a, b) => (a.bucket < b.bucket ? -1 : a.bucket > b.bucket ? 1 : 0))
    .map((r) => ({ bucket: r.bucket, value: r.users }));
}

/** 헤드라인 카드용 합계. */
export function dashboardSummary(members: MemberLite[]): {
  totalMembers: number;
  totalSignups: number;
  totalWithdrawals: number;
} {
  const totalSignups = members.length;
  const totalWithdrawals = members.filter((m) => m.withdrawnAt).length;
  return {
    totalSignups,
    totalWithdrawals,
    totalMembers: totalSignups - totalWithdrawals,
  };
}
/**
 * 일별 접속 행(활동 없는 날은 행이 없음) → 한국 날짜 기준 최근 days 일, 빈 날 0.
 * 예전엔 '마지막 행' 을 오늘로 썼다 — 오늘 0명이면 어제(또는 그 전) 값이 '오늘' 로 보였다.
 */
export function dailyActiveKst(
  rows: { bucket: string; users: number }[],
  now: Date,
  days = 30,
): { bucket: string; users: number }[] {
  const byDay = new Map<string, number>();
  for (const r of rows) byDay.set(String(r.bucket).slice(0, 10), Number(r.users) || 0);
  return kstRecentDayKeys(now, days).map((bucket) => ({ bucket, users: byDay.get(bucket) ?? 0 }));
}

/**
 * 화면마다 같은 '회원 수' — 검증유저(E2E 임시 계정)는 빼고, 탈퇴는 따로 센다.
 * 대시보드 카드·헬쑤 통계·회원 화면 머리말이 모두 이 값을 쓴다.
 */
export function memberTotals(
  members: { email: string | null; name: string | null; withdrawnAt: string | null }[],
): { active: number; withdrawn: number; verification: number } {
  let active = 0;
  let withdrawn = 0;
  let verification = 0;
  for (const m of members) {
    if (isVerificationUser(m)) verification++;
    else if (m.withdrawnAt) withdrawn++;
    else active++;
  }
  return { active, withdrawn, verification };
}
