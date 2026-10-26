const fs = require('node:fs');
const path = require('node:path');
const read = file => { try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; } };
const validSha = value => /^[a-f0-9]{40}$/.test(value || '') ? value : null;
function localDeployment(app) {
  const current = read(path.join(app.root, app.manifest || 'current.json'));
  const result = read(path.join(app.root, 'result.json'));
  const request = read(path.join(app.root, 'request.json'));
  const knownErrors = {
    'Invalid release SHA': '잘못된 배포 커밋 식별자',
    'Artifact identity mismatch': '배포 파일의 프로젝트 또는 커밋 불일치',
    'Application exited during startup': '시작 중 애플리케이션 종료',
    'Application health check failed': '시작 후 정상 응답 확인 실패',
    'Server runtime.env not configured': '서버 실행 환경 설정 누락',
    'Previous process did not stop': '이전 프로세스 종료 실패',
  };
  return { state: request && request.id !== result?.id ? 'pending' : result?.ok === false ? 'failure' : validSha(current?.sha) ? 'success' : 'unknown',
    sha: validSha(current?.sha), attemptedSha: validSha(result?.sha), deployedAt: current?.updatedAt || current?.deployedAt || null,
    reason: result?.ok === false ? knownErrors[result.error] || '서버 활성화 실패. 배포 실행 로그를 확인해 주세요.' : null };
}
function createDeploymentMonitor({ fetcher = fetch, now = Date.now } = {}) {
  const cache = new Map(), pending = new Set(), failures = new Map();
  const json = async url => {
    const response = await fetcher(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Bit-O-server-status' }, signal: AbortSignal.timeout(7000), redirect: 'error' });
    if (!response.ok) throw Error([403, 429].includes(response.status) ? 'GitHub 조회 한도 또는 접근 권한 때문에 확인할 수 없습니다.' : response.status === 404 ? '공개된 워크플로 실행 정보를 찾을 수 없습니다.' : 'GitHub 실행 정보를 가져오지 못했습니다.');
    return response.json();
  };
  async function refresh(app, key) {
    pending.add(key);
    try {
      const base = `https://api.github.com/repos/bit-O-study/${encodeURIComponent(app.name)}`;
      const response = await json(`${base}/actions/workflows/${encodeURIComponent(app.workflow || 'windows-server.yml')}/runs?per_page=1&branch=main`);
      const run = response.workflow_runs?.[0];
      if (!run) { cache.set(key, { expires: now() + 600000, value: { state: 'unknown', reason: '아직 실행 이력이 없습니다.', checkedAt: new Date(now()).toISOString() } }); return; }
      const state = run.status !== 'completed' ? 'in_progress' : run.conclusion === 'success' ? 'success' : run.conclusion === 'cancelled' ? 'cancelled' : 'failure';
      let stage = null, reason = null;
      if (state === 'failure') {
        let failed = failures.get(run.id);
        if (!failed) {
          const jobs = await json(`${base}/actions/runs/${Number(run.id)}/jobs?per_page=100`);
          const job = jobs.jobs?.find(job => job.conclusion === 'failure' || job.conclusion === 'timed_out');
          const step = job?.steps?.find(step => step.conclusion === 'failure' || step.conclusion === 'timed_out');
          failed = { stage: [job?.name, step?.name].filter(Boolean).join(' / ').slice(0, 200) || null,
            reason: job?.conclusion === 'timed_out' || step?.conclusion === 'timed_out' ? '해당 작업의 실행 시간이 초과되었습니다.' : step ? `실패한 단계: ${String(step.name).slice(0, 160)}. 상세 원인은 실행 로그에서 확인하세요.` : '워크플로 실행 실패. 상세 원인은 실행 로그에서 확인하세요.' };
          failures.set(run.id, failed);
          if (failures.size > 100) failures.delete(failures.keys().next().value);
        }
        ({ stage, reason } = failed);
      }
      cache.set(key, { expires: now() + 600000, value: { state, sha: validSha(run.head_sha), updatedAt: run.updated_at || null, checkedAt: new Date(now()).toISOString(), runUrl: `https://github.com/bit-O-study/${encodeURIComponent(app.name)}/actions/runs/${Number(run.id)}`, stage, reason } });
    } catch (error) {
      cache.set(key, { expires: now() + 600000, value: { ...cache.get(key)?.value, state: 'unavailable', reason: error instanceof Error ? error.message : 'GitHub 상태를 확인할 수 없습니다.', checkedAt: new Date(now()).toISOString() } });
    } finally { pending.delete(key); }
  }
  return app => {
    const key = app.name;
    const entry = cache.get(key);
    if ((!entry || entry.expires <= now()) && !pending.has(key)) void refresh(app, key);
    return { local: localDeployment(app), ci: entry?.value || { state: 'loading', reason: 'GitHub 실행 정보를 확인하고 있습니다.' } };
  };
}
module.exports = { createDeploymentMonitor, localDeployment };
