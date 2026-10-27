import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentAdminEmail, isAdminUser } from "@/features/admin/admin";
import { getNavCounts, navBadges } from "@/features/admin/action-items";
import { AppHeader } from "@/features/admin/components/app-header";
import { CommandPalette } from "@/features/admin/components/command-palette";
import { MobileNav } from "@/features/admin/components/mobile-nav";
import { StatusPill } from "@/features/admin/components/status-pill";
import { getStatusReport } from "@/features/admin/status";
import { summarize } from "@/features/admin/status-model";

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
      {/* 긴 메일·이름 같은 줄바꿈 없는 글자가 본문을 가로로 밀면 고정 대화상자 위치가 어긋난다 — 본문 가로 넘침은 잘라 둔다. */}
      <div className="min-w-0 overflow-x-clip pb-[calc(var(--safe-bottom)+64px)] lg:pb-0">{children}</div>
    </div>
  );
}

async function Header() {
  const [counts, email] = await Promise.all([getNavCounts(), getCurrentAdminEmail()]);
  // 상태 확인(DB·API·서버)은 느릴 수 있어 알약만 따로 기다린다 — 막대와 탭은 먼저 뜬다.
  return <AppHeader badges={navBadges(counts)} email={email} status={<Suspense fallback={null}><HeaderStatus /></Suspense>} />;
}

async function HeaderStatus() {
  const report = await getStatusReport();
  if (report.items.length === 0) return null;
  const sum = summarize(report.items);
  return <StatusPill level={sum.level} label={sum.label} problems={report.items.filter((i) => i.level !== "ok")} checkedAt={report.checkedAt} />;
}

async function MobileTabs() {
  return <MobileNav badges={navBadges(await getNavCounts())} />;
}
