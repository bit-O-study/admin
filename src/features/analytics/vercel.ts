import "server-only";

import { seoulDayStartUtcIso } from "@/lib/date";

/**
 * Vercel Web Analytics — 헬쑤(health-app) 프로젝트의 오늘(KST) 방문수.
 *
 * 헬쑤는 아이큐/양주와 달리 자체 방문 추적 테이블이 없어, Vercel Web Analytics
 * (익명 방문 포함)를 REST 로 읽는다.
 *   GET https://api.vercel.com/v1/query/web-analytics/visits/count
 *       ?projectId=&since=&until=&teamId=   (Authorization: Bearer <token>)
 *   → { data: { pageviews, visitors } }
 *
 * ⚠ 이게 값을 주려면 **헬쑤 프로젝트 Vercel 대시보드에서 Web Analytics 를 ON** 해야 하고,
 *   heltch-admin 에 VERCEL_TOKEN 이 설정돼야 한다. 그 전엔 404 등으로 실패 → null 반환
 *   → 대시보드는 "—" 로 표시한다. (projectId/teamId 는 비밀이 아니라 기본값을 코드에 둔다.)
 */

// bitostudy 팀의 health-app 프로젝트(공개 식별자 — 비밀 아님). env 로 덮어쓸 수 있음.
const HEALTH_PROJECT_ID =
  process.env.HEALTH_VERCEL_PROJECT_ID ?? "prj_qfBy6JxOqnW965uIhGolrwfZ27wZ";
const VERCEL_TEAM_ID =
  process.env.VERCEL_TEAM_ID ?? "team_HzYTymKRx2Wu2CvCxh4BgMMv";

export type VercelVisits = { visitors: number; pageviews: number };

/**
 * 헬쑤 오늘(KST) 방문수. 토큰 미설정/Web Analytics 미활성/네트워크 오류 시 null.
 * now 주입 가능(기본 현재시각).
 */
export async function getHealthTodayVisits(
  now: Date = new Date(),
): Promise<VercelVisits | null> {
  const token = process.env.VERCEL_TOKEN;
  if (!token || !HEALTH_PROJECT_ID) return null;

  const params = new URLSearchParams({
    projectId: HEALTH_PROJECT_ID,
    since: seoulDayStartUtcIso(now),
    until: now.toISOString(),
  });
  if (VERCEL_TEAM_ID) params.set("teamId", VERCEL_TEAM_ID);

  try {
    const res = await fetch(
      `https://api.vercel.com/v1/query/web-analytics/visits/count?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { visitors?: number; pageviews?: number };
    };
    const d = json.data ?? {};
    return {
      visitors: Number(d.visitors ?? 0),
      pageviews: Number(d.pageviews ?? 0),
    };
  } catch {
    return null;
  }
}