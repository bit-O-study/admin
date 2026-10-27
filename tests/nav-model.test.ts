import { describe, expect, it } from "vitest";

import { NAV_SCOPES, activeHref, allNavHrefs, locate, navEntries } from "../src/features/admin/nav-model";

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
    expect(activeHref("/admin/health/members", hrefs)).toBe("/admin/health/members");
    expect(activeHref("/admin/health/reports/anything", hrefs)).toBe("/admin/health/reports");
  });

  it("헬쑤 개요(/admin/health)는 다른 헬쑤 화면에서 켜지지 않는다", () => {
    expect(activeHref("/admin/health", hrefs)).toBe("/admin/health");
    expect(activeHref("/admin/health/unknown", hrefs)).toBeNull();
  });

  it("헬쑤 고객센터 목록·상세·알림", () => {
    expect(activeHref("/admin/health/support", hrefs)).toBe("/admin/health/support");
    expect(activeHref("/admin/health/support/c432b98c-51b6-49eb-9172-5b55553f883c", hrefs)).toBe("/admin/health/support");
    expect(activeHref("/admin/health/support/notifications", hrefs)).toBe("/admin/health/support/notifications");
  });

  it("설정 › 권한은 앱 설정보다 구체적", () => {
    expect(activeHref("/admin/health/settings/access", hrefs)).toBe("/admin/health/settings/access");
  });

  it("위스키", () => {
    expect(activeHref("/admin/liquor", hrefs)).toBe("/admin/liquor");
    expect(activeHref("/admin/liquor/traffic", hrefs)).toBe("/admin/liquor/traffic");
  });

  it("매칭 없거나 null 경로면 null", () => {
    expect(activeHref("/login", hrefs)).toBeNull();
    expect(activeHref(null, hrefs)).toBeNull();
  });
});

describe("locate", () => {
  it("세그먼트 화면은 서비스·탭·세그먼트를 모두 찾는다", () => {
    const l = locate("/admin/health/trainers");
    expect(l.scope.key).toBe("health");
    expect(l.tab?.label).toBe("요금제");
    expect(l.segment?.label).toBe("트레이너 신청");
  });

  it("문의 상세는 고객센터 › 문의함", () => {
    const l = locate("/admin/health/support/c432b98c-51b6-49eb-9172-5b55553f883c");
    expect(l.tab?.label).toBe("고객센터");
    expect(l.segment?.label).toBe("문의함");
  });

  it("메뉴에 없는 하위 경로는 경로 접두어로 서비스만 고른다", () => {
    const l = locate("/admin/health/unknown");
    expect(l.scope.key).toBe("health");
    expect(l.tab).toBeNull();
  });

  it("전체 서비스 개요", () => {
    expect(locate("/admin").scope.key).toBe("all");
    expect(locate("/admin").tab?.label).toBe("개요");
  });
});

describe("메뉴 정의", () => {
  it("자료실은 메모 moa 탭, 사이트는 전체 서비스 탭", () => {
    expect(locate("/admin/library").scope.key).toBe("memo");
    expect(locate("/admin/library").tab?.label).toBe("자료실");
    expect(locate("/admin/projects").scope.key).toBe("all");
  });

  it("경로가 겹치지 않는다", () => {
    const all = NAV_SCOPES.flatMap((s) => s.tabs.flatMap((t) => (t.segments ? t.segments.map((x) => x.href) : [t.href])));
    expect(new Set(all).size).toBe(all.length);
  });

  it("예전 사이드바의 모든 경로가 메뉴에 남아 있다", () => {
    const hrefs = new Set(allNavHrefs());
    for (const old of [
      "/admin", "/admin/server", "/admin/health/members", "/admin/health/grants", "/admin/health/trainers", "/admin/health/billing",
      "/admin/health/support", "/admin/health/reports", "/admin/health/coaching", "/admin/health/support/notifications",
      "/admin/health/events", "/admin/health/crons", "/admin/health/exercise-media", "/admin/health/settings", "/admin/health/test",
      "/admin/memo", "/admin/iq", "/admin/iq/questions", "/admin/liquor", "/admin/library", "/admin/projects",
    ]) expect(hrefs.has(old)).toBe(true);
  });

  it("검색 목록은 세그먼트를 '서비스 › 탭' 경로와 함께 낸다", () => {
    expect(navEntries()).toContainEqual({ href: "/admin/health/crons", label: "크론", path: "헬쑤 › 운영", scope: "health" });
  });
});
