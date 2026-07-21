import { getActiveUsersSeries, getMembers } from "@/features/health/data";
import { HealthDashboard } from "@/features/health/components/health-dashboard";

export const dynamic = "force-dynamic";

export default async function HealthDashboardPage() {
  const [members, day, month, year] = await Promise.all([
    getMembers(),
    getActiveUsersSeries("day"),
    getActiveUsersSeries("month"),
    getActiveUsersSeries("year"),
  ]);

  const lite = members.map((m) => ({
    createdAt: m.createdAt,
    withdrawnAt: m.withdrawnAt,
  }));

  return <HealthDashboard members={lite} active={{ day, month, year }} />;
}