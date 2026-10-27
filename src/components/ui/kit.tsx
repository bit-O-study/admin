import Link from "@/components/PendingLink";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * BOadmin 공용 화면 부품 (2026-10-14 리뉴얼, 2026-10-27 BOadmin 2.0 흑백 규칙).
 * 예전에는 버튼 12~15종·카드 6~8종·숫자 카드 6벌이 페이지마다 따로 있었다. 새 화면은 이것만 쓴다.
 * 서버 컴포넌트에서도 쓸 수 있게 상태(useState)를 두지 않는다.
 * 규칙: 주요 버튼은 검정(다크에선 흰색), 색은 상태에만, 면은 선 하나, 굵기는 400·500·600.
 */

/* ── 버튼 ─────────────────────────────────────────────── */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";
const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200",
  secondary: "border border-line bg-surface text-zinc-950 hover:bg-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-900",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
  danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400",
};
const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-[13px]",
  md: "h-9 gap-2 rounded-md px-4 text-[13.5px]",
};
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
    BUTTON_VARIANT[variant],
    BUTTON_SIZE[size],
    className,
  );
}
export function ButtonLink({ href, variant, size, className, children }: { href: string; variant?: ButtonVariant; size?: ButtonSize; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

/** 입력칸·선택칸 공통 모양. */
export const fieldClass =
  "h-9 w-full min-w-0 rounded-md border border-line bg-surface px-3 text-[13.5px] text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-50/10";

/* ── 면 ───────────────────────────────────────────────── */
export function Card({ className, children, padded = true }: { className?: string; children: ReactNode; padded?: boolean }) {
  return <div className={cn("rounded-lg border border-line bg-surface", padded && "p-4 sm:p-5", className)}>{children}</div>;
}
export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-[14px] font-semibold text-zinc-950 dark:text-zinc-50">{children}</h2>
      {action && <div className="ml-auto text-[12.5px] text-zinc-500">{action}</div>}
    </div>
  );
}

/* ── 페이지 제목 ─────────────────────────────────────── */
export function PageHeader({ title, description, icon, actions }: { title: ReactNode; description?: ReactNode; icon?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end gap-3">
      {icon}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-[28px] dark:text-zinc-50">{title}</h1>
        {description && <p className="mt-1 text-[13.5px] text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ── 숫자 카드 ───────────────────────────────────────── */
export type Tone = "zinc" | "indigo" | "emerald" | "pink" | "violet" | "amber" | "red" | "sky";
/** 숫자는 검정이 기본. 색은 상태를 뜻할 때(빨강=문제, 초록=정상)만 쓴다. */
const TONE_TEXT: Record<Tone, string> = {
  zinc: "text-zinc-950 dark:text-zinc-50",
  indigo: "text-zinc-950 dark:text-zinc-50",
  emerald: "text-emerald-700 dark:text-emerald-400",
  pink: "text-zinc-950 dark:text-zinc-50",
  violet: "text-zinc-950 dark:text-zinc-50",
  amber: "text-amber-700 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
  sky: "text-zinc-950 dark:text-zinc-50",
};
export function StatCard({ label, value, sub, tone = "zinc", className }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: Tone; className?: string }) {
  return (
    <Card className={className}>
      <p className="text-[12.5px] text-zinc-500">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-semibold tracking-tight tabular-nums", TONE_TEXT[tone])}>
        {typeof value === "number" ? value.toLocaleString("ko-KR") : value}
      </p>
      {sub && <p className="mt-1 text-[12px] text-zinc-500">{sub}</p>}
    </Card>
  );
}

/* ── 칩·배지 ─────────────────────────────────────────── */
const BADGE_TONE: Record<Tone, string> = {
  zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  pink: "bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
  violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  red: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
};
export function Badge({ tone = "zinc", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2 text-[11.5px] font-medium", BADGE_TONE[tone], className)}>{children}</span>;
}
/** 필터용 칩 링크 — 지금 고른 것은 회색 면, 나머지는 글자만(Vercel 세그먼트). */
export function ChipLink({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-3 text-[13px] tabular-nums transition",
        active
          ? "border-line bg-surface font-medium text-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,.06)] dark:text-zinc-50"
          : "border-transparent text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50",
      )}
    >
      {children}
    </Link>
  );
}

/* ── 빈 화면 ─────────────────────────────────────────── */
export function EmptyState({ title, hint, action }: { title: ReactNode; hint?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-800">
      <p className="text-[14px] font-medium text-zinc-950 dark:text-zinc-50">{title}</p>
      {hint && <p className="max-w-md text-[13px] text-zinc-500">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/* ── 표 ───────────────────────────────────────────────── */
/** 표 바깥 상자 — 좁은 화면에서는 표만 옆으로 밀린다(본문은 안 밀림). */
export function TableBox({ children, minWidth = 560 }: { children: ReactNode; minWidth?: number }) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px]" style={{ minWidth }}>
          {children}
        </table>
      </div>
    </Card>
  );
}
export const thClass = "border-b border-line bg-zinc-50 px-4 py-2.5 text-left text-[12px] font-medium text-zinc-500 dark:bg-zinc-950";
export const tdClass = "border-t border-line px-4 py-3 tabular-nums";
