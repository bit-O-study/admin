import "server-only";

/**
 * 메모 앱(moa · MeetingMinutes) 사용 통계.
 *
 * 메모 앱은 Supabase 클라이언트가 아니라 자체 Postgres(Drizzle)라서, 여기서 DB 를 직접 열지 않고
 * 메모 앱의 `/api/stats` 를 서버에서 부른다 — 어드민이 메모 DB 비밀번호를 갖지 않게.
 * 받는 것은 날짜별 사람 수뿐(개인정보 없음).
 *
 * env: MEMO_APP_URL(예: https://meeting-minutes-orcin.vercel.app), MEMO_STATS_TOKEN(메모 앱 STATS_API_TOKEN 과 같은 값)
 */
export type MemoDay = {
  day: string;
  /** 그날 앱 화면을 연 사람(2026-10-14 부터 기록). */
  visitors: number;
  /** 그날 무언가 남긴 사람 ∪ 접속자 — 기록 시작 전 날짜도 보인다. */
  active: number;
  signups: number;
  messages: number;
  edits: number;
};

export type MemoStats = {
  days: MemoDay[];
  totals: { users: number; spaces: number; notes: number };
  trackedSince: string;
};

export function isMemoConfigured(): boolean {
  return Boolean(process.env.MEMO_APP_URL && process.env.MEMO_STATS_TOKEN);
}

/** 실패(미설정·네트워크·권한)는 null — 대시보드는 "—" 로 보여 주고 나머지는 그대로 뜬다. */
export async function getMemoStats(days = 30): Promise<MemoStats | null> {
  if (!isMemoConfigured()) return null;
  const url = new URL("/api/stats", process.env.MEMO_APP_URL);
  url.searchParams.set("days", String(days));
  try {
    const res = await fetch(url, {
      headers: { authorization: `Bearer ${process.env.MEMO_STATS_TOKEN}` },
      cache: "no-store",
      // 메모 서버가 느려도 대시보드 전체가 붙잡히지 않게.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn("[memo] 통계 응답", res.status);
      return null;
    }
    return (await res.json()) as MemoStats;
  } catch (error) {
    console.warn("[memo] 통계 실패", error);
    return null;
  }
}
