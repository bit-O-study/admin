"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CornerDownLeft, Search } from "lucide-react";

import { Buffering } from "@/components/Buffering";
import { cn } from "@/lib/utils";
import { navEntries } from "@/features/admin/nav-model";
import { SCOPE_DOT } from "@/features/admin/services";

/**
 * 통합 검색 (Ctrl/⌘ K) — 2026-10-27 BOadmin 2.0.
 * 어디서든 열린다: 키보드, 위쪽 막대 검색 버튼, 휴대폰 하단 탭(openCommandPalette 이벤트).
 */
const OPEN_EVENT = "boadmin:command-palette";
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Item = { key: string; href: string; label: string; hint?: string; dot?: string; group: string };

export function CommandPalette() {
  const router = useRouter();
  const [pending, startNavigation] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const menu = useMemo<Item[]>(
    () => navEntries().map((e) => ({ key: `m:${e.href}`, href: e.href, label: e.label, hint: e.path, dot: SCOPE_DOT[e.scope], group: "메뉴" })),
    [],
  );
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const items = menu.filter((e) => words.every((w) => `${e.hint} ${e.label}`.toLowerCase().includes(w)));

  useEffect(() => {
    const show = () => {
      setQ("");
      setCursor(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQ("");
        setCursor(0);
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(OPEN_EVENT, show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => input.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    startNavigation(() => router.push(href));
  };

  return (
    <>
      {pending && <Buffering overlay />}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="검색" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-[0_16px_70px_rgba(0,0,0,.2)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 border-b border-line px-4">
              <Search size={16} className="text-zinc-400" aria-hidden="true" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, items.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
                  if (e.key === "Enter" && items[cursor]) go(items[cursor].href);
                }}
                placeholder="메뉴 이름으로 찾기 — 예: 고객센터, 크론, 요금제"
                aria-label="검색어"
                className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-zinc-400"
              />
              <kbd className="rounded border border-line px-1 font-mono text-[10.5px] text-zinc-500">Esc</kbd>
            </div>
            <ul className="max-h-[52vh] overflow-y-auto p-2" role="listbox" aria-label="검색 결과">
              {items.map((r, i) => {
                const head = i === 0 || items[i - 1].group !== r.group;
                return (
                  <li key={r.key} role="option" aria-selected={i === cursor}>
                    {head && <p className="px-2.5 pt-2 pb-1 text-[11.5px] font-medium text-zinc-500">{r.group}</p>}
                    <button
                      type="button"
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => go(r.href)}
                      className={cn("flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13.5px]", i === cursor && "bg-zinc-100 dark:bg-zinc-900")}
                    >
                      {r.dot && <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", r.dot)} />}
                      <span className="font-medium">{r.label}</span>
                      {r.hint && <span className="truncate text-[12px] text-zinc-500">{r.hint}</span>}
                      {i === cursor && <CornerDownLeft size={13} className="ml-auto shrink-0 text-zinc-400" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
              {items.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-zinc-500">“{q}”에 맞는 메뉴가 없어요.</li>}
            </ul>
            <div className="flex gap-4 border-t border-line px-4 py-2 text-[11.5px] text-zinc-500">
              <span><kbd className="mr-1 rounded border border-line px-1 font-mono">↑↓</kbd>이동</span>
              <span><kbd className="mr-1 rounded border border-line px-1 font-mono">↵</kbd>열기</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
