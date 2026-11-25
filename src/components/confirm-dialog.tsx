"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

const subscribe = () => () => {};
const clientMounted = () => true;
const serverMounted = () => false;

/**
 * 인앱 confirm 다이얼로그. (헬스앱에서 이식)
 * 위험(danger) 작업은 '취소' 에 먼저 포커스를 둔다 — Enter 한 번에 실행되지 않게.
 * 닫히면 열기 전 포커스로 돌려준다.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "default",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const mounted = useSyncExternalStore(subscribe, clientMounted, serverMounted);
  const titleId = useId();
  const messageId = useId();
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!mounted || !open) return null;

  const danger = tone === "danger";
  const confirmBtn = danger
    ? "bg-red-600 text-white hover:bg-red-500"
    : "bg-emerald-600 text-white hover:bg-emerald-500";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={messageId}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              danger
                ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                : "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            }`}
          >
            <AlertTriangle aria-hidden="true" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            {title ? (
              <h3 id={titleId} className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                {title}
              </h3>
            ) : null}
            <p
              id={messageId}
              className={`whitespace-pre-line text-sm leading-6 text-zinc-700 dark:text-zinc-300 ${title ? "mt-1" : ""}`}
            >
              {message}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          {cancelLabel ? (
            <button
              type="button"
              onClick={onCancel}
              autoFocus={danger}
              className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${confirmBtn}`}
            autoFocus={!danger || !cancelLabel}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
