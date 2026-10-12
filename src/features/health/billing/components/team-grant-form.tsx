"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Gift, Loader2 } from "lucide-react";

import { FilterSelect } from "@/components/filter-select";
import { grantTeamPlanAction } from "@/features/health/billing/team-actions";
import {
  TEAM_PLANS,
  TEAM_PLAN_META,
  addMonthsYmd,
  type TeamPlan,
} from "@/features/health/billing/team-plans";

export type TeamGrantCandidate = {
  groupId: string;
  name: string;
  ownerName: string;
  ownerEmail: string | null;
  members: number;
};

const field =
  "h-10 w-full rounded-xl border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-brand/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

/**
 * 신청 없이 지급 — 신청·입금 없이 그룹을 바로 이용 중으로 만든다.
 *
 * 금액은 받지 않는다(0원으로 저장) — 받은 돈이 없는데 "월 합계"에 잡히면 장부가 틀린다.
 * 나중에 유료로 바꾸면 팀 요금제 화면에서 금액을 넣는다.
 */
export function TeamGrantForm({
  groups,
  today,
}: {
  groups: TeamGrantCandidate[];
  today: string;
}) {
  const router = useRouter();
  const [group, setGroup] = useState("");
  const [plan, setPlan] = useState<TeamPlan>("trainer");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addMonthsYmd(today, 1));
  const [seats, setSeats] = useState("0");
  const [memo, setMemo] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, run] = useTransition();

  function grant() {
    if (pending || !group) return;
    setMsg(null);
    run(async () => {
      try {
        const res = await grantTeamPlanAction({
          groupId: group,
          plan,
          periodStart: start,
          periodEnd: end,
          seats: Number(seats) || 0,
          memo,
        });
        setMsg(res.ok ? "지급했어요. 기간 변경·해지는 팀 요금제 메뉴에서 할 수 있어요." : res.error);
        if (res.ok) {
          setGroup("");
          setMemo("");
          router.refresh();
        }
      } catch {
        setMsg("연결을 확인하고 다시 시도해 주세요.");
      }
    });
  }

  return (
    <section className="app-card p-5" data-testid="team-grant-form">
      <h2 className="font-semibold">팀 요금제 (트레이너·헬스장)</h2>
      <p className="mt-0.5 text-xs text-zinc-500">
        신청·입금 없이 바로 이용 중이 돼요(금액 0원). 그 그룹의 회원 전원이 프리미엄이 됩니다.
      </p>
      {groups.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          지급할 수 있는 그룹이 없어요. 이미 내역이 있는 그룹은 팀 요금제 메뉴에서 기간을 넣으세요.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <span className="mb-1 block text-xs font-bold text-zinc-500">그룹</span>
              <FilterSelect
                label="지급할 그룹"
                emptyLabel="그룹 선택"
                searchPlaceholder="그룹 이름·그룹장 이름·이메일로 찾기"
                value={group}
                onChange={setGroup}
                options={groups.map((g) => ({
                  value: g.groupId,
                  label: `${g.name} · ${g.ownerName}${g.ownerEmail ? `(${g.ownerEmail})` : ""} · ${g.members}명`,
                }))}
              />
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-zinc-500">요금제</span>
              <select
                aria-label="지급할 요금제"
                value={plan}
                onChange={(e) => setPlan(e.target.value as TeamPlan)}
                className={field}
              >
                {TEAM_PLANS.map((p) => (
                  <option key={p} value={p}>
                    {TEAM_PLAN_META[p].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-zinc-500">인원</span>
              <input
                aria-label="지급 인원"
                type="number"
                min={0}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className={field}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-zinc-500">시작</span>
              <input
                aria-label="지급 시작일"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={field}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-zinc-500">종료</span>
              <input
                aria-label="지급 종료일"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className={field}
              />
            </label>
          </div>
          <input
            aria-label="지급 메모"
            value={memo}
            maxLength={500}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="지급 사유 메모(체험·제휴 등)"
            className={`${field} mt-2 px-3`}
          />
          <button
            type="button"
            data-testid="team-grant"
            disabled={pending || !group}
            onClick={grant}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-brand text-sm font-bold text-white transition hover:bg-brand/90 disabled:opacity-50 dark:text-zinc-950"
          >
            {pending ? (
              <Loader2 aria-hidden="true" size={14} className="animate-spin" />
            ) : (
              <Gift aria-hidden="true" size={14} />
            )}
            팀 요금제 지급
          </button>
        </>
      )}
      {msg ? (
        <p role="status" className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
          {msg}
        </p>
      ) : null}
    </section>
  );
}
