import { beforeEach, expect, test, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ admin: vi.fn(), email: vi.fn(), members: vi.fn(), member: vi.fn(), db: vi.fn(), send: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('../src/features/admin/admin', () => ({ isAdminUser: mocks.admin, getCurrentAdminEmail: mocks.email }));
vi.mock('../src/features/health/data', () => ({ getMembers: mocks.members, getMemberById: mocks.member }));
vi.mock('../src/lib/supabase/server', () => ({ createSupabaseServerClient: mocks.db }));
vi.mock('../src/lib/email/send', () => ({ sendEmail: mocks.send }));
import { addAdminAction, removeAdminAction, resetMemberPasswordAction } from '../src/features/health/actions';

beforeEach(() => { vi.resetAllMocks(); mocks.admin.mockResolvedValue(true); mocks.email.mockResolvedValue('me@example.com'); });
test('관리자는 자신의 권한을 해제할 수 없다', async () => {
  expect(await removeAdminAction(' ME@example.com ')).toMatchObject({ ok: false });
  expect(mocks.db).not.toHaveBeenCalled();
});
test('회원 조회 실패 또는 미가입 이메일에는 관리자 권한을 주지 않는다', async () => {
  for (const members of [null, []]) {
    mocks.members.mockResolvedValue(members);
    expect(await addAdminAction('missing@example.com')).toMatchObject({ ok: false });
  }
  expect(mocks.db).not.toHaveBeenCalled();
});
test('일반 사용자는 회원 조회와 비밀번호 재설정에 접근할 수 없다', async () => {
  mocks.admin.mockResolvedValue(false);
  expect(await resetMemberPasswordAction('member-id')).toMatchObject({ ok: false });
  expect(mocks.member).not.toHaveBeenCalled();
  expect(mocks.db).not.toHaveBeenCalled();
});
test('관리자 계정은 회원 비밀번호 초기화에서 보호한다', async () => {
  mocks.member.mockResolvedValue({ email: 'another-admin@example.com' });
  const query = { select: () => query, eq: () => query, limit: async () => ({ data: [{ email: 'another-admin@example.com' }], error: null }) };
  const rpc = vi.fn();
  mocks.db.mockResolvedValue({ from: () => query, rpc });
  expect(await resetMemberPasswordAction('member-id')).toMatchObject({ ok: false });
  expect(rpc).not.toHaveBeenCalled();
  expect(mocks.send).not.toHaveBeenCalled();
});
