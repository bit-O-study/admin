'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Cpu, HardDrive, Power, RefreshCw, Server } from 'lucide-react';
import { useConfirm } from '@/components/use-confirm';
import type { ServerSnapshot } from './types';
import { DeploymentPanel } from './deployment-panel';

const names: Record<string, string> = { health_app: '헬쑤', admin: '관리 콘솔', trip: '여행', whisky_app: '위스키', accountBook: '가계부', MeetingMinutes: '메모 moa', ticket: '티켓', ast: 'AST' };
const states = { running: '실행 중', stopped: '중지됨', unhealthy: '응답 없음', 'not-deployed': '배포 전' };
const gb = (bytes: number) => `${(bytes / 1024 ** 3).toFixed(1)} GB`;
const panel = 'rounded-lg border border-line bg-surface';
/** 2026-10-27 BOadmin 2.0: 서버 탭(프로세스·배포·환경)마다 한 부분만 그린다. 'all' 은 예전처럼 한 화면 전부(검증 스크립트용). */
export type ServerView = 'all' | 'processes' | 'deployments' | 'environment';
const VIEW_TEXT: Record<ServerView, [string, string]> = {
  all: ['서버 관리', '운영 서버의 자원과 프로젝트 실행 상태를 한곳에서 확인하세요.'],
  processes: ['프로세스', '운영 서버 자원과 프로젝트별 실행·중지 · 5초마다 갱신'],
  deployments: ['배포', '프로젝트별 CI 결과와 서버에 적용된 버전'],
  environment: ['환경', '운영 서버의 운영체제·Node.js·CPU'],
};

export function ServerDashboard({ view = 'all' }: { view?: ServerView } = {}) {
  const show = (v: ServerView) => view === 'all' || view === v;
  const [data, setData] = useState<ServerSnapshot | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loading = useRef(false);
  const requestedControl = useRef<{ project: string; action: 'on' | 'off' } | null>(null);
  const [dialog, ask] = useConfirm();
  const refresh = useCallback(async () => {
    if (loading.current) return;
    loading.current = true; setRefreshing(true);
    try {
      const response = await fetch('/api/admin/server', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || '서버 상태 조회 실패');
      setData(result); setError('');
      const requested = requestedControl.current;
      if (requested) {
        const project = (result as ServerSnapshot).projects.find(item => item.name === requested.project);
        if (project && !project.pending) {
          if (project.controlError) {
            setNotice(project.controlError); requestedControl.current = null;
          } else if (project.desired === requested.action && project.state === (requested.action === 'on' ? 'running' : 'stopped')) {
            setNotice(`${names[project.name] || project.name} ${requested.action.toUpperCase()} 상태를 확인했습니다.`);
            requestedControl.current = null;
          }
        }
      }
    } catch (e) { setError(e instanceof Error ? e.message : '서버 상태를 불러오지 못했습니다.'); }
    finally { loading.current = false; setRefreshing(false); }
  }, []);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 5000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, [refresh]);

  async function control(project: ServerSnapshot['projects'][number], action: 'on' | 'off') {
    if (!(await ask({ title: `${names[project.name] || project.name} ${action === 'on' ? '시작' : '중지'}`, message: action === 'off' ? '프로젝트를 중지하면 이용자가 접속할 수 없습니다. 다시 ON으로 바꾸기 전까지 중지 상태를 유지합니다.' : '현재 배포된 버전으로 프로젝트를 시작합니다.', confirmLabel: action === 'on' ? '시작하기' : '중지하기', tone: action === 'off' ? 'danger' : 'default' }))) return;
    setBusy(project.name); setNotice('');
    try {
      const response = await fetch('/api/admin/server', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project: project.name, action }), signal: AbortSignal.timeout(10000) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || '프로세스 변경 실패');
      requestedControl.current = { project: project.name, action };
      setNotice(`${names[project.name] || project.name} ${action.toUpperCase()} 요청을 전달했습니다. 실제 상태를 확인하고 있습니다.`);
      await refresh();
    } catch (e) { setNotice(e instanceof Error ? e.message : '프로세스 변경 실패'); }
    finally { setBusy(null); }
  }
  const running = data?.projects.filter(p => p.state === 'running').length || 0;
  return <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
    {dialog}
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{VIEW_TEXT[view][0]}</h1><p className="mt-1 text-[13.5px] text-zinc-500">{VIEW_TEXT[view][1]}</p></div>
      <button onClick={() => void refresh()} disabled={refreshing} className="flex h-8 items-center gap-2 rounded-md border border-line bg-surface px-3 text-[13px] font-medium hover:bg-zinc-50 disabled:opacity-50 dark:hover:bg-zinc-900"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />새로고침</button>
    </header>
    {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}{data && ' 아래는 마지막으로 수신한 상태입니다. 연결이 복구되면 제어할 수 있습니다.'}</div>}
    {notice && <div role="status" className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">{notice}</div>}
    {data?.relay?.stale && <div role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">운영 서버 연결이 지연되고 있습니다. 마지막 수신 상태를 표시하며 연결이 복구될 때까지 제어할 수 없습니다.</div>}
    {!data ? <div className={`${panel} p-10 text-center text-sm text-zinc-500`}>{refreshing ? '운영 서버 상태를 확인하고 있습니다…' : '관리 에이전트 연결 후 서버 상태가 표시됩니다.'}</div> : <>
      {show('processes') && <><div className="grid gap-4 md:grid-cols-3">
        <section className={`${panel} p-5`}><div className="flex items-center gap-2 text-sm font-semibold text-zinc-500"><HardDrive size={17} />서버 메모리</div><div className="mt-4 flex items-baseline gap-2"><strong className="text-3xl tracking-tight">{data.memory.percent}%</strong><span className="text-xs text-zinc-500">사용 중</span></div><div role="progressbar" aria-label="서버 메모리 사용률" aria-valuenow={data.memory.percent} aria-valuemin={0} aria-valuemax={100} className="my-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className={`h-full rounded-full ${data.memory.percent >= 90 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${data.memory.percent}%` }} /></div><p className="text-xs text-zinc-500">{gb(data.memory.used)} / {gb(data.memory.total)} · 여유 {gb(data.memory.free)}</p></section>
        <section className={`${panel} p-5`}><div className="flex items-center gap-2 text-sm font-semibold text-zinc-500"><Activity size={17} />실행 중인 프로젝트</div><p className="mt-4 text-3xl font-semibold">{running}<span className="ml-2 text-base font-medium text-zinc-400">/ {data.projects.length}</span></p><p className="mt-5 text-xs text-zinc-500">각 프로젝트의 HTTP 응답으로 확인합니다.</p></section>
        <section className={`${panel} p-5`}><div className="flex items-center gap-2 text-sm font-semibold text-zinc-500"><Server size={17} />서버 가동 시간</div><p className="mt-4 text-3xl font-semibold">{Math.floor(data.environment.uptime / 86400)}<span className="ml-1 text-base font-medium text-zinc-400">일</span> {Math.floor(data.environment.uptime % 86400 / 3600)}<span className="ml-1 text-base font-medium text-zinc-400">시간</span></p><p className="mt-5 truncate text-xs text-zinc-500">{data.environment.hostname} · 운영 서버 기준</p></section>
      </div>
      <section className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 p-5 dark:border-zinc-800"><div><h2 className="font-bold">프로젝트 프로세스</h2><p className="mt-1 text-xs text-zinc-500">5초마다 갱신 · ON/OFF 요청 후 실제 응답을 확인합니다.</p></div><span className="text-xs text-zinc-400">{new Date(data.checkedAt).toLocaleTimeString('ko-KR')} 기준</span></div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{data.projects.map(project => <article key={project.name} className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3 p-5 sm:flex sm:flex-wrap sm:gap-4">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${project.state === 'running' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}><Server size={19} /></span>
          <div className="min-w-0 flex-1"><h3 className="text-sm font-bold">{names[project.name] || project.name}<span className="ml-2 text-xs font-normal text-zinc-400">:{project.port}</span></h3><p className="mt-1 text-xs text-zinc-500">{project.name} · {project.sha ? `버전 ${project.sha.slice(0, 7)}` : '배포된 버전 없음'}{project.pid ? ` · PID ${project.pid}` : ''}</p>{(project.controlReason || project.controlError) && <p className="mt-1 text-xs text-zinc-500">{project.controlError || project.controlReason}</p>}</div>
          <div className="col-span-2 flex items-center justify-between gap-3 sm:contents">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${project.pending ? 'bg-indigo-50 text-indigo-600' : project.state === 'running' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{project.pending ? `${project.desired.toUpperCase()} 요청 중` : states[project.state]}</span>
          <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">{(['on', 'off'] as const).map(action => <button key={action} aria-label={`${names[project.name] || project.name} ${action.toUpperCase()}`} onClick={() => void control(project, action)} disabled={Boolean(error) || !project.controllable || project.pending || busy !== null || (action === 'on' ? project.state === 'running' && project.desired === 'on' : project.state === 'stopped' && project.desired === 'off')} className="flex min-h-9 items-center gap-1 rounded-lg bg-white px-3 text-xs font-bold shadow-sm hover:text-indigo-600 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-zinc-400 disabled:shadow-none dark:bg-zinc-700"><Power size={12} />{action.toUpperCase()}</button>)}</div>
          </div>
        </article>)}</div>
      </section></>}
      {show('deployments') && <DeploymentPanel projects={data.projects} />}
      {show('environment') && <section className={`${panel} p-5`}><h2 className="mb-4 flex items-center gap-2 font-bold"><Cpu size={17} className="text-indigo-500" />서버 환경</h2><dl className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">{[['운영체제', `${data.environment.platform} ${data.environment.release}`], ['아키텍처', data.environment.architecture], ['Node.js', data.environment.node], ['CPU', `${data.environment.cpu} (${data.environment.cores} cores)`]].map(([label, value]) => <div key={label}><dt className="text-xs text-zinc-400">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>)}</dl></section>}
    </>}
  </main>;
}
