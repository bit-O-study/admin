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
import { approveTeamPlanAction, cancelTeamPlanAction, grantTeamPlanAction } from "../src/features/health/billing/team-actions";
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
it("grants a pass to a member without a request, normalizing the phone", async () => {
  const grant = () => { const f = form("grant"); f.set("end", "2026-10-29"); f.set("name", " 김코치 "); f.set("phone", "010-1234-5678"); return f; };
  expect((await trainerAction(previous, grant())).ok).toBe(false); expect(m.rpc).not.toHaveBeenCalled();
  m.admin.mockResolvedValue(true);
  const bad = grant(); bad.set("phone", "02-123-4567");
  expect((await trainerAction(previous, bad)).ok).toBe(false); expect(m.rpc).not.toHaveBeenCalled();
  expect((await trainerAction(previous, grant())).ok).toBe(true);
  expect(m.rpc).toHaveBeenCalledWith("pt_admin_grant_pass", { p_trainer: "trainer-id", p_name: "김코치", p_phone: "01012345678", p_start: "2026-09-29", p_end: "2026-10-29", p_seats: 25 });
  m.rpc.mockResolvedValue({ error: { code: "P0001", message: "기간과 회원 수를 확인해 주세요." } });
  expect(await trainerAction(previous, grant())).toEqual({ ok: false, message: "기간과 회원 수를 확인해 주세요." });
});
it("grants a team plan without a request through the admin RPC", async () => {
  const input = { groupId: "group", plan: "gym", periodStart: "2026-10-12", periodEnd: "2026-11-12", seats: 30.7, memo: " 체험 " };
  expect((await grantTeamPlanAction(input)).ok).toBe(false); expect(m.rpc).not.toHaveBeenCalled();
  m.admin.mockResolvedValue(true);
  for (const bad of [{ groupId: "" }, { plan: "premium" }, { periodEnd: "2026-10-11" }, { periodStart: "10/12" }]) expect((await grantTeamPlanAction({ ...input, ...bad })).ok).toBe(false);
  expect(m.rpc).not.toHaveBeenCalled();
  expect(await grantTeamPlanAction(input)).toEqual({ ok: true });
  expect(m.rpc).toHaveBeenCalledWith("admin_grant_team_plan", { p_group: "group", p_plan: "gym", p_start: "2026-10-12", p_end: "2026-11-12", p_seats: 30, p_memo: "체험" });
  m.rpc.mockResolvedValue({ error: { code: "42501" } });
  expect((await grantTeamPlanAction(input)).ok).toBe(false);
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
