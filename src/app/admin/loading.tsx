export default function Loading() {
  return <div role="status" aria-live="polite" className="space-y-5 p-6"><p className="flex items-center gap-2 text-sm font-semibold"><span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600 motion-reduce:animate-none" />화면을 불러오는 중…</p><div aria-hidden="true" className="grid gap-4 sm:grid-cols-2">{[0,1,2,3].map(i => <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800 motion-reduce:animate-none" />)}</div></div>;
}
