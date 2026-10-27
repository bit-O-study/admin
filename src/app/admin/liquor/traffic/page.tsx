import { NotConfigured } from "@/features/admin/components/not-configured";
import { isSiteConfigured } from "@/lib/supabase/admin-clients";
import { PageHeader } from "@/components/ui/kit";
import { getLiquorVisitSources } from "@/features/liquor/data";
import { VisitSources } from "@/features/liquor/components/visit-sources";

export const dynamic = "force-dynamic";

/** 위스키 › 유입 (2026-10-27 BOadmin 2.0) — 상품 화면 위에 붙어 있던 유입 경로 표를 탭으로 나눴다. */
export default async function LiquorTrafficPage() {
  const configured = isSiteConfigured("liquor");
  const sources = configured ? await getLiquorVisitSources(30) : null;
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHeader title="유입" description="방문자가 어디서 들어왔는지 · 최근 30일" />
      {configured ? <VisitSources sources={sources} /> : <NotConfigured site="liquor" />}
    </div>
  );
}
