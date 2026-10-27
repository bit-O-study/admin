import { describe, expect, it } from 'vitest';
import { agentOnline, isLive, parseAfter, parseCreate, parseSend, stateText } from '@/features/server/terminal-model';

describe('server terminal model', () => {
  it('opens only the three fixed kinds and clamps the window size', () => {
    expect(parseCreate({ kind: 'claude', cols: 120, rows: 32 })).toEqual({ kind: 'claude', cols: 120, rows: 32 });
    expect(parseCreate({ kind: 'codex', cols: 9999, rows: 1 })).toEqual({ kind: 'codex', cols: 400, rows: 5 });
    expect(parseCreate({ kind: 'shell' })).toEqual({ kind: 'shell', cols: 120, rows: 32 });
    expect(parseCreate({ kind: 'cmd.exe' })).toBeNull();
    expect(parseCreate({ kind: 'claude --dangerously-skip-permissions' })).toBeNull();
    expect(parseCreate(null)).toBeNull();
  });
  it('accepts input, resize and close only; never output', () => {
    expect(parseSend({ type: 'input', data: 'ls\r' })).toEqual({ kind: 'i', data: 'ls\r' });
    expect(parseSend({ type: 'input', data: '' })).toBeNull();
    expect(parseSend({ type: 'input', data: 'x'.repeat(16_385) })).toBeNull();
    expect(parseSend({ type: 'resize', cols: 140, rows: 40 })).toEqual({ kind: 'r', data: '140x40' });
    expect(parseSend({ type: 'resize', cols: 10, rows: 40 })).toBeNull();
    expect(parseSend({ type: 'resize', cols: '140', rows: 40 })).toBeNull();
    expect(parseSend({ type: 'close' })).toEqual({ kind: 'k', data: '' });
    expect(parseSend({ type: 'output', data: 'fake' })).toBeNull();
  });
  it('reads the output cursor safely', () => {
    expect(parseAfter('42')).toBe(42);
    expect(parseAfter(null)).toBe(0);
    expect(parseAfter('-1')).toBe(0);
    expect(parseAfter('1e400')).toBe(0);
  });
  it('treats an agent heartbeat older than 15s as offline', () => {
    const now = Date.parse('2026-10-27T12:00:00Z');
    expect(agentOnline('2026-10-27T11:59:50Z', now)).toBe(true);
    expect(agentOnline('2026-10-27T11:59:40Z', now)).toBe(false);
    expect(agentOnline(null, now)).toBe(false);
  });
  it('describes session state', () => {
    expect(isLive({ state: 'starting' })).toBe(true);
    expect(isLive({ state: 'exited' })).toBe(false);
    expect(stateText({ state: 'exited', exit_code: 0, message: null })).toBe('끝남(코드 0)');
    expect(stateText({ state: 'closed', exit_code: null, message: '관리자가 세션을 닫았습니다.' })).toBe('관리자가 세션을 닫았습니다.');
  });
});
