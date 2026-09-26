"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import {
  manageSupportAction,
  readSupportAction,
  replySupportAction,
} from "@/features/health/support-actions";
import {
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
  type SupportTicket,
} from "@/features/health/support-model";

const field =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-600 dark:bg-zinc-900";
const button =
  "inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900";

/** 화면이 보이는 동안 60초마다 새로고침 + 수동 새로고침 버튼. */
export function SupportRefresh() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 60000);
    return () => clearInterval(id);
  }, [router]);
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="inline-flex items-center gap-1 text-sm text-zinc-600 underline dark:text-zinc-400"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      새로고침
    </button>
  );
}

export function SupportMarkRead({ id }: { id: string }) {
  useEffect(() => {
    void readSupportAction(id);
  }, [id]);
  return null;
}

export function SupportManageForm({ ticket }: { ticket: SupportTicket }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <form
      className="space-y-3"
      action={(form) =>
        start(async () => {
          const r = await manageSupportAction(
            ticket.id,
            String(form.get("status")),
            String(form.get("priority")),
            form.has("assign"),
          );
          setMessage(r.ok ? "변경했어요." : r.error);
          if (r.ok) router.refresh();
        })
      }
    >
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label>
          처리 상태
          <select name="status" defaultValue={ticket.status} className={field}>
            {Object.entries(SUPPORT_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          우선순위
          <select name="priority" defaultValue={ticket.priority} className={field}>
            {Object.entries(SUPPORT_PRIORITIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="assign" />
        내가 담당하기
      </label>
      <div className="flex items-center gap-3">
        <button disabled={pending} className={button}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          처리 정보 저장
        </button>
        <p role="status" className="text-sm">
          {message}
        </p>
      </div>
    </form>
  );
}

export function SupportReplyForm({ id }: { id: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  // 같은 내용 재전송(네트워크 재시도)은 같은 requestId → RPC 가 중복 저장을 막는다.
  const request = useRef("");
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          request.current ||= crypto.randomUUID();
          try {
            const r = await replySupportAction(id, request.current, body, internal);
            setMessage(r.ok ? "저장했어요." : r.error);
            if (r.ok) {
              setBody("");
              request.current = "";
              router.refresh();
            }
          } catch {
            setMessage("저장 결과를 확인하지 못했어요. 다시 시도해 주세요.");
          }
        });
      }}
    >
      <label className="block text-sm font-semibold">
        답변 작성
        <textarea
          className={field}
          rows={4}
          required
          maxLength={5000}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            request.current = "";
          }}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={internal}
          onChange={(e) => setInternal(e.target.checked)}
        />
        관리자 전용 메모 (회원에게 보이지 않음)
      </label>
      <div className="flex items-center gap-3">
        <button className={button} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {internal ? "내부 메모 저장" : "답변 보내기"}
        </button>
        <p role="status" className="text-sm">
          {message}
        </p>
      </div>
    </form>
  );
}
