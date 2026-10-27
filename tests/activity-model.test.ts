import { describe, expect, it } from "vitest";

import { buildActivity, filterActivity } from "../src/features/admin/activity-model";

const now = new Date("2026-10-27T06:00:00Z"); // 한국 15:00

describe("buildActivity", () => {
  it("여러 출처를 최신순으로 합치고 기간 밖은 뺀다", () => {
    const items = buildActivity(
      {
        tickets: [
          { id: "t1", number: 1042, title: "결제 문의", created_at: "2026-10-27T05:50:00Z" },
          { id: "old", number: 900, title: "오래된 문의", created_at: "2026-10-01T00:00:00Z" },
        ],
        reports: [{ id: "r1", reason: "홍보", targetPreview: "광고 글", createdAt: "2026-10-27T05:00:00Z", status: "open" }],
        cronRuns: [
          { name: "workout-inactivity", started_at: "2026-10-27T05:56:00Z", status: "error", reason: "timeout" },
          { name: "daily-reminders", started_at: "2026-10-27T05:57:00Z", status: "ok", reason: null },
        ],
        deploys: [{ name: "admin", label: "관리 콘솔", state: "success", sha: "abcdef1234", at: "2026-10-27T05:20:00Z", ok: true }],
      },
      { now, days: 7 },
    );
    expect(items.map((i) => i.id)).toEqual(["cron:workout-inactivity:2026-10-27T05:56:00Z", "support:t1", "deploy:admin:2026-10-27T05:20:00Z", "report:r1"]);
    expect(items[1]).toMatchObject({ title: "새 문의 #1042", detail: "결제 문의", href: "/admin/health/support/t1" });
    expect(items[2]).toMatchObject({ kind: "deploy", title: "관리 콘솔 서버 배포 완료", detail: "abcdef1", scope: "server" });
  });

  it("가입은 한국 날짜별로 묶고 가장 최근 사람 이름을 앞에", () => {
    const items = buildActivity(
      {
        members: [
          { userId: "a", name: "김하늘", createdAt: "2026-10-27T04:00:00Z", withdrawnAt: null },
          { userId: "b", name: "이도윤", createdAt: "2026-10-27T01:00:00Z", withdrawnAt: null },
          { userId: "c", name: "박서연", createdAt: "2026-10-26T16:30:00Z", withdrawnAt: null }, // 한국 10/27 01:30
          { userId: "d", name: "최민준", createdAt: "2026-10-25T03:00:00Z", withdrawnAt: "2026-10-26T03:00:00Z" },
        ],
      },
      { now, days: 7 },
    );
    const signups = items.filter((i) => i.kind === "signup");
    expect(signups.map((i) => i.title)).toEqual(["신규 가입 김하늘 외 2명", "신규 가입 최민준"]);
    expect(items.find((i) => i.kind === "withdraw")?.title).toBe("탈퇴 1명");
  });

  it("앱 오류는 하루 단위로 건수를 더하고 경고는 뺀다", () => {
    const items = buildActivity(
      {
        appEvents: [
          { kind: "save_failure", severity: "error", count: 3, occurred_at: "2026-10-27T02:00:00Z" },
          { kind: "auth_failure", severity: "error", count: 1, occurred_at: "2026-10-27T03:00:00Z" },
          { kind: "slow_route", severity: "warn", count: 9, occurred_at: "2026-10-27T03:00:00Z" },
        ],
      },
      { now },
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ title: "앱 오류 4건", detail: "save_failure, auth_failure", at: "2026-10-27T03:00:00Z" });
  });
});

describe("filterActivity", () => {
  const items = buildActivity(
    {
      tickets: [{ id: "t1", number: 1, title: "x", created_at: "2026-10-27T05:00:00Z" }],
      deploys: [{ name: "admin", label: "관리 콘솔", state: "failure", at: "2026-10-27T05:10:00Z", ok: false }],
    },
    { now },
  );
  it("고른 묶음만 남기고, 비었거나 모르는 키면 전부", () => {
    expect(filterActivity(items, "deploys").map((i) => i.kind)).toEqual(["deploy_fail"]);
    expect(filterActivity(items, "support,deploys")).toHaveLength(2);
    expect(filterActivity(items, undefined)).toHaveLength(2);
    expect(filterActivity(items, "nope")).toHaveLength(2);
  });
});
