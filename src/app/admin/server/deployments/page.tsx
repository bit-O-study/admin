import { requireAdmin } from '@/features/admin/admin';
import { ServerDashboard } from '@/features/server/server-dashboard';

/** 서버 › 배포 (2026-10-27 BOadmin 2.0) — 프로젝트별 CI 결과와 서버 적용 버전. */
export default async function ServerDeploymentsPage() {
  await requireAdmin();
  return <ServerDashboard view="deployments" />;
}
