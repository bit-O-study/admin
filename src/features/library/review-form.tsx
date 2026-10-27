"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewState } from "./data";
import { buttonClass, fieldClass } from "@/components/ui/kit";

/** 파일 검수 상태·메모 저장 (895c3ea). 2026-10-27: BOadmin 2.0 화면 규칙으로 모양만 바꿨다. */
export function ReviewForm({ id, status, note }: { id: string; status: ReviewState; note: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [failed, setFailed] = useState(false);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setMessage(""); setFailed(false);
    try {
      const response = await fetch("/api/admin/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: data.get("status"), note: data.get("note") }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "저장하지 못했습니다.");
      setMessage("검수 기록을 저장했어요."); router.refresh();
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "저장하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={save}>
      <fieldset disabled={busy} className="flex flex-col gap-2 disabled:opacity-60">
        <label className="text-[12px] text-zinc-500">
          검수 상태
          <select name="status" defaultValue={status} className={`${fieldClass} mt-1`}>
            <option value="pending">확인 대기</option>
            <option value="reviewed">확인 완료</option>
            <option value="hold">보류</option>
          </select>
        </label>
        <label className="text-[12px] text-zinc-500">
          검수 메모
          <textarea name="note" defaultValue={note} maxLength={1000} rows={2} placeholder="확인한 내용이나 보류 이유" className={`${fieldClass} mt-1 h-auto resize-y py-2`} />
        </label>
        <button className={buttonClass("primary", "sm", "self-end")}>{busy ? "저장 중…" : "검수 기록 저장"}</button>
      </fieldset>
      {message && <p role={failed ? "alert" : "status"} className={`mt-2 text-[12px] ${failed ? "text-red-600 dark:text-red-400" : "text-zinc-500"}`}>{message}</p>}
    </form>
  );
}
