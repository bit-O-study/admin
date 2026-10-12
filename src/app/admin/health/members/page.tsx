import { getMembers, getMemberSubscriptions } from "@/features/health/data";
import { banStateOf, BAN_STATE_LABEL } from "@/features/health/ban";
import { MemberLiteGrant } from "@/features/health/components/member-lite-grant";
import { MemberBanControls } from "@/features/health/components/member-ban-controls";
import { MemberPasswordReset } from "@/features/health/components/member-password-reset";
import { RestoreMemberButton } from "@/features/health/components/restore-member-button";

export const dynamic = "force-dynamic";

function suspendedUntilLabel(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `~${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

const GENDER_LABEL: Record<string, string> = { male: "남", female: "여" };
/** 구독 상품 id → 화면 이름. 모르는 상품은 id 그대로 보여 준다. */
const PLAN_LABEL: Record<string, string> = {
  helssu_lite_monthly: "라이트",
  helssu_coach_monthly: "라이트",
  helssu_premium_monthly: "프리미엄",
};
const seoulYmd = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(iso));

const EXP_LABEL: Record<string, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
};

export default async function HealthMembersPage() {
  const [members, subs] = await Promise.all([
    getMembers(),
    getMemberSubscriptions(),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-zinc-950 dark:text-zinc-100">
        회원정보
      </h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        총 {members.length}명
      </p>

      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 p-6 text-center text-sm text-zinc-500">
          회원이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {members.map((m) => {
            const state = banStateOf({
              suspendedUntil: m.suspendedUntil,
              bannedAt: m.bannedAt,
            });
            const badge =
              state === "banned"
                ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                : state === "suspended"
                  ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500";
            const meta = [
              m.gender ? GENDER_LABEL[m.gender] ?? m.gender : null,
              m.experience ? EXP_LABEL[m.experience] ?? m.experience : null,
              m.heightCm ? `${m.heightCm}cm` : null,
              m.weightKg !== null ? `${m.weightKg}kg` : null,
              m.phone ?? null,
            ].filter(Boolean);
            const sub = subs?.get(m.userId) ?? null;
            return (
              <li
                key={m.userId}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-zinc-950 dark:text-zinc-100">
                      {m.name ?? "이름 미입력"}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {m.email ?? "-"}
                    </p>
                  </div>
                  <span className="flex shrink-0 flex-wrap items-center gap-1">
                    {sub ? (
                      <span className="whitespace-nowrap rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
                        {PLAN_LABEL[sub.productId] ?? sub.productId}
                        {sub.granted ? " 지급" : ""} ~{seoulYmd(sub.expiresAt)}
                      </span>
                    ) : null}
                    {m.withdrawnAt ? (
                      <span className="whitespace-nowrap rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                        탈퇴
                      </span>
                    ) : null}
                    <span
                      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${badge}`}
                    >
                      {BAN_STATE_LABEL[state]}
                      {state === "suspended" && m.suspendedUntil
                        ? ` ${suspendedUntilLabel(m.suspendedUntil)}`
                        : ""}
                    </span>
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {meta.join(" · ") || "정보 없음"} · 가입 {m.createdAt.slice(0, 10)}
                </p>
                {m.banReason ? (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    사유: {m.banReason}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-100 dark:border-zinc-700/60 pt-3">
                  <MemberBanControls userId={m.userId} state={state} />
                  <MemberPasswordReset userId={m.userId} email={m.email} />
                  {subs && !m.withdrawnAt ? (
                    <MemberLiteGrant
                      userId={m.userId}
                      granted={sub?.granted === true}
                      paid={sub !== null && !sub.granted}
                    />
                  ) : null}
                  {m.withdrawnAt ? (
                    <RestoreMemberButton userId={m.userId} />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}