import { beforeEach, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin-clients", () => ({ adminDb: () => ({ rpc }) }));
import { getLiquorVisitSources } from "@/features/liquor/data";

beforeEach(() => rpc.mockReset());

it("유입 경로별로 합치고 많이 온 순, 사이트는 상위 3개", async () => {
  rpc.mockResolvedValue({
    data: [
      { source: "네이버", referrer_host: "m.search.naver.com", today: 3, last7: 20, total: 50 },
      { source: "네이버", referrer_host: "blog.naver.com", today: 1, last7: 5, total: 12 },
      { source: "직접 방문", referrer_host: null, today: 2, last7: 9, total: 30 },
      { source: "기타", referrer_host: "a.com", today: 0, last7: 1, total: 4 },
      { source: "기타", referrer_host: "b.com", today: 0, last7: 1, total: 3 },
      { source: "기타", referrer_host: "c.com", today: 0, last7: 0, total: 2 },
      { source: "기타", referrer_host: "d.com", today: 0, last7: 0, total: 1 },
    ],
    error: null,
  });
  const rows = await getLiquorVisitSources(30);
  expect(rpc).toHaveBeenCalledWith("site_visit_sources", { p_days: 30 });
  expect(rows?.map((r) => r.source)).toEqual(["네이버", "직접 방문", "기타"]);
  expect(rows?.[0]).toMatchObject({ today: 4, last7: 25, total: 62 });
  expect(rows?.[0].hosts[0].host).toBe("m.search.naver.com");
  expect(rows?.[2].hosts.map((h) => h.host)).toEqual(["a.com", "b.com", "c.com"]);
});

it("SQL 을 아직 안 돌렸으면(함수 없음) null — 화면은 안내 문구", async () => {
  rpc.mockResolvedValue({ data: null, error: { message: "Could not find the function public.site_visit_sources" } });
  expect(await getLiquorVisitSources()).toBeNull();
});
