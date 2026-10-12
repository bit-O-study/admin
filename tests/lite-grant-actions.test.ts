import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), rpc: vi.fn(), refresh: vi.fn() }));
vi.mock("@/features/admin/admin", () => ({ isAdminUser: mocks.admin }));
vi.mock("@/lib/supabase/admin-clients", () => ({ healthSessionDb: async () => ({ rpc: mocks.rpc }) }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.refresh }));
import { grantLiteAction, revokeLiteAction } from "@/features/health/lite-grant-actions";
describe("lite plan grant actions", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.admin.mockResolvedValue(true); mocks.rpc.mockResolvedValue({ data: "2026-11-12T00:00:00+00:00", error: null }); });
  it("blocks non-admin grants and revokes", async () => {
    mocks.admin.mockResolvedValue(false);
    expect((await grantLiteAction("u", 1)).ok).toBe(false);
    expect((await revokeLiteAction("u")).ok).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("grants the chosen months and returns the new expiry", async () => {
    expect(await grantLiteAction("u", 3)).toEqual({ ok: true, expiresAt: "2026-11-12T00:00:00+00:00" });
    expect(mocks.rpc).toHaveBeenLastCalledWith("admin_grant_lite", { p_user: "u", p_months: 3 });
    expect(mocks.refresh).toHaveBeenCalledWith("/admin/health/members");
  });
  it("rejects periods outside 1-12 months before touching the database", async () => {
    for (const months of [0, 13, 1.5, Number.NaN]) expect((await grantLiteAction("u", months)).ok).toBe(false);
    expect((await grantLiteAction("", 1)).ok).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("explains a paid subscription instead of a generic failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "23505" } });
    const paid = await grantLiteAction("u", 1);
    expect(paid).toMatchObject({ ok: false, error: expect.stringContaining("결제 중") });
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "42501" } });
    expect((await grantLiteAction("u", 1)).ok).toBe(false);
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
  it("reports when there is no granted pass to revoke", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    expect((await revokeLiteAction("u")).ok).toBe(false);
    expect(mocks.refresh).not.toHaveBeenCalled();
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    expect((await revokeLiteAction("u")).ok).toBe(true);
    expect(mocks.rpc).toHaveBeenLastCalledWith("admin_revoke_lite", { p_user: "u" });
  });
});
