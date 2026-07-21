import { HealthNav } from "@/features/health/health-nav";

export const dynamic = "force-dynamic";

export default function HealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <HealthNav />
      {children}
    </div>
  );
}