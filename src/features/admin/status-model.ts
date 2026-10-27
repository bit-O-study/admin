/**
 * 서비스 상태 판정 (2026-10-27 BOadmin 2.0) — 순수 모듈.
 * 상태 화면과 위쪽 막대의 알약이 같은 판정을 쓴다. 기록 저장소가 없어서 '지금 상태'만 본다.
 */
import type { ScopeKey } from "@/features/admin/nav-model";

export type Level = "ok" | "warn" | "down" | "unknown";
export type StatusItem = { key: string; label: string; scope: ScopeKey; level: Level; detail: string; href: string };

export const LEVEL_LABEL: Record<Level, string> = { ok: "정상", warn: "주의", down: "장애", unknown: "확인 불가" };
/** 나쁜 순서. 확인 불가는 장애·주의보다 가볍게 본다(설정 안 한 서비스가 늘 빨갛게 뜨지 않도록). */
const RANK: Record<Level, number> = { down: 3, warn: 2, unknown: 1, ok: 0 };

export function worstLevel(items: readonly Pick<StatusItem, "level">[]): Level {
  return items.reduce<Level>((w, i) => (RANK[i.level] > RANK[w] ? i.level : w), "ok");
}

export function summarize(items: readonly StatusItem[]) {
  const count = (l: Level) => items.filter((i) => i.level === l).length;
  const counts = { ok: count("ok"), warn: count("warn"), down: count("down"), unknown: count("unknown") };
  const level = worstLevel(items);
  const label =
    level === "down" ? `장애 ${counts.down}건` :
    level === "warn" ? `${counts.warn}건 확인 필요` :
    level === "unknown" ? `${counts.unknown}건 확인 불가` :
    "모두 정상";
  return { level, counts, label };
}

/** DB·API 응답: 실패면 장애, 느리면(기본 1.5초 넘게) 주의. */
export function judgeLatency(ok: boolean, ms: number, slowMs = 1500): { level: Level; detail: string } {
  if (!ok) return { level: "down", detail: "조회 실패" };
  return ms > slowMs ? { level: "warn", detail: `느림 ${ms}ms` } : { level: "ok", detail: `응답 ${ms}ms` };
}

/** 크론 하나: 마지막 실행이 실패면 주의, 한 번도 안 돌았으면 주의. */
export function judgeCron(s: { lastRunAt: string | null; lastStatus: "ok" | "skipped" | "error" | null; lastFailure: { reason: string } | null }): { level: Level; detail: string } {
  if (!s.lastRunAt) return { level: "warn", detail: "실행 기록 없음" };
  if (s.lastStatus === "error") return { level: "warn", detail: `마지막 실행 실패${s.lastFailure ? ` · ${s.lastFailure.reason}` : ""}` };
  return { level: "ok", detail: s.lastStatus === "skipped" ? "마지막 실행 건너뜀" : "마지막 실행 정상" };
}

/** 앱 오류: 기간 안에 오류가 하나라도 있으면 주의. */
export function judgeAppErrors(errors: number, days: number): { level: Level; detail: string } {
  return errors > 0 ? { level: "warn", detail: `오류 ${errors}건 / ${days}일` } : { level: "ok", detail: `오류 없음 / ${days}일` };
}

type Project = {
  state: "running" | "stopped" | "unhealthy" | "not-deployed";
  desired: "on" | "off";
  sha: string | null;
  deployment?: { ci: { state: string } };
};
/**
 * 서버 앱 하나: 응답 없음은 장애, 켜 둬야 하는데 멈췄으면 장애, 일부러 꺼 둔 것은 정상,
 * 배포 전이면 확인 불가, CI 실패면 주의.
 */
export function judgeProject(p: Project): { level: Level; detail: string } {
  const ver = p.sha ? ` · ${p.sha.slice(0, 7)}` : "";
  if (p.state === "unhealthy") return { level: "down", detail: `응답 없음${ver}` };
  if (p.state === "not-deployed") return { level: "unknown", detail: "배포 전" };
  if (p.state === "stopped") return p.desired === "off" ? { level: "ok", detail: "꺼 둠" } : { level: "down", detail: `멈춤${ver}` };
  if (p.deployment?.ci.state === "failure") return { level: "warn", detail: `CI 실패${ver}` };
  return { level: "ok", detail: `실행 중${ver}` };
}

/** 상태 점·알약 색 — 상태 화면과 위쪽 막대가 같이 쓴다. */
export const LEVEL_DOT: Record<Level, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  down: "bg-red-500",
  unknown: "bg-zinc-400",
};
export const LEVEL_PILL: Record<Level, string> = {
  ok: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  warn: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  down: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  unknown: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
};
