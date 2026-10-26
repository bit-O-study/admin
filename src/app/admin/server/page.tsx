import { requireAdmin } from '@/features/admin/admin';
import { ServerDashboard } from '@/features/server/server-dashboard';

export default async function ServerPage() {
  await requireAdmin();
  return <ServerDashboard />;
}
