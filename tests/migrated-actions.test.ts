import { beforeEach, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ admin: vi.fn(), rpc: vi.fn(), dispatch: vi.fn(), from: vi.fn(), user: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/features/admin/admin", () => ({ isAdminUser: m.admin }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: async () => ({ rpc: m.rpc, from: m.from }), getCurrentUser: m.user }));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: () => ({ from: m.from }) }));
vi.mock("@/features/health/trainer/messaging.server", () => ({ dispatchTrainerNotification: m.dispatch }));
vi.mock("@/features/health/notifications/messaging.server", () => ({ dispatchSupport: m.dispatch }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));
import { trainerAction } from "../src/features/health/trainer/actions";
import { approveTeamPlanAction, cancelTeamPlanAction } from "../src/features/health/billing/team-actions";
import { supportNotificationAction, retrySupportNotification } from "../src/features/health/notifications/actions";
const previous = { ok: false, message: "" };
const form = (intent: string) => { const f = new FormData(); f.set("intent", intent); f.set("trainer", "trainer-id"); f.set("start", "2026-09-29"); f.set("end", "infinity"); f.set("seats", "25"); return f; };
beforeEach(() => { vi.resetAllMocks(); m.admin.mockResolvedValue(false); m.user.mockResolvedValue({ id: "admin-user" }); m.rpc.mockResolvedValue({ error: null }); });
it("rejects every privileged action before touching DB/provider", async () => {
  for (const intent of ["approve", "cancel", "retry"]) expect((await trainerAction(previous, form(intent))).ok).toBe(false);
  expect((await cancelTeamPlanAction("group")).ok).toBe(false);
  expect((await supportNotificationAction("test")).error).toBeTruthy();
  expect((await retrySupportNotification("c432b98c-51b6-49eb-9172-5b55553f883c", true)).error).toBeTruthy();
  expect(m.rpc).not.toHaveBeenCalled(); expect(m.from).not.toHaveBeenCalled(); expect(m.dispatch).not.toHaveBeenCalled();
});
it("preserves unlimited trainer passes using the existing authorized RPC", async () => {
  m.admin.mockResolvedValue(true); expect((await trainerAction(previous, form("approve"))).ok).toBe(true);
  expect(m.rpc).toHaveBeenCalledWith("pt_admin_pass", { p_trainer: "trainer-id", p_start: "2026-09-29", p_end: "infinity", p_seats: 25, p_active: true });
});
it("cancels a pass without approving it or sending a message", async () => {
  m.admin.mockResolvedValue(true); await trainerAction(previous, form("cancel"));
  expect(m.rpc).toHaveBeenCalledWith("pt_admin_pass", expect.objectContaining({ p_active: false })); expect(m.dispatch).not.toHaveBeenCalled();
});
it("rejects non-admin trainer intents even for an admin", async () => {
  m.admin.mockResolvedValue(true); expect((await trainerAction(previous, form("invite"))).ok).toBe(false); expect(m.rpc).not.toHaveBeenCalled();
});
it("does not save inverted subscription periods", async () => {
  m.admin.mockResolvedValue(true);
  expect((await approveTeamPlanAction({ groupId: "group", periodStart: "2026-10-01", periodEnd: "2026-09-29", priceKrw: 10000, seats: 5 })).ok).toBe(false);
  expect(m.from).not.toHaveBeenCalled();
});
it("notification settings can change only the current operator", async () => {
  m.admin.mockResolvedValue(true); const upsert = vi.fn().mockResolvedValue({ error: null }); m.from.mockReturnValue({ upsert });
  await supportNotificationAction("save", true, false);
  expect(upsert).toHaveBeenCalledWith({ user_id: "admin-user", enabled: true, push_enabled: false }, { onConflict: "user_id" });
});
it("uncertain retry requires confirmation before RPC", async () => {
  m.admin.mockResolvedValue(true);
  expect((await retrySupportNotification("c432b98c-51b6-49eb-9172-5b55553f883c", false)).error).toBeTruthy(); expect(m.rpc).not.toHaveBeenCalled();
});
