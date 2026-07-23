import { describe, expect, it } from "vitest";

import { activeHref, allNavHrefs } from "../src/features/admin/nav-model";

describe("activeHref", () => {
  const hrefs = allNavHrefs();

  it("/admin(개요)은 정확히 일치할 때만 활성", () => {
    expect(activeHref("/admin", hrefs)).toBe("/admin");
    expect(activeHref("/admin/iq", hrefs)).not.toBe("/admin");
  });

  it("하위 경로는 가장 구체적인 링크가 활성 (통계 vs 문제해설)", () => {
    expect(activeHref("/admin/iq", hrefs)).toBe("/admin/iq");
    expect(activeHref("/admin/iq/questions", hrefs)).toBe("/admin/iq/questions");
  });

  it("헬쑤 하위 경로 매칭", () => {
    expect(activeHref("/admin/health/members", hrefs)).toBe(
      "/admin/health/members",
    );
    expect(activeHref("/admin/health/reports/anything", hrefs)).toBe(
      "/admin/health/reports",
    );
  });

  it("위스키", () => {
    expect(activeHref("/admin/liquor", hrefs)).toBe("/admin/liquor");
  });

  it("매칭 없거나 null 경로면 null", () => {
    expect(activeHref("/login", hrefs)).toBeNull();
    expect(activeHref(null, hrefs)).toBeNull();
  });
});