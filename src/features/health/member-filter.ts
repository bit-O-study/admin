/**
 * 검증유저 — 헬스앱 E2E 테스트가 라이브 DB 에 만드는 임시 계정. 순수 모듈.
 *
 * 테스트가 끝나면 지워지지만, 도는 중이거나 중간에 끊기면 남아서 회원 목록과 지급 대상에
 * 섞인다. 이메일이 `e2e_` 로 시작하거나(run-scope.ts 의 freshEmail) 이름이 '검증유저'
 * (account-fixture.ts)면 검증유저로 본다.
 */
const VERIFY_EMAIL_PREFIX = "e2e_";
const VERIFY_NAME = "검증유저";

export function isVerificationUser(m: { email: string | null; name: string | null }): boolean {
  return (
    (m.email ?? "").trim().toLowerCase().startsWith(VERIFY_EMAIL_PREFIX) ||
    (m.name ?? "").trim() === VERIFY_NAME
  );
}
