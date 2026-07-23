/**
 * 날짜 유틸 — 순수 모듈(서버 의존성 없음 → 단위테스트 대상).
 * 한국(Asia/Seoul)은 DST 가 없어 항상 UTC+9 로 고정 계산한다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

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