"use client";
import { useActionState, useRef, type ReactNode } from "react";
import { useConfirm, type ConfirmOptions } from "@/components/use-confirm";
import { trainerAction } from "./actions";

/** confirm 이 있으면 보내기 전에 확인 창을 띄운다(2026-10-27, 예: 이용권 해지). */
export function TrainerForm({ intent, label, children, confirm }: { intent: string; label: string; children?: ReactNode; confirm?: ConfirmOptions }) {
  const [state, action, pending] = useActionState(trainerAction, { ok: false, message: "" });
  const [confirmDialog, ask] = useConfirm();
  const form = useRef<HTMLFormElement>(null);
  const approved = useRef(false);
  return <form ref={form} action={action} className="space-y-3" onSubmit={async (e) => {
    if (!confirm || approved.current) { approved.current = false; return; }
    e.preventDefault();
    if (await ask(confirm)) { approved.current = true; form.current?.requestSubmit(); }
  }}>
    {confirmDialog}
    <input type="hidden" name="intent" value={intent} />
    <fieldset disabled={pending} className="space-y-3 disabled:opacity-60">{children}
      <button className="min-h-11 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white dark:text-zinc-950" type="submit">{pending ? "처리 중…" : label}</button>
    </fieldset>
    {state.message && <p role={state.ok ? "status" : "alert"} className="text-sm leading-6">{state.message}</p>}
    {state.link && <label className="block space-y-1 text-sm">초대 링크 (7일 유효)<input readOnly value={state.link} onFocus={event => event.target.select()} className="min-h-11 w-full rounded-lg border border-line px-2" /></label>}
  </form>;
}
