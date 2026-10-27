import Link from "@/components/PendingLink";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { buttonClass } from "@/components/ui/kit";
import { SERVICES, SERVICE_ORDER, type ServiceKey } from "@/features/admin/services";
import type { ActionItems } from "@/features/admin/action-items";

/**
 * 전체 서비스 › 개요 (2026-10-14 리뉴얼, 2026-10-27 BOadmin 2.0).
 * 순서: 서비스별 오늘 숫자 → 처리할 일 한 줄 → 활동 · 상태. 헬쑤 회원 그래프는 헬쑤 › 개요로 옮겼다.
 * 데이터만 받는다 — 활동·상태 카드는 각자 늦게 불러오도록 자리(slot)로 받는다.
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
  serviceCards,
  activity,
  status,
}: {
  actions: ActionItems;
  kpis: Record<ServiceKey, ServiceKpi>;
  serviceCards?: Partial<Record<ServiceKey, ReactNode>>;
  activity?: ReactNode;
  status?: ReactNode;
}) {
  const today = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short" }).format(new Date());
  const todo = [
    { label: "미확인 문의", n: actions.supportUnread, href: "/admin/health/support" },
    { label: "미처리 신고", n: actions.reportsOpen, href: "/admin/health/reports" },
    { label: `앱 오류 ${actions.appErrorDays || 14}일`, n: actions.appErrors, href: "/admin/health/events" },
    { label: "크론 실패·미실행", n: actions.cronIssues, href: "/admin/health/crons" },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">개요</h1>
          <p className="mt-1 text-[13.5px] text-zinc-500">{today} · 오늘 0시부터</p>
        </div>
        {/* 895c3ea 바로가기(프로젝트 사이트·자료실)를 2.0 버튼 모양으로. */}
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/projects" className={buttonClass("secondary", "sm")}>사이트 열기</Link>
          <Link href="/admin/library" className={buttonClass("secondary", "sm")}>자료실 · 파일 검수</Link>
        </div>
      </header>

      <section aria-label="오늘 접속" className="grid overflow-hidden rounded-lg border border-line bg-surface sm:grid-cols-2 lg:grid-cols-4">
        {SERVICE_ORDER.map((key) => (
          <div key={key} className="border-b border-line last:border-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
            {serviceCards?.[key] ?? <KpiCard service={key} kpi={kpis[key]} />}
          </div>
        ))}
      </section>

      <section aria-label="처리할 일" className="grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-4">
        {todo.map((t, i) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn("group flex items-center gap-2.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900", i % 2 === 0 && "border-r border-line", i < 2 && "border-b border-line lg:border-b-0", i === 1 && "lg:border-r")}
          >
            <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", t.n > 0 ? "bg-red-500" : "bg-zinc-300 dark:bg-zinc-700")} />
            <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-500">{t.label}</span>
            <span className={cn("text-[15px] font-semibold tabular-nums", t.n === 0 && "text-zinc-400")}>{t.n.toLocaleString("ko-KR")}</span>
            <ArrowRight size={14} className="text-zinc-300 transition group-hover:text-zinc-500 dark:text-zinc-700" aria-hidden="true" />
          </Link>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {activity}
        {status}
      </div>
    </div>
  );
}

/** 개요의 활동·상태 카드 틀. */
export function OverviewCard({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        <Link href={href} className="text-[12.5px] text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50">{linkLabel} →</Link>
      </div>
      {children}
    </section>
  );
}

export function KpiCard({ service, kpi }: { service: ServiceKey; kpi: ServiceKpi }) {
  const svc = SERVICES[service];
  const delta = kpi.today !== null && kpi.yesterday != null ? kpi.today - kpi.yesterday : null;
  return (
    <Link href={kpi.href} className="flex h-full flex-col gap-1.5 px-4 pt-4 pb-3 hover:bg-zinc-50 dark:hover:bg-zinc-900">
      <span className="flex items-center gap-2 text-[12.5px] text-zinc-500">
        <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", svc.dot)} />
        {svc.label} · {kpi.label}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold tracking-tight tabular-nums">{kpi.today === null ? "—" : kpi.today.toLocaleString("ko-KR")}</span>
        {kpi.today !== null && <span className="text-[13px] text-zinc-500">{kpi.unit ?? "명"}</span>}
      </span>
      <span className="flex min-h-5 flex-wrap items-center gap-x-2 text-[12px] text-zinc-500">
        {delta !== null && (
          <span className={cn("font-mono", delta > 0 ? "text-emerald-700 dark:text-emerald-400" : delta < 0 ? "text-red-600 dark:text-red-400" : "")}>
            {delta > 0 ? "+" : delta < 0 ? "−" : "±"}{Math.abs(delta).toLocaleString("ko-KR")} 어제 대비
          </span>
        )}
        {kpi.note && <span>{kpi.note}</span>}
        {kpi.extra?.map((e) => (
          <span key={e.label}>{e.label} <b className="font-medium text-zinc-700 dark:text-zinc-300">{e.value}</b></span>
        ))}
      </span>
      {kpi.spark && kpi.spark.length > 1 ? <Spark values={kpi.spark} color={svc.stroke} /> : <div className="h-8" />}
    </Link>
  );
}

function Spark({ values, color }: { values: number[]; color: string }) {
  const w = 300;
  const h = 32;
  // 값이 작으면(최대 10 미만) 3일 평균으로 들쭉날쭉함을 줄인다(예전 규칙 유지).
  const raw = Math.max(...values) < 10 ? values.map((_, i) => { const a = values.slice(Math.max(0, i - 2), i + 1); return a.reduce((s, v) => s + v, 0) / a.length; }) : values;
  const max = Math.max(...raw, 1);
  const min = Math.min(...raw, 0);
  const pts = raw.map((v, i) => [(i * w) / (raw.length - 1), h - 3 - ((v - min) / (max - min || 1)) * (h - 8)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-1 block h-8 w-full" aria-hidden="true">
      <path d={`${d}L${w},${h}L0,${h}Z`} fill={color} opacity={0.08} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
