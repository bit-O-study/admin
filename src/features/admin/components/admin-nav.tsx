"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { signOutAction } from "@/features/auth/actions";
import { SERVICES, type ServiceKey } from "@/features/admin/services";
import {
  ADMIN_GROUPS,
  OVERVIEW_LINK,
  activeHref,
  allNavHrefs,
} from "@/features/admin/nav-model";

/**
 * 사이드바 (2026-10-14 리뉴얼).
 * - 서비스마다 색 점. 페이지가 하나뿐인 서비스는 한 줄, 여러 개면 그 서비스 안에 있을 때만 펼친다
 *   (예전엔 링크 20개가 늘 펼쳐져 있었다).
 * - 헬쑤는 '회원·요금제 / 소통 / 운영 / 설정' 작은 제목으로 묶는다.
 * - 미확인 문의·미처리 신고는 빨간 배지(badges: href → 건수).
 */
export function AdminNav({ badges = {}, expandAll = false }: { badges?: Record<string, number>; /** 휴대폰 메뉴 시트 — 전부 펼친다. */ expandAll?: boolean }) {
  const pathname = usePathname();
  const active = activeHref(pathname, allNavHrefs());

  const row =
    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition";
  const rowIdle = "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50";
  const rowOn = "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300";
  const badge = (n: number | undefined) =>
    n ? (
      <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[11px] font-black leading-5 text-white tabular-nums">
        {n > 99 ? "99+" : n}
      </span>
    ) : null;

  return (
    <nav className="flex flex-col gap-0.5 p-3 lg:h-full lg:p-4">
      <Link href="/admin" className="mb-4 hidden items-center gap-2.5 px-2 lg:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-600 to-pink-500 text-[11px] font-black text-white">
          BO
        </span>
        <span className="text-[17px] font-black tracking-tight text-zinc-950 dark:text-zinc-50">BOadmin</span>
      </Link>

      <Link href={OVERVIEW_LINK.href} className={cn(row, active === OVERVIEW_LINK.href ? rowOn : rowIdle)}>
        <LayoutDashboard aria-hidden="true" size={17} />
        {OVERVIEW_LINK.label}
      </Link>

      <p className="px-3 pt-5 pb-1.5 text-[11px] font-bold tracking-wide text-zinc-400">서비스</p>

      {ADMIN_GROUPS.map((group) => {
        const svc = SERVICES[group.key as ServiceKey];
        const groupActive = group.links.some((l) => l.href === active);
        const groupBadge = group.links.reduce((sum, l) => sum + (badges[l.href] ?? 0), 0);
        const single = group.links.length === 1;
        const head = (
          <Link
            href={group.href}
            className={cn(row, single && groupActive ? rowOn : groupActive ? "text-zinc-950 dark:text-zinc-50" : rowIdle)}
          >
            <span className={cn("h-2 w-2 shrink-0 rounded-[3px]", svc?.dot ?? "bg-zinc-400")} />
            {svc?.label ?? group.label}
            {(!groupActive && !expandAll) || single ? badge(groupBadge) : null}
          </Link>
        );
        if (single || (!groupActive && !expandAll)) return <div key={group.key}>{head}</div>;

        let lastSection: string | undefined;
        return (
          <div key={group.key}>
            {head}
            <div className="mb-1 flex flex-col gap-0.5 pl-4">
              {group.links.map((link) => {
                const showSection = link.section && link.section !== lastSection;
                lastSection = link.section;
                return (
                  <div key={link.href}>
                    {showSection && (
                      <p className="px-3 pt-2 pb-0.5 text-[10.5px] font-bold text-zinc-400">{link.section}</p>
                    )}
                    <Link
                      href={link.href}
                      aria-current={active === link.href ? "page" : undefined}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-1.5 text-[13px] font-medium transition",
                        active === link.href ? rowOn : rowIdle,
                      )}
                    >
                      {link.label}
                      {badge(badges[link.href])}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <form action={signOutAction} className="mt-6 lg:mt-auto lg:pt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-zinc-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
        >
          <LogOut aria-hidden="true" size={17} />
          로그아웃
        </button>
      </form>
    </nav>
  );
}
