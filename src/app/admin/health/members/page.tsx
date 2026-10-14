import { getMembers, getMemberSubscriptions } from "@/features/health/data";
import { banStateOf, BAN_STATE_LABEL } from "@/features/health/ban";
import Link from "next/link";

import { isVerificationUser } from "@/features/health/member-filter";
import { MEMBER_PAGE_SIZE, MEMBER_VIEWS, inView, matchesMember, paginate, parseMemberView } from "@/features/health/member-list";
import { MemberBanControls } from "@/features/health/components/member-ban-controls";
import { MemberPasswordReset } from "@/features/health/components/member-password-reset";
import { RestoreMemberButton } from "@/features/health/components/restore-member-button";
import { Badge, ButtonLink, Card, ChipLink, EmptyState, PageHeader, buttonClass, fieldClass } from "@/components/ui/kit";

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

/**
 * 회원정보 (2026-10-14 리뉴얼) — 검색·상태 칩·페이지 나눔.
 * 예전엔 전체 회원을 카드로 한 번에 그렸다. 정지·비밀번호·복구 버튼은 행마다 '관리' 안으로 접었다.
 */
export default async function HealthMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ verify?: string; q?: string; view?: string; page?: string }>;
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

  // 검색·칩·페이지를 바꿔도 나머지 조건은 그대로 둔다.
  const href = (over: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      q: q || undefined,
      view: view === "all" ? undefined : view,
      verify: showVerify ? "1" : undefined,
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
    <div>
      <PageHeader
        title="회원정보"
        description={
          <>
            헬쑤 · {base.length.toLocaleString("ko-KR")}명
            {verifyCount > 0 && (
              <>
                {" · "}
                <Link href={href({ verify: showVerify ? undefined : "1", page: undefined })} className="underline underline-offset-2">
                  {showVerify ? `검증유저 ${verifyCount}명 숨기기` : `검증유저 ${verifyCount}명 숨김 · 보기`}
                </Link>
              </>
            )}
          </>
        }
        actions={<ButtonLink href="/admin/health/grants" size="sm">요금제 지급</ButtonLink>}
      />

      <div className="mb-4 flex flex-col gap-3">
        <form action="/admin/health/members" className="flex gap-2">
          {view !== "all" && <input type="hidden" name="view" value={view} />}
          {showVerify && <input type="hidden" name="verify" value="1" />}
          <input name="q" defaultValue={q} placeholder="이름·이메일·전화 검색" className={`${fieldClass} max-w-sm`} aria-label="회원 검색" />
          <button className={buttonClass("secondary")}>검색</button>
          {q && (
            <Link href={href({ q: undefined, page: undefined })} className={buttonClass("ghost")}>
              지우기
            </Link>
          )}
        </form>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {MEMBER_VIEWS.map((v) => (
            <ChipLink key={v.value} href={href({ view: v.value === "all" ? undefined : v.value, page: undefined })} active={view === v.value}>
              {v.label} <span className="tabular-nums opacity-70">{counts[v.value].toLocaleString("ko-KR")}</span>
            </ChipLink>
          ))}
        </div>
      </div>

      {members.length === 0 ? (
        <EmptyState
          title={q ? `“${q}” 에 맞는 회원이 없어요` : "회원이 없습니다"}
          hint={q ? "이름 일부, 이메일, 전화번호 뒷자리로도 찾을 수 있어요." : undefined}
        />
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {members.map((m) => {
              const state = banStateOf({ suspendedUntil: m.suspendedUntil, bannedAt: m.bannedAt });
              const meta = [
                m.gender ? GENDER_LABEL[m.gender] ?? m.gender : null,
                m.experience ? EXP_LABEL[m.experience] ?? m.experience : null,
                m.heightCm ? `${m.heightCm}cm` : null,
                m.weightKg !== null ? `${m.weightKg}kg` : null,
                m.phone ?? null,
              ].filter(Boolean);
              const sub = subs?.get(m.userId) ?? null;
              return (
                <li key={m.userId} className="px-4 py-3.5 sm:px-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-black text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                      {(m.name ?? m.email ?? "?").trim().slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate font-bold text-zinc-950 dark:text-zinc-50">{m.name ?? "이름 미입력"}</p>
                        {sub && (
                          <Badge tone="violet">
                            {PLAN_LABEL[sub.productId] ?? sub.productId}
                            {sub.granted ? " 지급" : ""} ~{seoulYmd(sub.expiresAt)}
                          </Badge>
                        )}
                        {m.withdrawnAt && <Badge>탈퇴</Badge>}
                        {state !== "active" && (
                          <Badge tone={state === "banned" ? "red" : "amber"}>
                            {BAN_STATE_LABEL[state]}
                            {state === "suspended" && m.suspendedUntil ? ` ${suspendedUntilLabel(m.suspendedUntil)}` : ""}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-zinc-500">{m.email ?? "-"}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {meta.join(" · ") || "정보 없음"} · 가입 {m.createdAt.slice(0, 10)}
                      </p>
                      {m.banReason && <p className="mt-1 text-xs text-red-600 dark:text-red-400">사유: {m.banReason}</p>}
                    </div>
                    {/* 관리 버튼은 접어 둔다 — 목록에서 정지·비밀번호 버튼이 줄마다 늘어서지 않게. */}
                    <details className="relative shrink-0">
                      <summary className={`${buttonClass("secondary", "sm")} list-none [&::-webkit-details-marker]:hidden`}>관리</summary>
                      <div className="absolute right-0 z-10 mt-2 flex w-72 max-w-[80vw] flex-col gap-2 rounded-2xl border border-zinc-200/70 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                        <MemberBanControls userId={m.userId} state={state} />
                        <MemberPasswordReset userId={m.userId} email={m.email} />
                        {m.withdrawnAt ? <RestoreMemberButton userId={m.userId} /> : null}
                      </div>
                    </details>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2 border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500 sm:px-5 dark:border-zinc-800">
            <span className="tabular-nums">
              {((page - 1) * MEMBER_PAGE_SIZE + 1).toLocaleString("ko-KR")}–
              {Math.min(page * MEMBER_PAGE_SIZE, filtered.length).toLocaleString("ko-KR")} / {filtered.length.toLocaleString("ko-KR")}명
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              {page > 1 && (
                <Link href={href({ page: page - 1 })} className={buttonClass("secondary", "sm")}>
                  이전
                </Link>
              )}
              <span className="px-1 font-bold tabular-nums">
                {page} / {pages}
              </span>
              {page < pages && (
                <Link href={href({ page: page + 1 })} className={buttonClass("secondary", "sm")}>
                  다음
                </Link>
              )}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
