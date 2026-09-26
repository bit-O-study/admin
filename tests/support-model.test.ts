import { describe, expect, it } from "vitest";

import {
  isSupportManageInput,
  isUuid,
  parseSupportFilters,
  supportPageHref,
  validateSupportReply,
} from "../src/features/health/support-model";

describe("parseSupportFilters", () => {
  it("기본값: 1페이지, 조건 없음", () => {
    expect(parseSupportFilters({})).toEqual({
      page: 1,
      status: null,
      category: null,
      number: null,
      titleLike: null,
      mine: false,
      from: null,
      to: null,
    });
  });

  it("모르는 상태/종류는 버리고 아는 값만 남긴다", () => {
    const q = parseSupportFilters({ status: "hacked", category: "bug" });
    expect(q.status).toBeNull();
    expect(q.category).toBe("bug");
    expect(parseSupportFilters({ status: "resolved" }).status).toBe("resolved");
  });

  it("숫자 검색은 접수번호, 그 외는 이스케이프한 제목 검색", () => {
    expect(parseSupportFilters({ q: " 42 " })).toMatchObject({ number: 42, titleLike: null });
    expect(parseSupportFilters({ q: "100%_완료\\" })).toMatchObject({
      number: null,
      titleLike: "%100\\%\\_완료\\\\%",
    });
  });

  it("페이지는 1~1000 으로 자른다", () => {
    expect(parseSupportFilters({ page: "0" }).page).toBe(1);
    expect(parseSupportFilters({ page: "abc" }).page).toBe(1);
    expect(parseSupportFilters({ page: "99999" }).page).toBe(1000);
  });

  it("기간은 KST 하루 경계, 형식이 틀리면 무시", () => {
    const q = parseSupportFilters({ from: "2026-09-01", to: "2026-09-26", mine: "1" });
    expect(q.from).toBe("2026-09-01T00:00:00+09:00");
    expect(q.to).toBe("2026-09-26T23:59:59+09:00");
    expect(q.mine).toBe(true);
    expect(parseSupportFilters({ from: "2026/09/01' or 1=1" }).from).toBeNull();
  });
});

describe("supportPageHref", () => {
  it("필터를 유지하고 페이지만 바꾼다(빈 값 제외)", () => {
    expect(supportPageHref({ status: "new", q: "", page: "3" }, 2)).toBe(
      "/admin/health/support?status=new&page=2",
    );
  });
});

describe("검증", () => {
  it("답변 본문은 1~5000자", () => {
    expect(validateSupportReply("  ")).not.toBeNull();
    expect(validateSupportReply("x".repeat(5001))).not.toBeNull();
    expect(validateSupportReply("확인했습니다")).toBeNull();
  });

  it("처리 상태/우선순위는 정의된 값만", () => {
    expect(isSupportManageInput("resolved", "urgent")).toBe(true);
    expect(isSupportManageInput("deleted", "normal")).toBe(false);
    expect(isSupportManageInput("new", "critical")).toBe(false);
  });

  it("uuid 형식", () => {
    expect(isUuid("c432b98c-51b6-49eb-9172-5b55553f883c")).toBe(true);
    expect(isUuid("../etc")).toBe(false);
  });
});
