import { PageHeader } from "@/components/ui/kit";
import { getAdmins } from "@/features/health/data";
import { AdminSettingsManager } from "@/features/health/components/admin-settings-manager";

export const dynamic = "force-dynamic";

/**
 * 전체 서비스 › 관리자 (2026-10-27 BOadmin 2.0).
 * 관리자 계정은 헬쑤만의 것이 아니라 콘솔 전체의 출입 권한이라, 헬쑤 › 설정에서 위로 올렸다.
 * (계정 저장소는 지금처럼 헬쑤 Supabase 의 admins 테이블.)
 */
export default async function AdminsPage() {
  const admins = await getAdmins();
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="관리자"
        description="이 콘솔에 들어올 수 있는 계정입니다. 관리자로 지정된 계정은 헬쑤 앱 대신 이 콘솔로 이동합니다."
      />
      <AdminSettingsManager admins={admins} />
    </div>
  );
}
