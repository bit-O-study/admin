import { NotConfigured } from "@/features/admin/components/not-configured";
import { isSiteConfigured } from "@/lib/supabase/admin-clients";
import { PageHeader } from "@/components/ui/kit";
import { ServiceIcon } from "@/features/admin/components/service-icon";
import { getLiquorList, getLiquorVisitSources } from "@/features/liquor/data";
import { VisitSources } from "@/features/liquor/components/visit-sources";
import { LiquorManager } from "@/features/liquor/components/liquor-manager";

export const dynamic = "force-dynamic";

const SITE = "liquor" as const;
const PAGE_SIZE = 30;

export default async function LiquorAdminPage() {
  const configured = isSiteConfigured(SITE);
  const [initial, sources] = configured
    ? await Promise.all([getLiquorList({ page: 1, pageSize: PAGE_SIZE }), getLiquorVisitSources(30)])
    : [null, null];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        icon={<ServiceIcon service="liquor" />}
        title="위스키"
        description="방문 유입 경로 · 상품 등록·수정 · 판매처별 가격 · 가격 이력"
      />

      {configured && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            방문자 유입 경로 <span className="font-normal text-zinc-400">(최근 30일)</span>
          </h2>
          <VisitSources sources={sources} />
        </section>
      )}

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