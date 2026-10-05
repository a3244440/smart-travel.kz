-- Заявки из Instagram-бота (n8n). Видят и меняют только менеджеры.
-- n8n пишет сюда через RPC submit_bot_lead по секретному токену (без service_role ключа).
create table public.bot_leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  channel text not null default 'instagram',
  user_id text not null default '',           -- ID собеседника в Instagram
  username text not null default '',
  name text not null default '',
  phone text not null default '',
  interest text not null default '',
  dates text not null default '',
  people text not null default '',
  city text not null default '',
  kind text not null default 'lead' check (kind in ('lead','manager')),  -- заявка или «позовите менеджера»
  last_message text not null default '',
  status text not null default 'new' check (status in ('new','done')),
  note text not null default ''
);
create index bot_leads_created_idx on public.bot_leads (created_at desc);
alter table public.bot_leads enable row level security;
revoke all on public.bot_leads from anon;
create policy "managers select bot_leads" on public.bot_leads for select to authenticated using ((select public.is_manager()));
create policy "managers update bot_leads" on public.bot_leads for update to authenticated using ((select public.is_manager())) with check ((select public.is_manager()));
create policy "managers delete bot_leads" on public.bot_leads for delete to authenticated using ((select public.is_manager()));

-- секреты интеграций: без политик — недоступны ни anon, ни authenticated
create table public.app_secrets (name text primary key, value text not null);
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;
insert into public.app_secrets (name, value) values ('bot_lead_token', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''));

create or replace function public.submit_bot_lead(p_token text, p_lead jsonb) returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_id bigint;
begin
  if p_token is null or p_token <> (select value from public.app_secrets where name = 'bot_lead_token') then
    raise exception 'forbidden';
  end if;
  if jsonb_typeof(p_lead) <> 'object' or pg_column_size(p_lead) > 8192 then raise exception 'invalid lead'; end if;
  insert into public.bot_leads (channel, user_id, username, name, phone, interest, dates, people, city, kind, last_message)
  values (
    coalesce(nullif(p_lead->>'channel', ''), 'instagram'),
    left(coalesce(p_lead->>'user_id', ''), 64), left(coalesce(p_lead->>'username', ''), 64),
    left(coalesce(p_lead->>'name', ''), 120), left(coalesce(p_lead->>'phone', ''), 40),
    left(coalesce(p_lead->>'interest', ''), 200), left(coalesce(p_lead->>'dates', ''), 120),
    left(coalesce(p_lead->>'people', ''), 60), left(coalesce(p_lead->>'city', ''), 60),
    case when p_lead->>'kind' = 'manager' then 'manager' else 'lead' end,
    left(coalesce(p_lead->>'last_message', ''), 1000)
  ) returning id into v_id;
  return v_id;
end $$;
revoke all on function public.submit_bot_lead(text, jsonb) from public;
grant execute on function public.submit_bot_lead(text, jsonb) to anon;
