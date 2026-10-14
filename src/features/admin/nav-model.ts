/** 사이드바 구조 — 순수 모듈(아이콘은 admin-nav.tsx 에서 매핑). */
export type AdminLink = {
  href: string;
  label: string;
  /** 같은 서비스 안의 작은 묶음 제목(리뉴얼 — 헬쑤 13개를 평평하게 늘어놓지 않으려고). */
  section?: string;
};
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
    label: "헬쑤",
    href: "/admin/health/members",
    links: [
      { href: "/admin/health/members", label: "회원정보", section: "회원·요금제" },
      { href: "/admin/health/grants", label: "요금제 지급", section: "회원·요금제" },
      { href: "/admin/health/trainers", label: "트레이너 이용권", section: "회원·요금제" },
      { href: "/admin/health/billing", label: "팀 요금제", section: "회원·요금제" },
      { href: "/admin/health/support", label: "고객센터", section: "소통" },
      { href: "/admin/health/reports", label: "신고", section: "소통" },
      { href: "/admin/health/coaching", label: "헬쑤 코칭", section: "소통" },
      { href: "/admin/health/support/notifications", label: "고객센터 알림", section: "소통" },
      { href: "/admin/health/events", label: "실사용 오류", section: "운영" },
      { href: "/admin/health/crons", label: "크론 실행", section: "운영" },
      { href: "/admin/health/exercise-media", label: "운동영상", section: "운영" },
      { href: "/admin/health/settings", label: "관리자설정", section: "설정" },
      { href: "/admin/health/test", label: "테스트", section: "설정" },
    ],
  },
  {
    // 메모 앱(moa)은 Supabase 가 아니라 자체 API 로 숫자만 받는다(features/memo/data.ts).
    key: "memo",
    label: "메모 moa",
    href: "/admin/memo",
    links: [{ href: "/admin/memo", label: "접속 통계" }],
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
