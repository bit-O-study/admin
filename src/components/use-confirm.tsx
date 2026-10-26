"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};

/**
 * window.confirm 대신 쓰는 인앱 확인 창.
 * (안드로이드 WebView 는 WebChromeClient 가 없으면 confirm 이 늘 false 라 버튼이 아무 반응이 없었다.)
 *
 *   const [confirmDialog, ask] = useConfirm();
 *   if (!(await ask({ message: "삭제할까요?", tone: "danger" }))) return;
 *   ...
 *   return <>{confirmDialog}...</>;
 */
export function useConfirm(): [ReactNode, (options: ConfirmOptions) => Promise<boolean>] {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const ask = useCallback((next: ConfirmOptions) => {
    resolver.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  }, []);
  const onConfirm = useCallback(() => close(true), [close]);
  const onCancel = useCallback(() => close(false), [close]);

  const dialog = (
    <ConfirmDialog
      open={options !== null}
      title={options?.title}
      message={options?.message ?? ""}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      tone={options?.tone}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
  return [dialog, ask];
}
