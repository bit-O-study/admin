/**
 * DB·스토리지 오류 → 한국어 안내 — 순수 모듈(단위 테스트 대상).
 *
 * Supabase/PostgREST 오류 원문(영문, 테이블·제약 이름 포함)을 그대로 화면에 띄우지 않는다.
 * 우리 DB 함수가 `raise exception '한국어 안내'` 로 던진 문구(한글 포함)는 그대로 보여 준다.
 */
export type ErrorLike = { message?: string | null; code?: string | null } | string | null | undefined;

export const DEFAULT_ERROR = "처리하지 못했어요. 잠시 후 다시 시도해 주세요.";

const HANGUL = /[가-힣]/;

const BY_CODE: Record<string, string> = {
  "23505": "이미 등록되어 있어요.",
  "23503": "연결된 데이터가 있어 처리할 수 없어요.",
  "23502": "필수 값이 비어 있어요.",
  "23514": "입력 값이 허용 범위를 벗어났어요.",
  "22P02": "입력 형식이 올바르지 않아요.",
  "22007": "날짜 형식이 올바르지 않아요.",
  "22008": "날짜가 올바르지 않아요.",
  "42501": "권한이 없어요. 관리자 계정인지 확인해 주세요.",
  PGRST116: "대상을 찾지 못했어요.",
  PGRST202: "DB 함수가 아직 적용되지 않았어요. 관리자에게 문의해 주세요.",
  "42883": "DB 함수가 아직 적용되지 않았어요. 관리자에게 문의해 주세요.",
  "42P01": "DB 테이블이 아직 적용되지 않았어요. 관리자에게 문의해 주세요.",
};

const BY_TEXT: [RegExp, string][] = [
  [/forbidden|admin only|permission denied|not allowed|row-level security/i, BY_CODE["42501"]],
  [/user not found|not found/i, "대상을 찾지 못했어요."],
  [/password too short/i, "비밀번호가 너무 짧아요."],
  [/duplicate key/i, BY_CODE["23505"]],
  [/payload too large|body exceeded|too large|exceeded the maximum allowed size/i, "파일이 너무 커요."],
  [/fetch failed|network|timeout|timed out|ECONN/i, "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요."],
  [/mime type|invalid.*content.?type/i, "지원하지 않는 파일 형식이에요."],
];

export function koreanError(error: ErrorLike, fallback = DEFAULT_ERROR): string {
  if (!error) return fallback;
  const message = typeof error === "string" ? error : (error.message ?? "");
  const code = typeof error === "string" ? "" : (error.code ?? "");
  // DB 함수가 일부러 던진 한국어 안내는 그대로.
  if (message && HANGUL.test(message)) return message;
  if (code && BY_CODE[code]) return BY_CODE[code];
  for (const [re, text] of BY_TEXT) if (re.test(message)) return text;
  return fallback;
}
