import type { ServerSnapshot } from './types';

const states: Record<string, string> = { running: '제작 중', 'between-iterations': '다음 운동 준비 중', complete: '제작 완료', blocked: '확인 필요', failed: '작업 오류', stopped: '중지됨', interrupted: '작업 연결 끊김', 'prepared-awaiting-release': '제작 시작 대기', unknown: '작업 상태 확인 불가' };

export function VideoProductionPanel({ progress, stale }: { progress: ServerSnapshot['videoProduction']; stale: boolean }) {
  return <section className="rounded-lg border border-line bg-surface p-5">
    <h2 className="font-bold">운동 영상 제작</h2>
    {!progress?.available ? <p className="mt-3 text-sm text-zinc-500">서버의 영상 제작 현황을 아직 확인할 수 없습니다.</p> : <>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3"><strong className="text-3xl">{progress.percent.toFixed(1)}%</strong><span className="text-sm text-zinc-500">{stale ? '마지막 수신 상태' : states[progress.state] || states.unknown}</span></div>
      <div role="progressbar" aria-label="전체 운동 영상 제작 완료율" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} className="my-3 h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress.percent}%` }} /></div>
      <p className="text-sm">전체 {progress.total.toLocaleString('ko-KR')}종 중 검수 완료 {progress.reviewed.toLocaleString('ko-KR')}종 · 남은 {progress.remaining.toLocaleString('ko-KR')}종</p>
      <p className="mt-2 text-xs text-zinc-500">추가 제작 대상 {progress.batchTotal.toLocaleString('ko-KR')}종 중 {progress.batchCompleted.toLocaleString('ko-KR')}종 완료 · 5초마다 갱신</p>
      <p className="mt-2 text-xs text-zinc-500">운동별 검수 완료 기준입니다. 제작 완료 후 운영 반영은 별도로 진행됩니다.</p>
      {progress.updatedAt && <p className="mt-2 text-xs text-zinc-400">작업 상태 변경: {new Date(progress.updatedAt).toLocaleString('ko-KR')}</p>}
    </>}
  </section>;
}
