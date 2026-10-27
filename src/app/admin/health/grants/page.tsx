import { redirect } from "next/navigation";

import { isAdminUser } from "@/features/admin/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMembers, getMemberSubscriptions } from "@/features/health/data";
import { isVerificationUser } from "@/features/health/member-filter";
import { LiteGrantPanel } from "@/features/health/components/lite-grant-panel";
import { TrainerGrantForm } from "@/features/health/trainer/grant-form";
import { TeamGrantForm } from "@/features/health/billing/components/team-grant-form";
import { listTeamGrantCandidates } from "@/features/health/billing/team-store";
import { addMonthsYmd, seoulYmd } from "@/features/health/billing/team-plans";

export const dynamic = "force-dynamic";

const ymd = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(iso));

/**
 * 요금제 지급 — 결제·신청 없이 운영자가 직접 넣는 자리를 한곳에 모았다.
 * 승인·기간 변경·해지는 각 화면(트레이너 이용권 · 팀 요금제)에 그대로 있다.
 */
export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ verify?: string }>;
}) {
  if (!(await isAdminUser())) redirect("/admin");
  // ?verify=1 — 검증유저도 지급 대상에 넣는다(E2E 가 이 화면을 실제로 눌러 보는 용도).
  const showVerify = (await searchParams).verify === "1";
  const db = await createSupabaseServerClient();
  const [allMembers, subs, passes, teams] = await Promise.all([
    getMembers(),
    getMemberSubscriptions(),
    db.from("pt_passes").select("trainer_id"),
    listTeamGrantCandidates(),
  ]);
  const today = seoulYmd();
  // 탈퇴 회원·검증유저(E2E 임시 계정)는 지급 대상이 아니다.
  const members = allMembers.filter(
    (m) => !m.withdrawnAt && (showVerify || !isVerificationUser(m)),
  );

  const lite = subs
    ? members
        // 결제 중인 회원은 뺀다 — 구글 구독 행을 덮으면 갱신·환불 소식이 끊긴다.
        .filter((m) => {
          const sub = subs.get(m.userId);
          return !sub || sub.granted;
        })
        .map((m) => {
          const sub = subs.get(m.userId);
          return {
            userId: m.userId,
            name: m.name,
            email: m.email,
            grantedUntil: sub?.granted ? ymd(sub.expiresAt) : null,
          };
        })
    : null;

  const hasPass = new Set((passes.data ?? []).map((p) => p.trainer_id as string));
  const trainerCandidates = passes.error
    ? null
    : members
        .filter((m) => !hasPass.has(m.userId))
        .map((m) => ({ userId: m.userId, name: m.name, email: m.email, phone: m.phone }));

  const card = "app-card space-y-3 p-5";
  const failed = <p role="alert" className="text-sm">불러오지 못했어요. DB 설정과 권한을 확인해 주세요.</p>;

  return (
    <main className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-[28px] dark:text-zinc-50">요금제 지급</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          결제·신청 없이 바로 넣어요. 탈퇴 회원과 검증유저는 목록에 나오지 않아요.
        </p>
      </div>

      <section className={card}>
        <h2 className="font-semibold">라이트 (월 990원)</h2>
        <p className="text-xs text-zinc-500">
          결제 중인 회원은 목록에 없어요. 지급한 기간이 남아 있으면 그 뒤에 이어 붙습니다.
        </p>
        {lite ? <LiteGrantPanel members={lite} /> : failed}
      </section>

      <section className={card}>
        <h2 className="font-semibold">트레이너 이용권</h2>
        <p className="text-xs text-zinc-500">
          이용권 내역이 없는 회원만 나와요. 지급한 뒤 기간 변경·해지는 트레이너 이용권 메뉴에서 합니다.
        </p>
        {trainerCandidates ? (
          <TrainerGrantForm members={trainerCandidates} start={today} end={addMonthsYmd(today, 1)} />
        ) : (
          failed
        )}
      </section>

      <TeamGrantForm groups={teams} today={today} />
    </main>
  );
}
