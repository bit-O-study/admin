import Link from "next/link";

import {
  SITE_META,
  isSiteConfigured,
  type SiteKey,
} from "@/lib/supabase/admin-clients";

export const dynamic = "force-dynamic";

const SITES: SiteKey[] = ["liquor", "iq", "health"];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">대시보드</h1>
        <p className="mt-1 text-sm text-zinc-500">
          세 사이트를 한 곳에서 관리합니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SITES.map((site) => {
          const meta = SITE_META[site];
          const configured = isSiteConfigured(site);
          return (
            <Link
              key={site}
              href={`/admin/${site}`}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{meta.emoji}</span>
                <span
                  className={
                    configured
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800"
                  }
                >
                  {configured ? "연결됨" : "미설정"}
                </span>
              </div>
              <p className="mt-3 font-bold">{meta.label}</p>
              <p className="mt-0.5 text-sm text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                관리 열기 →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}