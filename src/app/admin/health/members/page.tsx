import { getMembers, getMemberSubscriptions, type MemberRow, type MemberSubscription } from "@/features/health/data";
import { banStateOf, BAN_STATE_LABEL, type BanState } from "@/features/health/ban";
import Link from "@/components/PendingLink";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { isVerificationUser } from "@/features/health/member-filter";
import { MEMBER_PAGE_SIZE, MEMBER_VIEWS, inView, matchesMember, paginate, parseMemberView } from "@/features/health/member-list";
import { MemberBanControls } from "@/features/health/components/member-ban-controls";
import { MemberPasswordReset } from "@/features/health/components/member-password-reset";
import { RestoreMemberButton } from "@/features/health/components/restore-member-button";
import { getReports } from "@/features/health/reports";
import { reportKindLabel } from "@/features/health/report";
import { getMemberTickets } from "@/features/health/support";
import { SUPPORT_STATUSES } from "@/features/health/support-model";
import { Badge, ButtonLink, ChipLink, EmptyState, PageHeader, buttonClass, fieldClass, type Tone } from "@/components/ui/kit";
import { PanelSection, SidePanel } from "@/components/ui/side-panel";

export const dynamic = "force-dynamic";

const GENDER_LABEL: Record<string, string> = { male: "남", female: "여" };
/** 구독 상품 id → 화면 이름. 모르는 상품은 id 그대로 보여 준다. */
const PLAN_LABEL: Record<string, string> = {
  helssu_lite_monthly: "라이트",
  helssu_coach_monthly: "라이트",
  helssu_premium_monthly: "프리미엄",
};
const EXP_LABEL: Record<string, string> = { beginner: "초급", intermediate: "중급", advanced: "고급" };
const seoulYmd = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(iso));
const daysAgo = (iso: string, now: Date) => Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000));

function stateOf(m: MemberRow, now: Date): { label: string; tone: Tone; ban: BanState } {
  const ban = banStateOf({ suspendedUntil: m.suspendedUntil, bannedAt: m.bannedAt }, now);
  if (m.withdrawnAt) return { label: "탈퇴", tone: "zinc", ban };
  if (ban === "banned") return { label: "영구 차단", tone: "red", ban };
  if (ban === "suspended") return { label: `정지 ~${seoulYmd(m.suspendedUntil as string).slice(5).replace("-", ".")}`, tone: "amber", ban };
  return { label: "이용 중", tone: "emerald", ban };
}
const planText = (s: MemberSubscription | null | undefined) =>
  s ? `${PLAN_LABEL[s.productId] ?? s.productId}${s.granted ? " (지급)" : ""}` : null;

/**
 * 헬쑤 › 회원 (2026-10-14 리뉴얼, 2026-10-27 BOadmin 2.0 표 + 상세 패널).
 * 줄을 누르면 ?member=<id> 로 오른쪽 패널이 열린다. 정지·비밀번호·복구는 패널로 모았다
 * (예전엔 줄마다 '관리'를 펼쳤다). 검색·칩·페이지를 바꿔도 나머지 조건은 그대로 둔다.
 */
export default async function HealthMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ verify?: string; q?: string; view?: string; page?: string; member?: string }>;
}) {
  const sp = await searchParams;
  const showVerify = sp.verify === "1";
  const q = (sp.q ?? "").slice(0, 100);
  const view = parseMemberView(sp.view);
  const [allMembers, subs] = await Promise.all([getMembers(), getMemberSubscriptions()]);
  // 검증유저(E2E 테스트가 만드는 임시 계정)는 기본으로 숨긴다 — 실제 회원 수를 흐린다.
  const verifyCount = allMembers.filter(isVerificationUser).length;
  const base = showVerify ? allMembers : allMembers.filter((m) => !isVerificationUser(m));
  const now = new Date();
  const hasPlan = (userId: string) => Boolean(subs?.get(userId));
  const searched = base.filter((m) => matchesMember(m, q));
  const counts = Object.fromEntries(
    MEMBER_VIEWS.map((v) => [v.value, searched.filter((m) => inView(m, v.value, hasPlan(m.userId), now)).length]),
  ) as Record<string, number>;
  const filtered = searched.filter((m) => inView(m, view, hasPlan(m.userId), now));
  const { rows: members, page, pages } = paginate(filtered, Number(sp.page ?? 1));
  // 패널은 지금 목록에 없는 회원도 연다(검색 결과에서 바로 들어온 경우).
  const selected = sp.member ? allMembers.find((m) => m.userId === sp.member) ?? null : null;

  const href = (over: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      q: q || undefined,
      view: view === "all" ? undefined : view,
      verify: showVerify ? "1" : undefined,
      page: page > 1 ? page : undefined,
      member: selected?.userId,
      ...over,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v === undefined || v === "" || (k === "page" && v === 1)) continue;
      params.set(k, String(v));
    }
    const qs = params.toString();
    return "/admin/health/members" + (qs ? `?${qs}` : "");
  };

  return (
    <div className={cn(selected && "lg:pr-[420px]")}>
      <PageHeader
        title="회원"
        description={
          <>
            헬쑤 · {base.length.toLocaleString("ko-KR")}명
            {verifyCount > 0 && (
              <>
                {" · "}
                <Link href={href({ verify: showVerify ? undefined : "1", page: undefined, member: undefined })} className="underline underline-offset-2">
                  {showVerify ? `검증유저 ${verifyCount}명 숨기기` : `검증유저 ${verifyCount}명 숨김 · 보기`}
                </Link>
              </>
            )}
          </>
        }
        actions={<ButtonLink href="/admin/health/grants" size="sm">요금제 지급</ButtonLink>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form action="/admin/health/members" className="flex gap-2 sm:w-96">
          {view !== "all" && <input type="hidden" name="view" value={view} />}
          {showVerify && <input type="hidden" name="verify" value="1" />}
          <input name="q" defaultValue={q} placeholder="이름·메일·전화 뒷자리" className={fieldClass} aria-label="회원 검색" />
          <button className={buttonClass("secondary")}>검색</button>
          {q && <Link href={href({ q: undefined, page: undefined, member: undefined })} className={buttonClass("ghost")}>지우기</Link>}
        </form>
        <div className="no-scrollbar flex gap-1 overflow-x-auto sm:ml-auto">
          {MEMBER_VIEWS.map((v) => (
            <ChipLink key={v.value} href={href({ view: v.value === "all" ? undefined : v.value, page: undefined, member: undefined })} active={view === v.value}>
              {v.label} <span className="text-zinc-400">{counts[v.value].toLocaleString("ko-KR")}</span>
            </ChipLink>
          ))}
        </div>
      </div>

      {members.length === 0 ? (
        <EmptyState
          title={q ? `“${q}”에 맞는 회원이 없어요` : "회원이 없습니다"}
          hint={q ? "이름 일부, 메일, 전화번호 뒷자리로도 찾을 수 있어요." : undefined}
          action={q ? <ButtonLink href={href({ q: undefined, page: undefined, member: undefined })} variant="secondary" size="sm">검색 지우기</ButtonLink> : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_120px_100px_20px] gap-4 border-b border-line bg-zinc-50 px-4 py-2.5 text-[12px] font-medium text-zinc-500 md:grid dark:bg-zinc-950">
            <span>회원</span>
            <span>요금제</span>
            <span>상태</span>
            <span>가입일</span>
            <span />
          </div>
          <ul>
            {members.map((m) => {
              const st = stateOf(m, now);
              const sub = subs?.get(m.userId) ?? null;
              const on = selected?.userId === m.userId;
              return (
                <li key={m.userId} className="border-b border-line last:border-0">
                  <Link
                    href={href({ member: m.userId })}
                    scroll={false}
                    aria-current={on ? "true" : undefined}
                    className={cn(
                      "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_120px_100px_20px]",
                      on ? "bg-zinc-100 dark:bg-zinc-900" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
                        {(m.name ?? m.email ?? "?").trim().slice(0, 1)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-medium">{m.name ?? "이름 미입력"}</span>
                        <span className="block truncate text-[12px] text-zinc-500">{m.email ?? "-"}</span>
                      </span>
                    </span>
                    <span className="hidden truncate text-[13px] md:block">
                      {sub ? <>{planText(sub)} <span className="text-zinc-500">~{seoulYmd(sub.expiresAt).slice(5)}</span></> : <span className="text-zinc-400">—</span>}
                    </span>
                    <span><Badge tone={st.tone}>{st.label}</Badge></span>
                    <span className="hidden font-mono text-[12px] text-zinc-500 md:block">{seoulYmd(m.createdAt)}</span>
                    <ChevronRight size={15} className="hidden text-zinc-400 md:block" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2 border-t border-line px-4 py-2.5 text-[12.5px] text-zinc-500">
            <span className="tabular-nums">
              {((page - 1) * MEMBER_PAGE_SIZE + 1).toLocaleString("ko-KR")}–{Math.min(page * MEMBER_PAGE_SIZE, filtered.length).toLocaleString("ko-KR")} / {filtered.length.toLocaleString("ko-KR")}명
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              {page > 1 && <Link href={href({ page: page - 1, member: undefined })} className={buttonClass("secondary", "sm")}>이전</Link>}
              <span className="px-1 font-medium tabular-nums text-zinc-700 dark:text-zinc-300">{page} / {pages}</span>
              {page < pages && <Link href={href({ page: page + 1, member: undefined })} className={buttonClass("secondary", "sm")}>다음</Link>}
            </span>
          </div>
        </div>
      )}

      {selected && <MemberPanel m={selected} sub={subs?.get(selected.userId) ?? null} closeHref={href({ member: undefined })} now={now} />}
    </div>
  );
}

async function MemberPanel({ m, sub, closeHref, now }: { m: MemberRow; sub: MemberSubscription | null; closeHref: string; now: Date }) {
  const [tickets, reports] = await Promise.all([getMemberTickets(m.userId), getReports(200).catch(() => null)]);
  const mine = reports?.filter((r) => r.targetUserId === m.userId) ?? null;
  const st = stateOf(m, now);
  const info: [string, string][] = [
    ["전화", m.phone ?? "—"],
    ["성별·경력", [m.gender ? GENDER_LABEL[m.gender] ?? m.gender : null, m.experience ? EXP_LABEL[m.experience] ?? m.experience : null].filter(Boolean).join(" · ") || "—"],
    ["신체", [m.heightCm ? `${m.heightCm}cm` : null, m.weightKg !== null ? `${m.weightKg}kg` : null].filter(Boolean).join(" · ") || "—"],
    ["가입", `${seoulYmd(m.createdAt)} (${daysAgo(m.createdAt, now)}일 전)`],
  ];

  return (
    <SidePanel title={`회원 상세: ${m.name ?? m.email ?? "이름 미입력"}`} closeHref={closeHref}>
      <div className="flex items-start gap-3 border-b border-line px-5 pt-5 pb-4 pr-14">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-[16px] font-medium">
          {(m.name ?? m.email ?? "?").trim().slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-semibold">{m.name ?? "이름 미입력"}</h2>
          <p className="truncate font-mono text-[12px] text-zinc-500">{m.email ?? "-"}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={st.tone}>{st.label}</Badge>
            {sub && <Badge tone="indigo">{planText(sub)}</Badge>}
          </div>
        </div>
      </div>

      <PanelSection title="기본 정보">
        <dl className="grid grid-cols-[84px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
          {info.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-zinc-500">{k}</dt>
              <dd className="min-w-0 truncate">{v}</dd>
            </div>
          ))}
        </dl>
      </PanelSection>

      <PanelSection title="요금제">
        {sub ? (
          <p className="text-[13px]">
            {planText(sub)} · ~{seoulYmd(sub.expiresAt)} <span className="text-zinc-500">({sub.granted ? "관리자 지급" : "결제"})</span>
          </p>
        ) : (
          <p className="text-[13px] text-zinc-500">이용 중인 요금제가 없어요.</p>
        )}
      </PanelSection>

      {(st.ban !== "active" || m.banReason) && (
        <PanelSection title="제재">
          <p className="text-[13px]">
            {BAN_STATE_LABEL[st.ban]}
            {st.ban === "suspended" && m.suspendedUntil ? ` · ${seoulYmd(m.suspendedUntil)}까지` : ""}
          </p>
          {m.banReason && <p className="mt-1 text-[13px] text-zinc-500">사유: {m.banReason}</p>}
        </PanelSection>
      )}

      <PanelSection title={`최근 문의${tickets ? ` ${tickets.length}건` : ""}`}>
        {tickets === null ? (
          <p className="text-[13px] text-zinc-500">문의를 불러오지 못했어요.</p>
        ) : tickets.length === 0 ? (
          <p className="text-[13px] text-zinc-500">문의가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/health/support/${t.id}`} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-zinc-100 dark:hover:bg-zinc-900">
                  <span className="font-mono text-[12px] text-zinc-500">#{t.number}</span>
                  <span className="min-w-0 flex-1 truncate">{t.title}</span>
                  <span className="text-[12px] text-zinc-500">{SUPPORT_STATUSES[t.status] ?? t.status}{!t.admin_read_at ? " · 미확인" : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PanelSection>

      <PanelSection title={`관련 신고${mine ? ` ${mine.length}건` : ""}`}>
        {mine === null ? (
          <p className="text-[13px] text-zinc-500">신고를 불러오지 못했어요.</p>
        ) : mine.length === 0 ? (
          <p className="text-[13px] text-zinc-500">이 회원이 쓴 글에 대한 신고가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-[13px]">
            {mine.slice(0, 5).map((r) => (
              <li key={r.id}>
                <Link href="/admin/health/reports" className="block rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                  <span className="text-zinc-500">{reportKindLabel(r.targetKind)} · {r.status === "open" ? "미처리" : "처리완료"}</span>
                  <span className="block truncate">{r.targetPreview || r.reason}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PanelSection>

      <PanelSection title="관리">
        <div className="flex flex-col gap-3">
          <MemberBanControls userId={m.userId} state={st.ban} />
          <MemberPasswordReset userId={m.userId} email={m.email} />
          {m.withdrawnAt ? <RestoreMemberButton userId={m.userId} /> : null}
          <ButtonLink href="/admin/health/grants" variant="secondary" size="sm" className="self-start">요금제 지급으로 이동</ButtonLink>
        </div>
      </PanelSection>
    </SidePanel>
  );
}
