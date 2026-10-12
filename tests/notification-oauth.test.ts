import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ admin: vi.fn(), user: vi.fn(), from: vi.fn(), get: vi.fn(), set: vi.fn(), fetch: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/admin/admin", () => ({ isAdminUser: m.admin }));
vi.mock("@/lib/supabase/server", () => ({ getCurrentUser: m.user }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: () => ({ from: m.from }) }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: m.get, set: m.set }) }));
vi.mock("@/features/health/notifications/messaging.server", () => ({ kakaoConfig: () => ({ origin: "https://heltch-admin.vercel.app", authOrigin: "https://health-app-five-iota.vercel.app", key: "test", callback: "https://health-app-five-iota.vercel.app/api/support/kakao/callback" }) }));
import { GET as start } from "../src/app/api/support/kakao/start/route";
import { GET as callback } from "../src/app/api/support/kakao/callback/route";
beforeEach(() => { vi.resetAllMocks(); m.user.mockResolvedValue({ id: "admin-id" }); m.admin.mockResolvedValue(true); });
it("does not start OAuth for non-admins", async () => {
  m.admin.mockResolvedValue(false); expect((await start()).status).toBe(403); expect(m.from).not.toHaveBeenCalled();
});
it("keeps the registered callback and sets console-owned state cookie", async () => {
  const insert = vi.fn().mockResolvedValue({ error: null }); m.from.mockReturnValue({ insert });
  const response = await start(); const url = new URL(response.headers.get("location")!);
  expect(url.searchParams.get("redirect_uri")).toBe("https://health-app-five-iota.vercel.app/api/support/kakao/callback");
  expect(url.searchParams.get("state")).toMatch(/^console\.[0-9a-f]{64}$/);
  expect(m.set).toHaveBeenCalledWith("support_oauth", url.searchParams.get("state"), expect.objectContaining({ httpOnly: true, secure: true, sameSite: "lax" }));
  expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: "admin-id" }));
});
it("rejects a relayed callback without the original browser state cookie", async () => {
  m.get.mockReturnValue({ value: "different" });
  const response = await callback(new Request("https://heltch-admin.vercel.app/api/support/kakao/callback?state=console.abc&code=secret"));
  expect(response.status).toBe(400); expect(m.from).not.toHaveBeenCalled();
});
it("rejects expired or replayed state and scopes consumption to this admin", async () => {
  const state = "console." + "a".repeat(64); m.get.mockReturnValue({ value: state });
  const q = { delete: vi.fn(), eq: vi.fn(), gt: vi.fn(), select: vi.fn(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
  for (const key of ["delete", "eq", "gt", "select"] as const) q[key].mockReturnValue(q); m.from.mockReturnValue(q);
  expect((await callback(new Request(`https://heltch-admin.vercel.app/api/support/kakao/callback?state=${state}&code=test`))).status).toBe(400);
  expect(q.eq).toHaveBeenCalledWith("user_id", "admin-id"); expect(q.gt).toHaveBeenCalledWith("expires_at", expect.any(String));
});
