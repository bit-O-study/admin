export function Buffering({ overlay = false, label = "불러오는 중…" }: { overlay?: boolean; label?: string }) {
  return <div role="status" aria-live="polite" aria-atomic="true" className={`admin-buffering flex items-center justify-center ${overlay ? "pointer-events-none fixed inset-0 z-[100] bg-black/10" : "min-h-64 p-6"}`}>
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-7 py-6 text-sm font-semibold text-zinc-700 shadow-lg dark:bg-zinc-900 dark:text-zinc-200">
      <span aria-hidden="true" className="size-8 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600 motion-reduce:animate-none dark:border-indigo-950 dark:border-t-indigo-400" />
      {label}
    </div>
  </div>;
}
