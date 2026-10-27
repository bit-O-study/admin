import { describe, expect, it } from "vitest";

import { memberScore, searchMembers, searchReports } from "../src/features/admin/search-model";

const member = (over: Partial<Parameters<typeof memberScore>[0]> = {}) => ({
  userId: "u",
  name: "김하늘",
  email: "sky@example.com",
  phone: "010-1234-5678",
  suspendedUntil: null,
  bannedAt: null,
  withdrawnAt: null,
  ...over,
});

describe("memberScore", () => {
  it("한 글자는 찾지 않는다", () => {
    expect(memberScore(member(), "김")).toBe(0);
  });
  it("메일 전체 > 메일 앞 > 이름 앞 > 전화 뒤 4자리 > 이름 포함 > 메일 포함", () => {
    expect(memberScore(member(), "sky@example.com")).toBe(100);
    expect(memberScore(member(), "sky@")).toBe(80);
    expect(memberScore(member(), "김하")).toBe(70);
    expect(memberScore(member(), "5678")).toBe(60);
    expect(memberScore(member(), "하늘")).toBe(50);
    expect(memberScore(member(), "example")).toBe(40);
    expect(memberScore(member(), "없는말")).toBe(0);
  });
  it("전화는 정확히 뒤 4자리만 — 가운데 숫자로는 안 찾는다", () => {
    expect(memberScore(member(), "1234")).toBe(0);
  });
});

describe("searchMembers", () => {
  it("검증유저를 빼고, 점수순 5명, 상태를 붙이고, 전화는 싣지 않는다", () => {
    const list = [
      member({ userId: "a", name: "하늘별", email: "a@example.com" }),
      member({ userId: "b", name: "김하늘", email: "b@example.com", bannedAt: "2026-10-01T00:00:00Z" }),
      member({ userId: "c", name: "검증유저", email: "e2e_x@example.com" }),
    ];
    const hits = searchMembers("하늘", list);
    expect(hits.map((h) => h.id)).toEqual(["a", "b"]);
    expect(hits[1].state).toBe("영구정지");
    expect(Object.keys(hits[0])).not.toContain("phone");
  });
});

describe("searchReports", () => {
  const reports = [
    { id: "1", targetKind: "community_post" as const, targetPreview: "광고 글입니다", targetAuthor: "홍길동", reason: "홍보", status: "resolved" as const },
    { id: "2", targetKind: "community_comment" as const, targetPreview: "또 광고", targetAuthor: "임꺽정", reason: "반복 광고", status: "open" as const },
  ];
  it("사유·내용·작성자에서 찾고 미처리를 먼저", () => {
    const hits = searchReports("광고", reports);
    expect(hits.map((h) => h.id)).toEqual(["2", "1"]);
    expect(hits[0].hint).toBe("댓글 · 미처리 · 사유: 반복 광고");
    expect(searchReports("홍길", reports).map((h) => h.id)).toEqual(["1"]);
  });
});
