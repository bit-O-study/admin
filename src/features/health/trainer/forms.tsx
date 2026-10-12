"use client";
import { useActionState, type ReactNode } from "react";
import { trainerAction } from "./actions";

export function TrainerForm({ intent, label, children }: { intent: string; label: string; children?: ReactNode }) {
  const [state, action, pending] = useActionState(trainerAction, { ok: false, message: "" });
  return <form action={action} className="space-y-3">
    <input type="hidden" name="intent" value={intent} />
    <fieldset disabled={pending} className="space-y-3 disabled:opacity-60">{children}
      <button className="min-h-11 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white dark:text-zinc-950" type="submit">{pending ? "처리 중…" : label}</button>
    </fieldset>
    {state.message && <p role={state.ok ? "status" : "alert"} className="text-sm leading-6">{state.message}</p>}
    {state.link && <label className="block space-y-1 text-sm">초대 링크 (7일 유효)<input readOnly value={state.link} onFocus={event => event.target.select()} className="min-h-11 w-full rounded-lg border border-line px-2" /></label>}
  </form>;
}
