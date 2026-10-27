-- Run in HEALTH Supabase. Never grant these objects to browser roles.
create table if not exists public.server_control_hosts (
  id text primary key, snapshot jsonb not null, received_at timestamptz not null default now()
);
create table if not exists public.server_control_commands (
  id uuid primary key default gen_random_uuid(), host_id text not null references public.server_control_hosts(id),
  project text not null, action text not null check(action in ('on','off')), actor text not null,
  state text not null default 'queued' check(state in ('queued','claimed','accepted','rejected','expired','uncertain')),
  created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '30 seconds',
  claimed_at timestamptz, finished_at timestamptz, worker_id uuid, message text
);
create unique index if not exists server_control_one_pending on public.server_control_commands(host_id,project) where state in ('queued','claimed');
alter table public.server_control_hosts enable row level security;
alter table public.server_control_commands enable row level security;
revoke all on public.server_control_hosts,public.server_control_commands from public,anon,authenticated;
grant select,insert,update,delete on public.server_control_hosts,public.server_control_commands to service_role;

create or replace function public.server_control_enqueue(p_host text,p_project text,p_action text,p_actor text)
returns uuid language plpgsql set search_path=public as $$
declare h server_control_hosts; p jsonb; result uuid;
begin
  select * into h from server_control_hosts where id=p_host for update;
  if not found or h.received_at < now()-interval '20 seconds' then raise exception 'Server status is stale'; end if;
  if p_action not in ('on','off') or length(p_actor) not between 1 and 254 or p_project='admin' then raise exception 'Invalid control request'; end if;
  select value into p from jsonb_array_elements(h.snapshot->'projects') where value->>'name'=p_project;
  if p is null or coalesce((p->>'controllable')::boolean,false)=false or coalesce((p->>'pending')::boolean,true) then raise exception 'Project is not controllable'; end if;
  update server_control_commands set state='expired',finished_at=now(),message='요청 유효 시간이 지났습니다. 다시 확인해 주세요.' where host_id=p_host and state='queued' and expires_at<now();
  update server_control_commands set state='uncertain',finished_at=now(),message='실행 결과를 확인하지 못했습니다. 현재 상태를 확인해 주세요.' where host_id=p_host and state='claimed' and claimed_at<now()-interval '2 minutes';
  if exists(select 1 from server_control_commands where host_id=p_host and project=p_project and (state in ('queued','claimed') or (state='accepted' and finished_at>=h.received_at))) then raise exception 'Control already pending'; end if;
  insert into server_control_commands(host_id,project,action,actor) values(p_host,p_project,p_action,p_actor) returning id into result;
  return result;
end $$;

create or replace function public.server_control_claim(p_host text,p_worker uuid)
returns setof public.server_control_commands language plpgsql set search_path=public as $$
begin
  update server_control_commands set state='expired',finished_at=now(),message='요청 유효 시간이 지났습니다. 다시 확인해 주세요.' where host_id=p_host and state='queued' and expires_at<now();
  update server_control_commands set state='uncertain',finished_at=now(),message='실행 결과를 확인하지 못했습니다. 현재 상태를 확인해 주세요.' where host_id=p_host and state='claimed' and claimed_at<now()-interval '2 minutes';
  return query update server_control_commands set state='claimed',worker_id=p_worker,claimed_at=now()
  where id=(select id from server_control_commands where host_id=p_host and state='queued' and expires_at>now() order by created_at for update skip locked limit 1) returning *;
end $$;

create or replace function public.server_control_publish(p_host text,p_snapshot jsonb)
returns void language sql set search_path=public as $$
  insert into server_control_hosts(id,snapshot,received_at) values(p_host,p_snapshot,now())
  on conflict(id) do update set snapshot=excluded.snapshot,received_at=excluded.received_at;
$$;
revoke all on function public.server_control_enqueue(text,text,text,text),public.server_control_claim(text,uuid),public.server_control_publish(text,jsonb) from public,anon,authenticated;
grant execute on function public.server_control_enqueue(text,text,text,text),public.server_control_claim(text,uuid),public.server_control_publish(text,jsonb) to service_role;
