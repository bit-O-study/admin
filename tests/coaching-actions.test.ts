import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), rpc: vi.fn(), refresh: vi.fn() }));
vi.mock("@/features/admin/admin", () => ({ isAdminUser: mocks.admin }));
vi.mock("@/lib/supabase/admin-clients", () => ({ healthSessionDb: async () => ({ rpc: mocks.rpc }) }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.refresh }));
import { prepareCoaching, saveCoaching } from "@/features/health/coaching-actions";
describe("manual coaching operator actions", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.admin.mockResolvedValue(true); mocks.rpc.mockResolvedValue({ error: null }); });
  it("blocks non-admin writes", async () => {
    mocks.admin.mockResolvedValue(false);
    expect((await saveCoaching("r", "answer", true)).error).toBeTruthy();
    expect((await prepareCoaching("u", "recommendation")).error).toBeTruthy();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("keeps draft saving separate from publication", async () => {
    await saveCoaching("r", " draft ", false);
    expect(mocks.rpc).toHaveBeenLastCalledWith("manual_coach_save", { p_request: "r", p_body: "draft", p_publish: false });
    await saveCoaching("r", " reviewed ", true);
    expect(mocks.rpc).toHaveBeenLastCalledWith("manual_coach_save", { p_request: "r", p_body: "reviewed", p_publish: true });
  });
  it("rejects empty publication and fabricated consultations", async () => {
    expect((await saveCoaching("r", " ", true)).error).toBeTruthy();
    expect((await prepareCoaching("u", "consultation")).error).toBeTruthy();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("surfaces database errors instead of claiming delivery", async () => {
    mocks.rpc.mockResolvedValue({ error: { code: "42501" } });
    expect((await saveCoaching("r", "answer", true)).error).toBeTruthy();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
