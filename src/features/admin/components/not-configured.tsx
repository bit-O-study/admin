import type { SiteKey } from "@/lib/supabase/admin-clients";

/** 사이트 service_role env 가 없을 때 보여주는 안내 패널. */
export function NotConfigured({ site }: { site: SiteKey }) {
  const upper = site.toUpperCase();
  return (
    <div className="rounded-xl border border-dashed border-amber-400 bg-amber-50 p-5 text-sm dark:border-amber-600/60 dark:bg-amber-950/30">
      <p className="font-bold text-amber-800 dark:text-amber-300">
        아직 연결되지 않았습니다
      </p>
      <p className="mt-1 text-amber-700 dark:text-amber-400/90">
        <code>.env.local</code> 에 아래 두 값을 채우면 이 사이트 데이터가 연결됩니다.
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-amber-100/70 p-3 text-xs text-amber-900 dark:bg-black/30 dark:text-amber-200">
        {`${upper}_SUPABASE_URL=...\n${upper}_SUPABASE_SERVICE_ROLE_KEY=...`}
      </pre>
    </div>
  );
}