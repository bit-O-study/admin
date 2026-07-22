import { NotConfigured } from "@/features/admin/components/not-configured";
import { SITE_META, isSiteConfigured } from "@/lib/supabase/admin-clients";
import { getLiquorList } from "@/features/liquor/data";
import { LiquorManager } from "@/features/liquor/components/liquor-manager";

export const dynamic = "force-dynamic";

const SITE = "liquor" as const;
const PAGE_SIZE = 30;

export default async function LiquorAdminPage() {
  const meta = SITE_META[SITE];
  const configured = isSiteConfigured(SITE);
  const initial = configured
    ? await getLiquorList({ page: 1, pageSize: PAGE_SIZE })
    : null;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">
          {meta.emoji} {meta.label}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          상품 정보 수정 · 목록/검색 조회 · 상품/가격 삭제 · 가격 이력 보기
        </p>
      </header>

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