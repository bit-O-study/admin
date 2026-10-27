-- Run in HEALTH Supabase (2026-10-27 서버 터미널). 기존 server-control-relay.sql 과 같은 규칙:
-- 브라우저 역할(anon·authenticated)에는 아무 권한도 주지 않는다. 관리자 API(service_role)만 읽고 쓴다.
create table if not exists public.server_terminal_sessions (
  id uuid primary key default gen_random_uuid(),
  host_id text not null,
  kind text not null check (kind in ('claude','codex','shell')),
  actor text not null check (length(actor) between 1 and 254),
  state text not null default 'starting' check (state in ('starting','running','exited','closed','failed')),
  cols int not null default 120 check (cols between 20 and 400),
  rows int not null default 32 check (rows between 5 and 200),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz,
  exit_code int,
  message text
);
create index if not exists server_terminal_sessions_host on public.server_terminal_sessions(host_id, state, created_at desc);

-- 입출력 조각. i=입력(관리자 → 서버), o=출력(서버 → 관리자), r=크기 변경, k=종료 요청.
create table if not exists public.server_terminal_chunks (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.server_terminal_sessions(id) on delete cascade,
  kind char(1) not null check (kind in ('i','o','r','k')),
  data text not null check (length(data) <= 65536),
  actor text,
  created_at timestamptz not null default now()
);
create index if not exists server_terminal_chunks_read on public.server_terminal_chunks(session_id, kind, id);

-- 서버 터미널 에이전트 생존 신호(관리자 화면의 '연결됨' 표시).
create table if not exists public.server_terminal_agents (
  host_id text primary key,
  seen_at timestamptz not null default now(),
  info jsonb not null default '{}'::jsonb
);

alter table public.server_terminal_sessions enable row level security;
alter table public.server_terminal_chunks enable row level security;
alter table public.server_terminal_agents enable row level security;
revoke all on public.server_terminal_sessions, public.server_terminal_chunks, public.server_terminal_agents from public, anon, authenticated;
grant select, insert, update, delete on public.server_terminal_sessions, public.server_terminal_chunks, public.server_terminal_agents to service_role;
-- 감사 기록 보존: 입력 조각(kind='i')의 actor 가 누가 무엇을 쳤는지 남긴다. 운영 보존 기간에 맞춰
-- 끝난 세션만 지운다(running 세션은 지우지 않는다).
