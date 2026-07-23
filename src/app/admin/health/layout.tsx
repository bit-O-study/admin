export const dynamic = "force-dynamic";

export default function HealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 사이트별 하위 네비게이션은 왼쪽 사이드바 트리로 통합됨(중복 탭 제거).
  return <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">{children}</div>;
}