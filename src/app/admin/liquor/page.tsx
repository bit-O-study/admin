import { NotConfigured } from "@/features/admin/components/not-configured";
import { isSiteConfigured } from "@/lib/supabase/admin-clients";
import { PageHeader } from "@/components/ui/kit";
import { getLiquorList } from "@/features/liquor/data";
import { LiquorManager } from "@/features/liquor/components/liquor-manager";

export const dynamic = "force-dynamic";

const SITE = "liquor" as const;
const PAGE_SIZE = 30;

export default async function LiquorAdminPage() {
  const configured = isSiteConfigured(SITE);
  // 2026-10-27: 방문 유입 경로 표는 위스키 › 유입 탭으로 옮겼다.
  const initial = configured ? await getLiquorList({ page: 1, pageSize: PAGE_SIZE }) : null;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHeader title="상품" description="상품 등록·수정 · 판매처별 가격 · 가격 이력" />
      {configured && initial ? (
        <LiquorManager
          initialRows={initial.rows}
          initialTotal={initial.total}
          pageSize={PAGE_SIZE}
        />
      ) : (
        <NotConfigured site={SITE} />
      )}
    </div>
  );
}
