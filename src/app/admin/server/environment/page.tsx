import { requireAdmin } from '@/features/admin/admin';
import { ServerDashboard } from '@/features/server/server-dashboard';

/** 서버 › 환경 (2026-10-27 BOadmin 2.0) — 운영체제·Node.js·CPU. */
export default async function ServerEnvironmentPage() {
  await requireAdmin();
  return <ServerDashboard view="environment" />;
}
