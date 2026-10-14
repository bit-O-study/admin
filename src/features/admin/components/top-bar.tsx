"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { ADMIN_GROUPS, OVERVIEW_LINK } from "@/features/admin/nav-model";
import { SERVICES, type ServiceKey } from "@/features/admin/services";

type Entry = { href: string; label: string; group: string; dot?: string };

/**
 * 넓은 화면 위쪽 막대 — 메뉴 검색(Ctrl/⌘ K)과 오늘 날짜 (2026-10-14 리뉴얼).
 * 메뉴가 20개라 사이드바에서 찾기보다 이름 몇 글자로 바로 가는 게 빠르다.
 * 회원·문의 내용 검색은 각 화면 검색칸이 맡는다(여기서는 메뉴만 찾는다).
 */
export function TopBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const entries = useMemo<Entry[]>(
    () => [
      { href: OVERVIEW_LINK.href, label: OVERVIEW_LINK.label, group: "BOadmin" },
      ...ADMIN_GROUPS.flatMap((g) => {
        const svc = SERVICES[g.key as ServiceKey];
        return g.links.map((l) => ({ href: l.href, label: l.label, group: svc?.label ?? g.label, dot: svc?.dot }));
      }),
    ],
    [],
  );
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = entries.filter((e) => words.every((w) => `${e.group} ${e.label}`.toLowerCase().includes(w)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      setTimeout(() => input.current?.focus(), 0);
    }
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <div className="sticky top-0 z-20 hidden h-14 items-center gap-3 border-b border-zinc-200/70 bg-white/80 px-6 backdrop-blur lg:flex dark:border-zinc-800 dark:bg-zinc-900/80">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-80 items-center gap-2 rounded-xl bg-zinc-100 px-3 text-[13px] text-zinc-500 transition hover:bg-zinc-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <Search size={15} aria-hidden="true" />
          메뉴 검색
          <kbd className="ml-auto rounded-md border border-zinc-200 bg-white px-1.5 text-[11px] font-semibold dark:border-zinc-700 dark:bg-zinc-900">Ctrl K</kbd>
        </button>
        <span className="ml-auto text-xs font-semibold text-zinc-400">헬쑤 · 메모 · 아이큐 · 위스키</span>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="메뉴 검색" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 dark:border-zinc-800">
              <Search size={16} className="text-zinc-400" aria-hidden="true" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
                  if (e.key === "Enter" && results[cursor]) go(results[cursor].href);
                }}
                placeholder="예: 고객센터, 요금제, 크론"
                className="h-12 flex-1 bg-transparent text-[15px] outline-none"
              />
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {results.map((r, i) => (
                <li key={r.href}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(r.href)}
                    className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm", i === cursor ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300")}
                  >
                    <span className={cn("h-2 w-2 rounded-[3px]", r.dot ?? "bg-zinc-400")} />
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-xs text-zinc-400">{r.group}</span>
                    {i === cursor && <CornerDownLeft size={14} className="ml-auto" aria-hidden="true" />}
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-zinc-400">찾는 메뉴가 없어요.</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
