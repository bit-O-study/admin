"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { buttonClass } from "@/components/ui/kit";
import { restoreUserAction } from "@/features/health/actions";

/**
 * 탈퇴 회원 복구 버튼 — withdrawn_at 을 null 로 되돌린다.
 * 2026-10-27: 다른 관리 동작처럼 확인 대화상자를 거친다(예전엔 누르면 바로 복구).
 */
export function RestoreMemberButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [ask, setAsk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function restore() {
    setError(null);
    start(async () => {
      const res = await restoreUserAction(userId);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div>
      <button type="button" onClick={() => setAsk(true)} disabled={pending} className={buttonClass("secondary", "sm")}>
        {pending ? <Loader2 aria-hidden="true" className="animate-spin" size={13} /> : <RotateCcw aria-hidden="true" size={13} />}
        탈퇴 복구
      </button>
      {error ? <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{error}</p> : null}
      <ConfirmDialog
        open={ask}
        title="탈퇴 복구"
        message="이 회원의 탈퇴를 되돌려 다시 앱을 쓸 수 있게 할까요?"
        confirmLabel="복구"
        onConfirm={() => {
          setAsk(false);
          restore();
        }}
        onCancel={() => setAsk(false)}
      />
    </div>
  );
}
