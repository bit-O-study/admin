import { ExternalLink, GitBranch } from 'lucide-react';
import type { ServerSnapshot } from './types';

const labels: Record<string, string> = { success: '성공', failure: '실패', in_progress: '진행 중', pending: '대기 중', cancelled: '취소', loading: '조회 중', unavailable: '확인 불가', unknown: '기록 없음' };
const stamp = (value?: string | null) => value ? new Date(value).toLocaleString('ko-KR') : '기록 없음';
export function DeploymentPanel({ projects }: { projects: ServerSnapshot['projects'] }) {
  return <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <div className="border-b border-zinc-100 p-5 dark:border-zinc-800"><h2 className="flex items-center gap-2 font-bold"><GitBranch size={17} className="text-indigo-500" />배포 이력 · CI/CD</h2><p className="mt-1 text-xs text-zinc-500">GitHub 최신 실행 결과와 실제 서버 적용 상태를 함께 표시합니다. GitHub 정보는 최대 10분 간격으로 갱신합니다.</p></div>
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{projects.map(project => {
      const ci = project.deployment?.ci;
      const local = project.deployment?.local;
      const state = ci?.state || 'unavailable';
      const tone = state === 'success' ? 'bg-emerald-50 text-emerald-700' : state === 'failure' ? 'bg-red-50 text-red-700' : state === 'in_progress' ? 'bg-indigo-50 text-indigo-700' : 'bg-zinc-100 text-zinc-600';
      return <article key={project.name} className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold">{project.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>CI/CD {labels[state] || '확인 불가'}</span>{ci?.runUrl && <a className="ml-auto flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline" href={ci.runUrl} target="_blank" rel="noreferrer">실행 로그<ExternalLink size={12} /></a>}</div>
        <div className="grid gap-3 text-xs sm:grid-cols-2"><p className="text-zinc-500">최근 실행 <span className="font-medium text-zinc-700 dark:text-zinc-200">{stamp(ci?.updatedAt)}</span>{ci?.sha && <span className="ml-2 font-mono">{ci.sha.slice(0, 7)}</span>}</p><p className="text-zinc-500">서버 적용 <span className="font-medium text-zinc-700 dark:text-zinc-200">{labels[local?.state || 'unknown']} · {stamp(local?.deployedAt)}</span>{local?.sha && <span className="ml-2 font-mono">{local.sha.slice(0, 7)}</span>}</p></div>
        {ci?.stage && <p className="break-words text-xs font-semibold text-red-700">실패 단계: {ci.stage}</p>}
        {(ci?.reason || local?.reason) && <div className={`space-y-1 rounded-xl p-3 text-xs ${state === 'failure' || local?.state === 'failure' ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200' : 'bg-zinc-50 text-zinc-500 dark:bg-zinc-800'}`}>{ci?.reason && <p>{ci.reason}</p>}{local?.reason && <p>서버 활성화: {local.reason}{local.attemptedSha ? ` (${local.attemptedSha.slice(0, 7)})` : ''}</p>}</div>}
        {!ci && <p className="text-xs text-zinc-500">배포 상태 수집 연결을 확인해 주세요.</p>}
        {ci?.checkedAt && <p className="text-[11px] text-zinc-400">GitHub 확인 {stamp(ci.checkedAt)}</p>}
      </article>;
    })}</div>
  </section>;
}
