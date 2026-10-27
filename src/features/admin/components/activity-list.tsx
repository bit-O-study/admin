import Link from "@/components/PendingLink";
import { AlertTriangle, ArrowUpCircle, Flag, MessageCircle, Timer, UserMinus, UserPlus, XCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { SCOPE_DOT } from "@/features/admin/services";
import { NAV_SCOPES } from "@/features/admin/nav-model";
import type { Activity, ActivityKind } from "@/features/admin/activity-model";

/** 활동 한 줄 목록 (2026-10-27 BOadmin 2.0) — 개요 카드와 활동 화면이 같이 쓴다. */
const ICON: Record<ActivityKind, LucideIcon> = {
  signup: UserPlus,
  withdraw: UserMinus,
  support: MessageCircle,
  report: Flag,
  cron_fail: Timer,
  app_error: AlertTriangle,
  deploy: ArrowUpCircle,
  deploy_fail: XCircle,
};
const BAD: ReadonlySet<ActivityKind> = new Set(["cron_fail", "app_error", "deploy_fail"]);
const scopeLabel = (k: Activity["scope"]) => NAV_SCOPES.find((s) => s.key === k)?.label ?? "";

export function relativeTime(iso: string, now = new Date()): string {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}일 전` : new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(new Date(iso));
}
const exact = (iso: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export function ActivityList({ items, now = new Date() }: { items: Activity[]; now?: Date }) {
  return (
    <ul>
      {items.map((a) => {
        const Icon = ICON[a.kind];
        return (
          <li key={a.id} className="border-b border-line last:border-0">
            <Link href={a.href} className="grid grid-cols-[28px_1fr_auto] items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <span className={cn("mt-px flex h-7 w-7 items-center justify-center rounded-full border border-line bg-canvas", BAD.has(a.kind) ? "text-red-600 dark:text-red-400" : "text-zinc-500")}>
                <Icon size={14} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] leading-5">
                  <span className="font-medium">{a.title}</span>
                  {a.detail && <span className="text-zinc-500"> · {a.detail}</span>}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-zinc-500">
                  <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", SCOPE_DOT[a.scope])} />
                  {scopeLabel(a.scope)}
                </span>
              </span>
              <time dateTime={a.at} title={exact(a.at)} className="pt-0.5 font-mono text-[11.5px] whitespace-nowrap text-zinc-500">
                {relativeTime(a.at, now)}
              </time>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
