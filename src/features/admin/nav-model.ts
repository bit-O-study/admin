/** 사이드바 구조 — 순수 모듈(아이콘은 admin-nav.tsx 에서 매핑). */
export type AdminLink = { href: string; label: string };
/** 사이트 그룹(트리) — 사이트명 아래 하위 페이지들이 들어간다. */
export type AdminGroup = {
  /** 아이콘 매핑 키 = 사이트 키. */
  key: string;
  label: string;
  /** 그룹 헤더 클릭 시 이동할 대표 경로. */
  href: string;
  links: AdminLink[];
};

/** 최상단 개요(통합 대시보드) 링크. */
export const OVERVIEW_LINK: AdminLink = { href: "/admin", label: "대시보드" };

/** 사이트별 트리. 헬쑤앱 대시보드는 바깥(개요) 대시보드로 빠져서 여기엔 없다. */
export const ADMIN_GROUPS: AdminGroup[] = [
  {
    key: "health",
    label: "헬쑤앱",
    href: "/admin/health/members",
    links: [
      { href: "/admin/health/members", label: "회원정보" },
      { href: "/admin/health/reports", label: "신고" },
      { href: "/admin/health/settings", label: "관리자설정" },
      { href: "/admin/health/exercise-media", label: "운동영상" },
    ],
  },
  {
    key: "iq",
    label: "아이큐",
    href: "/admin/iq",
    links: [
      { href: "/admin/iq", label: "통계" },
      { href: "/admin/iq/questions", label: "문제 해설" },
    ],
  },
  {
    key: "liquor",
    label: "위스키",
    href: "/admin/liquor",
    links: [{ href: "/admin/liquor", label: "상품·가격 관리" }],
  },
];

/** 트리 안의 모든 링크 href(개요 포함) — active 판정용. */
export function allNavHrefs(): string[] {
  return [OVERVIEW_LINK.href, ...ADMIN_GROUPS.flatMap((g) => g.links.map((l) => l.href))];
}

/**
 * 현재 경로에 대해 "가장 구체적으로 일치하는" href 하나를 고른다.
 * (예: /admin/iq/questions 에서는 '/admin/iq' 가 아니라 '/admin/iq/questions' 가 활성)
 * /admin 은 정확히 일치할 때만.
 */
export function activeHref(pathname: string | null, hrefs: string[]): string | null {
  if (!pathname) return null;
  let best: string | null = null;
  for (const h of hrefs) {
    const matches =
      h === "/admin"
        ? pathname === "/admin"
        : pathname === h || pathname.startsWith(`${h}/`);
    if (matches && (best === null || h.length > best.length)) best = h;
  }
  return best;
}