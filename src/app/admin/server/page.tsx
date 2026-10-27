import { requireAdmin } from '@/features/admin/admin';
import { ServerDashboard } from '@/features/server/server-dashboard';

/** 서버 › 프로세스 (2026-10-27 BOadmin 2.0: 배포·환경은 탭으로 나눴다). */
export default async function ServerPage() {
  await requireAdmin();
  return <ServerDashboard view="processes" />;
}
