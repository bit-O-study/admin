import { redirect } from "next/navigation";

import { isAdminUser } from "@/features/admin/admin";
import { getNavCounts, navBadges } from "@/features/admin/action-items";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { MobileNav } from "@/features/admin/components/mobile-nav";
import { TopBar } from "@/features/admin/components/top-bar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 미들웨어가 1차 게이트하지만, 레이아웃에서도 최종 확인(방어적).
  if (!(await isAdminUser())) redirect("/login?denied=1");
  // 사이드바·하단 탭 배지(미확인 문의·미처리 신고). 실패하면 0 — 화면은 그대로 뜬다.
  const badges = navBadges(await getNavCounts());

  return (
    <div className="min-h-screen bg-[#f4f5f9] dark:bg-zinc-950 lg:flex">
      {/* 휴대폰은 상단 막대 + 하단 탭(MobileNav), 넓은 화면은 왼쪽 사이드바 + 위쪽 막대(메뉴 검색). */}
      <MobileNav badges={badges} />
      <aside className="hidden border-zinc-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:border-r">
        <AdminNav badges={badges} />
      </aside>
      <div className="min-w-0 flex-1 pb-[calc(var(--safe-bottom)+64px)] lg:pb-0">
        <TopBar />
        {children}
      </div>
    </div>
  );
}
