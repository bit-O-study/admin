/**
 * 서비스별 고정 색·이름 (2026-10-14 리뉴얼). 사이드바 점, 대시보드 카드, 페이지 머리 아이콘이 같은 색을 쓴다.
 * 이름을 한 곳에서 정한다 — 예전엔 '헬쑤앱/헬스앱💪', '위스키/양주 가격조회🍶' 가 섞여 있었다.
 * 클래스 이름은 Tailwind 가 찾을 수 있게 글자 그대로 적는다.
 */
export type ServiceKey = "health" | "memo" | "iq" | "liquor";

export const SERVICES: Record<
  ServiceKey,
  { label: string; short: string; dot: string; square: string; text: string; stroke: string }
> = {
  health: { label: "헬쑤", short: "헬", dot: "bg-emerald-500", square: "bg-emerald-500 text-white", text: "text-emerald-600 dark:text-emerald-400", stroke: "#10b981" },
  memo: { label: "메모 moa", short: "m", dot: "bg-pink-500", square: "bg-pink-500 text-white", text: "text-pink-600 dark:text-pink-400", stroke: "#ec4899" },
  iq: { label: "아이큐", short: "IQ", dot: "bg-violet-500", square: "bg-violet-500 text-white", text: "text-violet-600 dark:text-violet-400", stroke: "#8b5cf6" },
  liquor: { label: "위스키", short: "W", dot: "bg-amber-500", square: "bg-amber-500 text-white", text: "text-amber-600 dark:text-amber-400", stroke: "#f59e0b" },
};

export const SERVICE_ORDER: ServiceKey[] = ["health", "memo", "iq", "liquor"];

/** 위쪽 서비스 전환·검색 결과의 점 색 (2026-10-27). 전체 서비스는 검정, 서버는 회색. */
export const SCOPE_DOT: Record<"all" | "health" | "memo" | "iq" | "liquor" | "server", string> = {
  all: "bg-zinc-950 dark:bg-zinc-50",
  health: "bg-emerald-500",
  memo: "bg-pink-500",
  iq: "bg-violet-500",
  liquor: "bg-amber-500",
  server: "bg-zinc-400",
};
