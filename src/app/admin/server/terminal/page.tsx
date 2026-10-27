import { requireAdmin } from '@/features/admin/admin';
import { TerminalConsole } from '@/features/server/terminal-console';

/** 서버 › 터미널 (2026-10-27) — 운영 서버의 Claude Code·Codex·PowerShell. */
export default async function ServerTerminalPage() {
  await requireAdmin();
  return <TerminalConsole />;
}
