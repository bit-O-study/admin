"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SeriesPoint } from "@/features/health/dashboard-stats";

/** 관리자 대시보드 선그래프 (recharts) — dynamic(ssr:false)로 지연 로드. */
export default function MetricChart({
  title,
  data,
  color,
}: {
  title: string;
  data: SeriesPoint[];
  color: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-3 text-sm font-bold text-zinc-950 dark:text-zinc-100">
        {title}
      </h2>
      {data.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-zinc-400">
          데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}