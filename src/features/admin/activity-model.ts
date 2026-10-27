/**
 * 활동 피드 (2026-10-27 BOadmin 2.0) — 순수 모듈.
 * 여러 출처(회원·문의·신고·크론·앱 오류·서버 배포)를 시간순 한 목록으로 합친다.
 * 따로 저장하지 않고 화면을 열 때마다 기존 데이터에서 만든다. 관리자가 누른 동작(정지·지급)은
 * 기록하는 곳이 없어 들어가지 않는다.
 */
import type { ScopeKey } from "@/features/admin/nav-model";

export type ActivityKind = "signup" | "withdraw" | "support" | "report" | "cron_fail" | "app_error" | "deploy" | "deploy_fail";
export type Activity = { id: string; kind: ActivityKind; at: string; title: string; detail?: string; scope: ScopeKey; href: string };

export const ACTIVITY_KIND_LABEL: Record<ActivityKind, string> = {
  signup: "가입",
  withdraw: "탈퇴",
  support: "문의",
  report: "신고",
  cron_fail: "크론 실패",
  app_error: "앱 오류",
  deploy: "배포",
  deploy_fail: "배포 실패",
};
/** 필터 칩 묶음 — 화면에서 고르는 단위. */
export const ACTIVITY_FILTERS: { key: string; label: string; kinds: ActivityKind[] }[] = [
  { key: "members", label: "회원", kinds: ["signup", "withdraw"] },
  { key: "support", label: "문의", kinds: ["support"] },
  { key: "reports", label: "신고", kinds: ["report"] },
  { key: "ops", label: "크론·오류", kinds: ["cron_fail", "app_error"] },
  { key: "deploys", label: "배포", kinds: ["deploy", "deploy_fail"] },
];

export type ActivitySources = {
  members?: { userId: string; name: string | null; createdAt: string; withdrawnAt: string | null }[];
  tickets?: { id: string; number: number; title: string; created_at: string }[];
  reports?: { id: string; reason: string; targetPreview: string | null; createdAt: string; status: "open" | "resolved" }[];
  cronRuns?: { name: string; label?: string; started_at: string; status: string; reason: string | null }[];
  appEvents?: { kind: string; severity: string; count: number; occurred_at: string }[];
  deploys?: { name: string; label: string; state: string; sha?: string | null; at?: string | null; ok: boolean }[];
};

const seoulDay = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(iso));
const inWindow = (iso: string | null | undefined, from: number, to: number) => {
  if (!iso) return false;
  const t = Date.parse(iso);
  return Number.isFinite(t) && t >= from && t <= to;
};

/**
 * 가입·탈퇴·앱 오류는 하루(한국 날짜) 단위로 묶는다 — 하루 수십 줄이 피드를 덮지 않게.
 * 묶인 줄의 시각은 그날 가장 최근 시각.
 */
function groupByDay<T>(rows: T[], at: (r: T) => string): { day: string; latest: string; rows: T[] }[] {
  const map = new Map<string, { day: string; latest: string; rows: T[] }>();
  for (const r of rows) {
    const day = seoulDay(at(r));
    const g = map.get(day) ?? { day, latest: at(r), rows: [] };
    g.rows.push(r);
    if (at(r) > g.latest) g.latest = at(r);
    map.set(day, g);
  }
  return [...map.values()];
}

export function buildActivity(src: ActivitySources, { now = new Date(), days = 7, limit = 200 }: { now?: Date; days?: number; limit?: number } = {}): Activity[] {
  const to = now.getTime();
  const from = to - days * 86_400_000;
  const out: Activity[] = [];

  const members = src.members ?? [];
  for (const g of groupByDay(members.filter((m) => inWindow(m.createdAt, from, to)), (m) => m.createdAt)) {
    const names = [...g.rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((m) => m.name || "이름 미입력");
    out.push({ id: `signup:${g.day}`, kind: "signup", at: g.latest, title: names.length > 1 ? `신규 가입 ${names[0]} 외 ${names.length - 1}명` : `신규 가입 ${names[0]}`, scope: "health", href: "/admin/health/members" });
  }
  for (const g of groupByDay(members.filter((m) => inWindow(m.withdrawnAt, from, to)), (m) => m.withdrawnAt as string)) {
    out.push({ id: `withdraw:${g.day}`, kind: "withdraw", at: g.latest, title: `탈퇴 ${g.rows.length}명`, scope: "health", href: "/admin/health/members?view=withdrawn" });
  }
  for (const t of src.tickets ?? []) {
    if (inWindow(t.created_at, from, to)) out.push({ id: `support:${t.id}`, kind: "support", at: t.created_at, title: `새 문의 #${t.number}`, detail: t.title, scope: "health", href: `/admin/health/support/${t.id}` });
  }
  for (const r of src.reports ?? []) {
    if (inWindow(r.createdAt, from, to)) out.push({ id: `report:${r.id}`, kind: "report", at: r.createdAt, title: `신고 접수${r.status === "resolved" ? " (처리완료)" : ""}`, detail: r.targetPreview?.trim() || r.reason, scope: "health", href: "/admin/health/reports" });
  }
  for (const c of src.cronRuns ?? []) {
    if (c.status === "error" && inWindow(c.started_at, from, to)) out.push({ id: `cron:${c.name}:${c.started_at}`, kind: "cron_fail", at: c.started_at, title: `크론 ${c.label ?? c.name} 실행 실패`, detail: c.reason ?? undefined, scope: "health", href: `/admin/health/crons?cron=${encodeURIComponent(c.name)}` });
  }
  const errors = (src.appEvents ?? []).filter((e) => e.severity === "error" && inWindow(e.occurred_at, from, to));
  for (const g of groupByDay(errors, (e) => e.occurred_at)) {
    const n = g.rows.reduce((s, e) => s + (e.count || 1), 0);
    out.push({ id: `apperr:${g.day}`, kind: "app_error", at: g.latest, title: `앱 오류 ${n}건`, detail: [...new Set(g.rows.map((e) => e.kind))].slice(0, 3).join(", "), scope: "health", href: "/admin/health/events?severity=error" });
  }
  for (const d of src.deploys ?? []) {
    if (inWindow(d.at, from, to)) out.push({ id: `deploy:${d.name}:${d.at}`, kind: d.ok ? "deploy" : "deploy_fail", at: d.at as string, title: `${d.label} ${d.ok ? "서버 배포 완료" : "배포 실패"}`, detail: d.sha ? d.sha.slice(0, 7) : d.state, scope: "server", href: "/admin/server/deployments" });
  }

  return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/** 화면 필터: 쉼표로 이은 필터 키(?type=members,support). 모르는 키는 무시, 비면 전부. */
export function filterActivity(items: Activity[], typeParam: string | undefined): Activity[] {
  const keys = (typeParam ?? "").split(",").filter(Boolean);
  const kinds = new Set(ACTIVITY_FILTERS.filter((f) => keys.includes(f.key)).flatMap((f) => f.kinds));
  return kinds.size ? items.filter((i) => kinds.has(i.kind)) : items;
}
