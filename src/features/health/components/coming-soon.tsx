/** 헬스 admin 섹션 이식 진행 중 자리표시. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">{title}</h1>
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
        이 기능을 헬스앱에서 이식 중입니다. 곧 추가됩니다.
      </div>
    </div>
  );
}