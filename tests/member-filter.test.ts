import { describe, expect, it } from "vitest";

import { filterOptions } from "../src/components/filter-options";
import { activeHref, allNavHrefs } from "../src/features/admin/nav-model";
import { isVerificationUser } from "../src/features/health/member-filter";

describe("isVerificationUser", () => {
  it("E2E 임시 계정(e2e_ 이메일 · 이름 검증유저)만 검증유저로 본다", () => {
    expect(isVerificationUser({ email: "e2e_0123abcd_17@example.com", name: "홍길동" })).toBe(true);
    expect(isVerificationUser({ email: "E2E_run@example.com", name: null })).toBe(true);
    expect(isVerificationUser({ email: "real@naver.com", name: " 검증유저 " })).toBe(true);
    expect(isVerificationUser({ email: "real@naver.com", name: "검증유저아님" })).toBe(false);
    expect(isVerificationUser({ email: "me2e_x@naver.com", name: "홍길동" })).toBe(false);
    expect(isVerificationUser({ email: null, name: null })).toBe(false);
  });
});

describe("filterOptions", () => {
  const options = [
    { value: "a", label: "홍길동 · hong@naver.com · 01011112222" },
    { value: "b", label: "김코치 · Coach@gmail.com" },
    { value: "c", label: "홍코치 · hc@gmail.com" },
  ];
  it("검색어가 없으면 전부", () => {
    expect(filterOptions(options, "  ")).toHaveLength(3);
  });
  it("낱말이 모두 들어 있는 것만 — 대소문자 무시", () => {
    expect(filterOptions(options, "코치").map((o) => o.value)).toEqual(["b", "c"]);
    expect(filterOptions(options, "코치 GMAIL 홍").map((o) => o.value)).toEqual(["c"]);
    expect(filterOptions(options, "1111").map((o) => o.value)).toEqual(["a"]);
    expect(filterOptions(options, "없는사람")).toEqual([]);
  });
  it("지금 고른 값은 검색어와 달라도 남긴다", () => {
    expect(filterOptions(options, "코치", "a").map((o) => o.value)).toEqual(["a", "b", "c"]);
  });
});

describe("요금제 지급 메뉴", () => {
  it("사이드바에 있고 활성 판정된다", () => {
    expect(activeHref("/admin/health/grants", allNavHrefs())).toBe("/admin/health/grants");
  });
});
