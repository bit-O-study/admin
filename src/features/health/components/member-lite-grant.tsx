"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Gift, Loader2 } from "lucide-react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { grantLiteAction, revokeLiteAction } from "@/features/health/lite-grant-actions";

const MONTH_OPTIONS = [1, 3, 6, 12];

/**
 * 라이트(990원) 이용권 지급·회수 버튼.
 *
 * `granted` = 지금 이용 중인 것이 관리자 지급분인가. 결제 중인 회원(`paid`)에게는
 * 지급 버튼을 숨긴다 — 서버도 거절하지만, 눌러 보고 나서야 아는 것보다 낫다.
 * '요금제 지급' 화면(lite-grant-panel)에서 회원을 고른 뒤 쓴다.
 */
export function MemberLiteGrant({
  userId,
  granted,
  paid,
}: {
  userId: string;
  granted: boolean;
  paid: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [months, setMonths] = useState(1);
  const [ask, setAsk] = useState<"grant" | "revoke" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function run(kind: "grant" | "revoke") {
    setMsg(null);
    start(async () => {
      try {
        const res =
          kind === "grant"
            ? await grantLiteAction(userId, months)
            : await revokeLiteAction(userId);
        if (!res.ok) return setMsg({ ok: false, text: res.error });
        setMsg({
          ok: true,
          text:
            kind === "grant"
              ? `라이트 ${months}개월을 ${granted ? "연장" : "지급"}했습니다.`
              : "지급한 이용권을 회수했습니다.",
        });
        router.refresh();
      } catch {
        setMsg({ ok: false, text: "연결을 확인하고 다시 시도해 주세요." });
      }
    });
  }

  if (paid) return null;

  const btn =
    "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-semibold transition disabled:opacity-50";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1">
        <select
          aria-label="라이트 지급 기간"
          value={months}
          disabled={pending}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="h-7 rounded-md border border-zinc-300 bg-transparent px-1 text-xs dark:border-zinc-700"
        >
          {MONTH_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}개월
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={() => setAsk("grant")}
          className={`${btn} border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-400`}
        >
          {pending ? (
            <Loader2 aria-hidden="true" size={12} className="animate-spin" />
          ) : (
            <Gift aria-hidden="true" size={12} />
          )}
          {granted ? "라이트 연장" : "라이트 지급"}
        </button>
        {granted ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setAsk("revoke")}
            className={`${btn} border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800`}
          >
            지급 회수
          </button>
        ) : null}
      </div>

      {msg ? (
        <span
          role="status"
          className={`text-[11px] font-semibold ${msg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
        >
          {msg.text}
        </span>
      ) : null}

      <ConfirmDialog
        open={ask === "grant"}
        title={granted ? "라이트 연장" : "라이트 지급"}
        message={
          granted
            ? `이 회원의 라이트(월 990원) 이용 기간을 ${months}개월 더 늘릴까요? 결제 없이 적용됩니다.`
            : `이 회원에게 라이트(월 990원) 요금제를 ${months}개월 지급할까요? 결제 없이 바로 적용됩니다.`
        }
        confirmLabel={granted ? "연장" : "지급"}
        onConfirm={() => {
          setAsk(null);
          run("grant");
        }}
        onCancel={() => setAsk(null)}
      />
      <ConfirmDialog
        open={ask === "revoke"}
        title="지급 회수"
        message="지급한 라이트 이용권을 지금 끝낼까요? 회원은 바로 무료 이용으로 돌아갑니다."
        confirmLabel="회수"
        tone="danger"
        onConfirm={() => {
          setAsk(null);
          run("revoke");
        }}
        onCancel={() => setAsk(null)}
      />
    </div>
  );
}
