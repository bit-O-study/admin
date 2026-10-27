/**
 * 메뉴 구조 (2026-10-27 BOadmin 2.0) — 순수 모듈.
 * 위쪽에서 서비스(scope)를 고르고, 그 아래 탭에서 화면을 고른다. 탭 안에 화면이 여럿이면
 * 세그먼트로 나눈다(예: 요금제 › 지급·트레이너 신청·팀 요금제).
 * 경로는 예전 그대로다 — 즐겨찾기·알림 링크·health_app E2E 가 깨지지 않게 메뉴 정의만 바꿨다.
 */
export type NavSegment = { href: string; label: string };
export type NavTab = {
  href: string;
  label: string;
  /** 탭 안의 세부 화면. 첫 번째가 탭의 대표 화면이다. */
  segments?: NavSegment[];
};
export type ScopeKey = "all" | "health" | "memo" | "iq" | "liquor" | "server";
export type NavScope = { key: ScopeKey; label: string; href: string; tabs: NavTab[] };

export const NAV_SCOPES: NavScope[] = [
  {
    key: "all",
    label: "전체 서비스",
    href: "/admin",
    tabs: [
      { href: "/admin", label: "개요" },
      { href: "/admin/status", label: "상태" },
      { href: "/admin/admins", label: "관리자" },
    ],
  },
  {
    key: "health",
    label: "헬쑤",
    href: "/admin/health",
    tabs: [
      { href: "/admin/health", label: "개요" },
      { href: "/admin/health/members", label: "회원" },
      {
        href: "/admin/health/grants",
        label: "요금제",
        segments: [
          { href: "/admin/health/grants", label: "지급" },
          { href: "/admin/health/trainers", label: "트레이너 신청" },
          { href: "/admin/health/billing", label: "팀 요금제" },
        ],
      },
      {
        href: "/admin/health/support",
        label: "고객센터",
        segments: [
          { href: "/admin/health/support", label: "문의함" },
          { href: "/admin/health/support/notifications", label: "알림 설정" },
        ],
      },
      { href: "/admin/health/reports", label: "신고" },
      { href: "/admin/health/coaching", label: "코칭" },
      {
        href: "/admin/health/events",
        label: "운영",
        segments: [
          { href: "/admin/health/events", label: "앱 오류" },
          { href: "/admin/health/crons", label: "크론" },
          { href: "/admin/health/exercise-media", label: "운동영상" },
        ],
      },
      {
        href: "/admin/health/settings",
        label: "설정",
        segments: [
          { href: "/admin/health/settings", label: "앱 설정" },
          { href: "/admin/health/settings/access", label: "권한" },
          { href: "/admin/health/test", label: "테스트" },
        ],
      },
    ],
  },
  { key: "memo", label: "메모 moa", href: "/admin/memo", tabs: [{ href: "/admin/memo", label: "개요" }] },
  {
    key: "iq",
    label: "아이큐",
    href: "/admin/iq",
    tabs: [
      { href: "/admin/iq", label: "개요" },
      { href: "/admin/iq/questions", label: "문제 해설" },
    ],
  },
  {
    key: "liquor",
    label: "위스키",
    href: "/admin/liquor",
    tabs: [
      { href: "/admin/liquor", label: "상품" },
      { href: "/admin/liquor/traffic", label: "유입" },
    ],
  },
  { key: "server", label: "서버", href: "/admin/server", tabs: [{ href: "/admin/server", label: "프로세스·배포" }] },
];

/** 탭이 맡는 모든 경로(대표 + 세그먼트). */
export function tabHrefs(tab: NavTab): string[] {
  return tab.segments ? tab.segments.map((s) => s.href) : [tab.href];
}

/** 메뉴 안의 모든 경로 — 활성 판정용. */
export function allNavHrefs(): string[] {
  return [...new Set(NAV_SCOPES.flatMap((s) => s.tabs.flatMap(tabHrefs)))];
}

/**
 * 현재 경로에 대해 "가장 구체적으로 일치하는" href 하나를 고른다.
 * (예: /admin/iq/questions 에서는 '/admin/iq' 가 아니라 '/admin/iq/questions' 가 활성)
 * 서비스 첫 화면(/admin, /admin/health 처럼 다른 탭의 부모 경로)은 정확히 일치할 때만 활성이다.
 */
const EXACT_ONLY = new Set(NAV_SCOPES.filter((s) => s.tabs[0].href === s.href && s.tabs.some((t, i) => i > 0 && t.href.startsWith(`${s.href}/`))).map((s) => s.href));
export function activeHref(pathname: string | null, hrefs: string[]): string | null {
  if (!pathname) return null;
  let best: string | null = null;
  for (const h of hrefs) {
    const matches = EXACT_ONLY.has(h) ? pathname === h : pathname === h || pathname.startsWith(`${h}/`);
    if (matches && (best === null || h.length > best.length)) best = h;
  }
  return best;
}

export type NavLocation = { scope: NavScope; tab: NavTab | null; segment: NavSegment | null };

/** 경로 → 지금 서비스·탭·세그먼트. 메뉴에 없는 경로는 경로 접두어로 서비스만 고른다. */
export function locate(pathname: string | null): NavLocation {
  const active = activeHref(pathname, allNavHrefs());
  for (const scope of NAV_SCOPES) {
    for (const tab of scope.tabs) {
      if (active && tabHrefs(tab).includes(active)) {
        return { scope, tab, segment: tab.segments?.find((s) => s.href === active) ?? null };
      }
    }
  }
  const byPrefix = [...NAV_SCOPES]
    .filter((s) => s.href !== "/admin")
    .find((s) => pathname === s.href || pathname?.startsWith(`${s.href}/`));
  return { scope: byPrefix ?? NAV_SCOPES[0], tab: null, segment: null };
}

/** 검색 팔레트용 평평한 목록: "서비스 › 탭 › 세그먼트". */
export function navEntries(): { href: string; label: string; path: string; scope: ScopeKey }[] {
  return NAV_SCOPES.flatMap((scope) =>
    scope.tabs.flatMap((tab) =>
      tab.segments
        ? tab.segments.map((seg) => ({ href: seg.href, label: seg.label, path: `${scope.label} › ${tab.label}`, scope: scope.key }))
        : [{ href: tab.href, label: tab.label, path: scope.label, scope: scope.key }],
    ),
  );
}
