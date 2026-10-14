"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MemoDay } from "@/features/memo/data";

/** 메모 일별 접속자(막대) · 활동한 사람(선). 날짜는 MM/DD 로 줄인다. */
export default function MemoChart({ days }: { days: MemoDay[] }) {
  const data = days.map((d) => ({ ...d, label: d.day.slice(5).replace("-", "/") }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -18 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="visitors" name="접속자" fill="#f0457e" radius={[4, 4, 0, 0]} />
        <Line dataKey="active" name="활동한 사람" type="monotone" stroke="#7b3ff2" strokeWidth={2} dot={{ r: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
