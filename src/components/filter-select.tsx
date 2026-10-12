"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { filterOptions, type FilterOption } from "@/components/filter-options";

/**
 * 검색 칸이 붙은 select — 목록이 길어 일일이 찾기 어려운 자리(회원·그룹 고르기)에 쓴다.
 * 검색 결과가 하나뿐이면 Enter 로 바로 고른다.
 */
export function FilterSelect({
  options,
  value,
  onChange,
  label,
  name,
  required,
  emptyLabel = "선택",
  searchPlaceholder = "검색",
  className = "",
}: {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  /** 접근성 이름 — 검색 칸은 "<label> 검색". */
  label: string;
  name?: string;
  required?: boolean;
  emptyLabel?: string;
  searchPlaceholder?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const shown = filterOptions(options, query, value);
  const matches = shown.filter((o) => o.value !== value);
  const field =
    "h-10 w-full rounded-lg border border-zinc-300 bg-white text-sm outline-none focus:border-brand/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="relative">
        <Search
          aria-hidden="true"
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="search"
          aria-label={`${label} 검색`}
          value={query}
          placeholder={searchPlaceholder}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            // 폼 안에서 Enter 가 제출로 이어지지 않게.
            e.preventDefault();
            if (query.trim() && matches.length === 1) onChange(matches[0].value);
          }}
          className={`${field} pl-8 pr-2`}
        />
      </div>
      <select
        aria-label={label}
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${field} px-2`}
      >
        <option value="">
          {query.trim() ? `${emptyLabel} (${matches.length}건)` : emptyLabel}
        </option>
        {shown.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
