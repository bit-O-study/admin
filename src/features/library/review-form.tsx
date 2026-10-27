"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewState } from "./data";
export function ReviewForm({ id, status, note }: { id: string; status: ReviewState; note: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: data.get("status"), note: data.get("note") }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "저장하지 못했습니다.");
      setMessage("검수 기록을 저장했어요."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "저장하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800"><fieldset disabled={busy} className="flex flex-col gap-2"><label className="text-xs font-bold text-zinc-500">검수 상태<select name="status" defaultValue={status} className="mt-1 block w-full rounded-xl border border-zinc-200 bg-transparent p-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"><option value="pending">확인 대기</option><option value="reviewed">확인 완료</option><option value="hold">보류</option></select></label><label className="text-xs font-bold text-zinc-500">검수 메모<textarea name="note" defaultValue={note} maxLength={1000} rows={2} placeholder="확인한 내용이나 보류 이유를 남겨 주세요." className="mt-1 block w-full resize-y rounded-xl border border-zinc-200 bg-transparent p-2 text-sm font-normal text-zinc-900 dark:border-zinc-700 dark:text-zinc-100" /></label><button className="self-end rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">{busy ? "저장 중…" : "검수 기록 저장"}</button></fieldset>{message && <p role="status" className="mt-2 text-xs text-indigo-600 dark:text-indigo-300">{message}</p>}</form>;
}
