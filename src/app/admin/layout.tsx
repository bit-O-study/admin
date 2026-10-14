import { redirect } from "next/navigation";

import { isAdminUser } from "@/features/admin/admin";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { MobileNav } from "@/features/admin/components/mobile-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 미들웨어가 1차 게이트하지만, 레이아웃에서도 최종 확인(방어적).
  if (!(await isAdminUser())) redirect("/login?denied=1");

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 lg:flex">
      {/* 휴대폰은 상단 막대 + 하단 탭(MobileNav), 넓은 화면은 왼쪽 사이드바. */}
      <MobileNav />
      <aside className="hidden border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:block lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <AdminNav />
      </aside>
      <div className="min-w-0 flex-1 pb-[calc(var(--safe-bottom)+64px)] lg:pb-0">{children}</div>
    </div>
  );
}