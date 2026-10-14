import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { getMemoStats, isMemoConfigured } from "@/features/memo/data";

const fetchMock = vi.fn();
const body = { days: [{ day: "2026-10-14", visitors: 3, active: 4, signups: 1, messages: 2, edits: 5 }], totals: { users: 3, spaces: 5, notes: 6 }, trackedSince: "2026-10-14" };

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("설정이 없으면 메모 앱을 부르지 않고 null", async () => {
  vi.stubEnv("MEMO_APP_URL", "");
  vi.stubEnv("MEMO_STATS_TOKEN", "");
  expect(isMemoConfigured()).toBe(false);
  expect(await getMemoStats()).toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("토큰을 Bearer 로 보내고 날짜 범위를 넘긴다", async () => {
  vi.stubEnv("MEMO_APP_URL", "https://memo.example.com");
  vi.stubEnv("MEMO_STATS_TOKEN", "secret-token");
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
  const stats = await getMemoStats(7);
  expect(stats?.days[0].visitors).toBe(3);
  const [url, init] = fetchMock.mock.calls[0];
  expect(String(url)).toBe("https://memo.example.com/api/stats?days=7");
  expect(init.headers.authorization).toBe("Bearer secret-token");
  expect(init.cache).toBe("no-store");
});

it("거절·네트워크 오류는 null(대시보드는 나머지를 그대로 보여 준다)", async () => {
  vi.stubEnv("MEMO_APP_URL", "https://memo.example.com");
  vi.stubEnv("MEMO_STATS_TOKEN", "secret-token");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  fetchMock.mockResolvedValueOnce(new Response("{}", { status: 401 }));
  expect(await getMemoStats()).toBeNull();
  fetchMock.mockRejectedValueOnce(new Error("timeout"));
  expect(await getMemoStats()).toBeNull();
});
