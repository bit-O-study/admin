import { SegmentNav } from "@/features/admin/components/app-header";

export const dynamic = "force-dynamic";

export default function HealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2026-10-27: 탭 안에 화면이 여럿인 곳(요금제·고객센터·운영·설정)은 본문 위에 세그먼트를 그린다.
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <SegmentNav />
      {children}
    </div>
  );
}
