import { NotConfigured } from "@/features/admin/components/not-configured";
import {
  SITE_META,
  adminDb,
  isSiteConfigured,
} from "@/lib/supabase/admin-clients";

export const dynamic = "force-dynamic";

const SITE = "health" as const;

/** 예시 지표 — 헬스앱 profiles 테이블 회원수. service_role 이라 RLS 우회. */
async function loadStats() {
  const db = adminDb(SITE);
  const { count } = await db
    .from("profiles")
    .select("user_id", { count: "exact", head: true });
  return { members: count ?? 0 };
}

export default async function HealthAdminPage() {
  const meta = SITE_META[SITE];
  const configured = isSiteConfigured(SITE);
  const stats = configured ? await loadStats() : null;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">
          {meta.emoji} {meta.label}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">회원 · 신고 · 설정</p>
      </header>

      {configured ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">전체 회원</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {stats?.members.toLocaleString("ko-KR")}
            </p>
          </div>
        </div>
      ) : (
        <NotConfigured site={SITE} />
      )}
    </div>
  );
}