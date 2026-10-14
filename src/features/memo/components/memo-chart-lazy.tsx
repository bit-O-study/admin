"use client";

import dynamic from "next/dynamic";

import type { MemoDay } from "@/features/memo/data";

// recharts 는 무겁고 브라우저 전용이라 다른 그래프처럼 지연 로드한다.
const MemoChart = dynamic(() => import("./memo-chart"), {
  ssr: false,
  loading: () => <div className="h-[240px] animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />,
});

export function MemoChartLazy({ days }: { days: MemoDay[] }) {
  return <MemoChart days={days} />;
}
