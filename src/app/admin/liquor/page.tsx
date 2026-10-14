import { NotConfigured } from "@/features/admin/components/not-configured";
import { SITE_META, isSiteConfigured } from "@/lib/supabase/admin-clients";
import { getLiquorList, getLiquorVisitSources } from "@/features/liquor/data";
import { VisitSources } from "@/features/liquor/components/visit-sources";
import { LiquorManager } from "@/features/liquor/components/liquor-manager";

export const dynamic = "force-dynamic";

const SITE = "liquor" as const;
const PAGE_SIZE = 30;

export default async function LiquorAdminPage() {
  const meta = SITE_META[SITE];
  const configured = isSiteConfigured(SITE);
  const [initial, sources] = configured
    ? await Promise.all([getLiquorList({ page: 1, pageSize: PAGE_SIZE }), getLiquorVisitSources(30)])
    : [null, null];

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">
          {meta.emoji} {meta.label}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          상품 등록/정보 수정 · 판매처별 가격 입력 · 목록/검색 · 상품/가격 삭제 · 가격 이력
        </p>
      </header>

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