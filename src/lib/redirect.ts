/**
 * 로그인 후 돌아갈 주소 검증 — 순수 모듈(단위 테스트 대상).
 *
 * `?redirect=` 는 누구나 링크에 넣을 수 있으므로 같은 사이트의 관리자 화면 경로만 받는다.
 *  - "/" 로 시작하는 상대 경로만(절대 URL·스킴·프로토콜 상대 "//", "/\\" 금지)
 *  - 제어 문자·역슬래시 금지(브라우저가 "/\evil.com" 을 "//evil.com" 으로 해석)
 *  - /admin 아래만 허용(로그인 화면·API 로 되돌아가는 루프 방지)
 * 통과하지 못하면 기본값 "/admin".
 */
export const DEFAULT_AFTER_LOGIN = "/admin";

export function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_AFTER_LOGIN;
  const value = raw.trim();
  if (!value || value.length > 2048) return DEFAULT_AFTER_LOGIN;
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_AFTER_LOGIN;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return DEFAULT_AFTER_LOGIN;
  let url: URL;
  try {
    url = new URL(value, "https://boadmin.invalid");
  } catch {
    return DEFAULT_AFTER_LOGIN;
  }
  if (url.origin !== "https://boadmin.invalid") return DEFAULT_AFTER_LOGIN;
  if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) return DEFAULT_AFTER_LOGIN;
  return `${url.pathname}${url.search}${url.hash}`;
}
