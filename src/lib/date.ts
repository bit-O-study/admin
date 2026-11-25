/**
 * 날짜 유틸 — 순수 모듈(서버 의존성 없음 → 단위테스트 대상).
 * 한국(Asia/Seoul)은 DST 가 없어 항상 UTC+9 로 고정 계산한다.
 * 화면에 날짜·시각을 찍을 때는 서버(UTC)·브라우저 시간대와 상관없이 여기 함수로 KST 로 맞춘다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 주어진 시각(now) 기준, **한국시간 오늘 00:00** 에 해당하는 UTC ISO 문자열.
 * DB(created_at 등, UTC 저장)에서 "오늘(KST) 이후"를 `.gte(since)` 로 거를 때 쓴다.
 * now 를 주입받아 테스트 가능하게 한다.
 */
export function seoulDayStartUtcIso(now: Date): string {
  // now 를 한국 벽시계로 옮겨 연/월/일을 얻는다.
  const seoulWall = new Date(now.getTime() + KST_OFFSET_MS);
  const y = seoulWall.getUTCFullYear();
  const m = seoulWall.getUTCMonth();
  const d = seoulWall.getUTCDate();
  // 그 날 한국 00:00 = 해당 UTC 자정에서 9시간 뺀 순간.
  const utcMs = Date.UTC(y, m, d, 0, 0, 0) - KST_OFFSET_MS;
  return new Date(utcMs).toISOString();
}

function toDate(value: string | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 시각 → 한국 날짜 키 "YYYY-MM-DD". 잘못된 값이면 "". */
export function kstYmd(value: string | Date): string {
  const d = toDate(value);
  if (!d) return "";
  return new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** now 기준 한국 날짜로 `days` 일(오늘 포함) 키 목록, 오래된 날 → 오늘 순. */
export function kstRecentDayKeys(now: Date, days: number): string[] {
  const n = Math.max(1, Math.trunc(days));
  const today = Date.parse(`${kstYmd(now)}T00:00:00Z`);
  return Array.from({ length: n }, (_, i) =>
    new Date(today - (n - 1 - i) * DAY_MS).toISOString().slice(0, 10),
  );
}

/**
 * 한국 시간으로 화면 표기.
 *  - "date"     → 2026.10.23
 *  - "datetime" → 2026.10.23 14:05
 *  - "time"     → 14:05
 * 잘못된 값이면 "-".
 */
export function formatKst(
  value: string | Date | null | undefined,
  style: "date" | "datetime" | "time" = "datetime",
): string {
  if (value === null || value === undefined || value === "") return "-";
  const d = toDate(value);
  if (!d) return "-";
  const iso = new Date(d.getTime() + KST_OFFSET_MS).toISOString();
  const date = `${iso.slice(0, 4)}.${iso.slice(5, 7)}.${iso.slice(8, 10)}`;
  const time = iso.slice(11, 16);
  if (style === "date") return date;
  if (style === "time") return time;
  return `${date} ${time}`;
}
