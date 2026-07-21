/** 사이드바 구조 — 순수 모듈(아이콘은 admin-nav.tsx 에서 매핑). */
export type AdminLink = { href: string; label: string };
export type AdminSection = { title: string; links: AdminLink[] };

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    title: "개요",
    links: [{ href: "/admin", label: "대시보드" }],
  },
  {
    title: "사이트",
    links: [
      { href: "/admin/liquor", label: "양주 가격조회" },
      { href: "/admin/iq", label: "아이큐" },
      { href: "/admin/health", label: "헬스앱" },
    ],
  },
];

export function isAdminLinkActive(
  href: string,
  pathname: string | null,
): boolean {
  if (!pathname) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}