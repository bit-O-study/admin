import { NotConfigured } from "@/features/admin/components/not-configured";
import { SITE_META, isSiteConfigured } from "@/lib/supabase/admin-clients";

export const dynamic = "force-dynamic";

const SITE = "iq" as const;

export default function IqAdminPage() {
  const meta = SITE_META[SITE];

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">
          {meta.emoji} {meta.label}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">문제 · 사용자 관리</p>
      </header>

      {isSiteConfigured(SITE) ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          연결됨. 관리할 테이블(문제/사용자/결과 등)을 알려주시면 이 화면에 목록·수정
          UI를 붙입니다.
        </div>
      ) : (
        <NotConfigured site={SITE} />
      )}
    </div>
  );
}