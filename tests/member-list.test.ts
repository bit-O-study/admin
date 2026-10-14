import { expect, it } from "vitest";

import { inView, matchesMember, paginate, parseMemberView } from "../src/features/health/member-list";

const base = { userId: "u", email: "hong@naver.com", name: "홍길동", phone: "010-1234-5678", gender: null, experience: null, heightCm: null, weightKg: null, createdAt: "2026-01-01", suspendedUntil: null, bannedAt: null, banReason: null, withdrawnAt: null };

it("이름·이메일·전화(하이픈 무시)로 찾는다", () => {
  expect(matchesMember(base, "길동")).toBe(true);
  expect(matchesMember(base, "NAVER")).toBe(true);
  expect(matchesMember(base, "12345678")).toBe(true);
  expect(matchesMember(base, "1234-5678")).toBe(true);
  expect(matchesMember(base, "홍 naver")).toBe(true);
  expect(matchesMember(base, "김")).toBe(false);
  expect(matchesMember(base, "  ")).toBe(true);
});

it("상태 칩", () => {
  const now = new Date("2026-10-14T00:00:00Z");
  expect(inView(base, "active", false, now)).toBe(true);
  expect(inView({ ...base, bannedAt: "2026-10-01" }, "blocked", false, now)).toBe(true);
  expect(inView({ ...base, suspendedUntil: "2026-12-01" }, "active", false, now)).toBe(false);
  expect(inView({ ...base, withdrawnAt: "2026-10-01" }, "withdrawn", false, now)).toBe(true);
  expect(inView({ ...base, withdrawnAt: "2026-10-01" }, "paid", true, now)).toBe(false);
  expect(inView(base, "paid", true, now)).toBe(true);
  expect(parseMemberView("nope")).toBe("all");
});

it("페이지 나눔은 범위를 넘지 않는다", () => {
  const rows = Array.from({ length: 65 }, (_, i) => i);
  expect(paginate(rows, 1).rows).toHaveLength(30);
  expect(paginate(rows, 3)).toMatchObject({ page: 3, pages: 3 });
  expect(paginate(rows, 3).rows).toHaveLength(5);
  expect(paginate(rows, 99).page).toBe(3);
  expect(paginate([], 1)).toMatchObject({ page: 1, pages: 1 });
});
