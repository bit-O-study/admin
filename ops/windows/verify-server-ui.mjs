// Isolated UI fixture: API requests are intercepted, so this cannot control real projects.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import tailwind from '@tailwindcss/postcss';

const require = createRequire(import.meta.url);
const { chromium } = require('../../../trip/node_modules/@playwright/test');
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = fs.mkdtempSync(path.join(appRoot, '.tmp-server-ui-'));
const shots = path.join(appRoot, 'logs/server-ui');
fs.mkdirSync(shots, { recursive: true });
fs.writeFileSync(path.join(fixture, 'index.html'), '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;background:#f8fafc;font-family:"Malgun Gothic",sans-serif;color:#18181b}</style></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
fs.writeFileSync(path.join(fixture, 'main.tsx'), `import {createRoot} from 'react-dom/client';import {ServerDashboard} from '@/features/server/server-dashboard';import '@/app/globals.css';createRoot(document.getElementById('root')!).render(<ServerDashboard/>);`);
const server = await createServer({ root: fixture, configFile: false, resolve: { alias: { '@': path.join(appRoot, 'src') } }, css: { postcss: { plugins: [tailwind({ base: appRoot })] } }, server: { host: '127.0.0.1', port: 0, fs: { allow: [appRoot] } } });
await server.listen();
let browser;
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const snapshot = {
    checkedAt: new Date().toISOString(), memory: { total: 16 * 1024 ** 3, free: 5.2 * 1024 ** 3, used: 10.8 * 1024 ** 3, percent: 68 },
    environment: { hostname: 'BITO-SERVER', platform: 'win32', release: '10.0.26100', architecture: 'x64', node: 'v22.20.0', cpu: 'Intel Core i5', cores: 12, uptime: 345600 },
    projects: ['health_app', 'admin', 'trip', 'whisky_app', 'accountBook', 'MeetingMinutes', 'ticket', 'ast'].map((name, i) => ({ name, port: i === 7 ? 8787 : 4100 + i, sha: 'a'.repeat(40), pid: 2000 + i, state: i === 2 ? 'stopped' : 'running', desired: i === 2 ? 'off' : 'on', pending: false, controlError: null, controllable: name !== 'admin', controlReason: name === 'admin' ? '관리 콘솔은 연결 유지를 위해 서버에서 직접 관리합니다.' : null }))
  };
  snapshot.projects[0].deployment = { local: { state: 'success', sha: 'a'.repeat(40), deployedAt: '2026-10-25T00:00:00Z' }, ci: { state: 'failure', sha: 'b'.repeat(40), updatedAt: '2026-10-26T00:00:00Z', checkedAt: new Date().toISOString(), stage: 'build / Test, build and package', reason: '실패한 단계: Test, build and package. 상세 원인은 실행 로그에서 확인하세요.', runUrl: 'https://github.com/bit-O-study/health_app/actions/runs/42' } };
  snapshot.projects[1].deployment = { local: { state: 'success', sha: 'a'.repeat(40) }, ci: { state: 'unavailable', reason: '공개된 워크플로 실행 정보를 찾을 수 없습니다.' } };
  let posts = 0, fail = false;
  await page.route('**/api/admin/server', async route => {
    if (fail) return route.fulfill({ status: 503, json: { error: '관리 에이전트 연결 테스트 오류' } });
    if (route.request().method() === 'POST') {
      posts++; const { project, action } = route.request().postDataJSON();
      const item = snapshot.projects.find(p => p.name === project);
      item.state = action === 'on' ? 'running' : 'stopped'; item.desired = action;
      return route.fulfill({ status: 202, json: { id: 'fixture-command' } });
    }
    return route.fulfill({ status: 200, json: snapshot });
  });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`);
  await page.getByText('68%', { exact: true }).waitFor();
  await page.getByText('CI/CD 실패', { exact: true }).waitFor();
  await page.getByText('CI/CD 확인 불가', { exact: true }).first().waitFor();
  assert.equal(await page.getByRole('link', { name: '실행 로그' }).getAttribute('href'), 'https://github.com/bit-O-study/health_app/actions/runs/42');
  assert.equal(await page.getByRole('button', { name: '관리 콘솔 OFF', exact: true }).isDisabled(), true);
  await page.screenshot({ path: path.join(shots, 'desktop.png'), fullPage: true });
  await page.getByRole('button', { name: '여행 ON', exact: true }).click();
  await page.getByRole('button', { name: '취소', exact: true }).click();
  assert.equal(posts, 0);
  await page.getByRole('button', { name: '여행 ON', exact: true }).click();
  await page.getByRole('button', { name: '시작하기', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'ON 상태를 확인했습니다' }).waitFor();
  assert.equal(posts, 1);
  await page.waitForFunction(() => document.querySelector('[aria-label="여행 ON"]')?.disabled === true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(shots, 'mobile.png'), fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.getByRole('button', { name: '메모 moa OFF', exact: true }).click();
  await page.screenshot({ path: path.join(shots, 'confirm-mobile.png') });
  await page.keyboard.press('Escape');
  assert.equal(posts, 1);
  fail = true;
  await page.getByRole('button', { name: '새로고침', exact: true }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByRole('button', { name: '메모 moa OFF', exact: true }).isDisabled(), true);
  assert.equal(await page.getByText('68%', { exact: true }).isVisible(), true);
  await page.setViewportSize({ width: 320, height: 740 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log('PASS server UI: desktop/mobile, ON cancel/confirm, state refresh, admin self-stop disabled, Escape, disconnect/stale state/control disabled, no overflow/errors.');
} finally {
  await browser?.close(); await server.close();
  // Delete only this run's generated fixture, after checking its workspace boundary.
  if (path.dirname(fixture) !== appRoot || !path.basename(fixture).startsWith('.tmp-server-ui-')) throw Error('Invalid fixture cleanup path');
  fs.rmSync(fixture, { recursive: true, force: true });
}
