import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentAdminEmail, isAdminUser } from "@/features/admin/admin";
import { getNavCounts, navBadges } from "@/features/admin/action-items";
import { AppHeader } from "@/features/admin/components/app-header";
import { CommandPalette } from "@/features/admin/components/command-palette";
import { MobileNav } from "@/features/admin/components/mobile-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 미들웨어가 1차 게이트하지만, 레이아웃에서도 최종 확인(방어적).
  if (!(await isAdminUser())) redirect("/login?denied=1");

  // 2026-10-27 BOadmin 2.0: 왼쪽 사이드바 대신 위쪽 막대(서비스 전환 + 탭). 휴대폰은 하단 탭을 더한다.
  // 배지(미확인 문의·미처리 신고)는 따로 불러온다. 실패하면 0 — 화면은 그대로 뜬다.
  return (
    <div className="min-h-screen bg-canvas">
      <Suspense fallback={<AppHeader />}><Header /></Suspense>
      <Suspense fallback={<MobileNav />}><MobileTabs /></Suspense>
      <CommandPalette />
      <div className="min-w-0 pb-[calc(var(--safe-bottom)+64px)] lg:pb-0">{children}</div>
    </div>
  );
}

async function Header() {
  const [counts, email] = await Promise.all([getNavCounts(), getCurrentAdminEmail()]);
  return <AppHeader badges={navBadges(counts)} email={email} />;
}

async function MobileTabs() {
  return <MobileNav badges={navBadges(await getNavCounts())} />;
}
