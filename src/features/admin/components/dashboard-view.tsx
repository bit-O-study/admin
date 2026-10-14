import Link from "next/link";
import { AlertTriangle, ArrowRight, Flag, MessageCircle, Timer } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardTitle } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { SERVICES, SERVICE_ORDER, type ServiceKey } from "@/features/admin/services";
import type { ActionItems } from "@/features/admin/action-items";

/**
 * 대시보드 화면(데이터만 받는다 — 2026-10-14 리뉴얼).
 * 순서: 처리할 일 → 서비스별 오늘 접속(어제 대비·30일 추이) → 아래에 기존 헬쑤 회원·접속 그래프(children).
 */
export type ServiceKpi = {
  /** 오늘 값. null = 연결 안 됨/못 불러옴. */
  today: number | null;
  yesterday?: number | null;
  /** 최근 30일 값(오래된 → 최근). 없으면 추이 줄 생략. */
  spark?: number[];
  unit?: string;
  label: string;
  note?: string;
  href: string;
  extra?: { label: string; value: string }[];
};

export function DashboardView({
  actions,
  kpis,
  children,
}: {
  actions: ActionItems;
  kpis: Record<ServiceKey, ServiceKpi>;
  children?: ReactNode;
}) {
  const today = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(new Date());
  const todo = [
    { label: "미확인 문의", n: actions.supportUnread, href: "/admin/health/support", icon: MessageCircle, tone: "indigo" as const },
    { label: "미처리 신고", n: actions.reportsOpen, href: "/admin/health/reports", icon: Flag, tone: "red" as const },
    { label: `앱 오류 (${actions.appErrorDays || 7}일)`, n: actions.appErrors, href: "/admin/health/events", icon: AlertTriangle, tone: "amber" as const },
    { label: "크론 실패·미실행", n: actions.cronIssues, href: "/admin/health/crons", icon: Timer, tone: "emerald" as const },
  ];
  const TODO_TONE = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300",
    red: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
  };
  const pending = todo.reduce((s, t) => s + t.n, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-[28px] dark:text-zinc-50">대시보드</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{today}</p>
        </div>
      </header>

      <section aria-labelledby="todo-h">
        <h2 id="todo-h" className="mb-3 flex items-center gap-2 text-sm font-extrabold text-zinc-950 dark:text-zinc-50">
          처리할 일
          {pending === 0 ? (
            <span className="rounded-full bg-emerald-50 px-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">모두 처리됨</span>
          ) : (
            <span className="rounded-full bg-red-500 px-2 text-xs font-black text-white tabular-nums">{pending}</span>
          )}
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {todo.map(({ label, n, href, icon: Icon, tone }) => (
            <Link key={href} href={href} className="group">
              <Card className="flex h-full items-center gap-3 transition group-hover:shadow-md">
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", n > 0 ? TODO_TONE[tone] : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800")}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-[22px] font-black leading-none tabular-nums", n > 0 ? "text-zinc-950 dark:text-zinc-50" : "text-zinc-300 dark:text-zinc-600")}>{n}</span>
                  <span className="mt-1 block truncate text-xs font-semibold text-zinc-500">{label}</span>
                </span>
                <ArrowRight size={16} className="ml-auto hidden shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500 sm:block" aria-hidden="true" />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="kpi-h">
        <h2 id="kpi-h" className="mb-3 text-sm font-extrabold text-zinc-950 dark:text-zinc-50">오늘 접속</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SERVICE_ORDER.map((key) => (
            <KpiCard key={key} service={key} kpi={kpis[key]} />
          ))}
        </div>
      </section>

      {children}
    </div>
  );
}

function KpiCard({ service, kpi }: { service: ServiceKey; kpi: ServiceKpi }) {
  const svc = SERVICES[service];
  const delta = kpi.today !== null && kpi.yesterday != null ? kpi.today - kpi.yesterday : null;
  return (
    <Link href={kpi.href} className="group">
      <Card className="flex h-full flex-col gap-2 overflow-hidden pb-0 transition group-hover:shadow-md sm:pb-0">
        <div className="flex items-center gap-2 text-[13px] font-bold text-zinc-600 dark:text-zinc-300">
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-black", svc.square)}>{svc.short}</span>
          {svc.label}
          <span className="ml-auto text-[11px] font-semibold text-zinc-400">{kpi.label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[30px] font-black leading-none tracking-tight tabular-nums text-zinc-950 dark:text-zinc-50">
            {kpi.today === null ? "—" : kpi.today.toLocaleString("ko-KR")}
          </span>
          {kpi.today !== null && <span className="text-sm font-bold text-zinc-400">{kpi.unit ?? "명"}</span>}
          {delta !== null && (
            <span
              className={cn(
                "rounded-full px-2 text-[11.5px] font-black tabular-nums",
                delta > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : delta < 0 ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
              )}
              title="어제 대비"
            >
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "±"} {Math.abs(delta).toLocaleString("ko-KR")}
            </span>
          )}
        </div>
        <p className="flex min-h-4 flex-wrap gap-x-1.5 text-[11.5px] text-zinc-400">
          {[
            kpi.note ?? (kpi.yesterday != null ? "어제 대비" : null),
            ...(kpi.extra ?? []).map((e) => (
              <>
                {e.label} <b className="font-bold text-zinc-600 dark:text-zinc-300">{e.value}</b>
              </>
            )),
          ]
            .filter(Boolean)
            .map((part, i) => (
              <span key={i}>
                {i > 0 && <span className="mr-1.5">·</span>}
                {part}
              </span>
            ))}
        </p>
        <div className="-mx-4 mt-auto sm:-mx-5">
          {kpi.spark && kpi.spark.length > 1 ? <Spark values={kpi.spark} color={svc.stroke} /> : <div className="h-3" />}
        </div>
      </Card>
    </Link>
  );
}

/** 30일 추이 작은 선 — 값이 작으면(하루 수 명) 3일 평균으로 매끈하게. 서버에서 SVG 로 그린다. */
function Spark({ values, color }: { values: number[]; color: string }) {
  const w = 300;
  const h = 48;
  const raw = Math.max(...values) < 10 ? values.map((_, i) => { const a = values.slice(Math.max(0, i - 2), i + 1); return a.reduce((s, v) => s + v, 0) / a.length; }) : values;
  const max = Math.max(...raw, 1);
  const min = Math.min(...raw, 0);
  const pts = raw.map((v, i) => [(i * w) / (raw.length - 1), h - 4 - ((v - min) / (max - min || 1)) * (h - 10)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-12 w-full" aria-hidden="true">
      <path d={`${d}L${w},${h}L0,${h}Z`} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
