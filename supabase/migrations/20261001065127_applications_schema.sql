-- Менеджеры: только пользователи из этой таблицы видят и меняют заявки
create table public.managers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.managers enable row level security;

create or replace function public.is_manager() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.managers where user_id = (select auth.uid()));
$$;
revoke all on function public.is_manager() from public;
grant execute on function public.is_manager() to anon, authenticated;

create policy "managers read self" on public.managers
  for select to authenticated using (user_id = (select auth.uid()));

-- Заявки
create table public.applications (
  id text primary key,
  created timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','review','submitted','approved','fix')),
  note text not null default '',
  history jsonb not null default '[]'::jsonb,
  trip jsonb not null default '{}'::jsonb,
  travellers jsonb not null default '[]'::jsonb,
  phone_norm text not null default ''
);
create index applications_created_idx on public.applications (created desc);
alter table public.applications enable row level security;

create policy "managers select" on public.applications for select to authenticated using ((select public.is_manager()));
create policy "managers update" on public.applications for update to authenticated using ((select public.is_manager())) with check ((select public.is_manager()));
create policy "managers delete" on public.applications for delete to authenticated using ((select public.is_manager()));

-- История статусов ведётся в базе
create or replace function public.applications_history() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    new.history := coalesce(old.history, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('status', new.status, 'at', now()));
  end if;
  new.id := old.id; new.created := old.created; new.phone_norm := old.phone_norm;
  return new;
end $$;
create trigger applications_history before update on public.applications
  for each row execute function public.applications_history();

create or replace function public.norm_phone(p text) returns text
language sql immutable set search_path = '' as $$
  select right(regexp_replace(coalesce(p, ''), '\D', '', 'g'), 10);
$$;

-- Клиент: отправить заявку (без доступа к таблице напрямую)
create or replace function public.submit_application(p_trip jsonb, p_travellers jsonb)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_id text;
  v_phone text := public.norm_phone(p_trip->>'phone');
begin
  if jsonb_typeof(p_trip) <> 'object' or jsonb_typeof(p_travellers) <> 'array'
     or jsonb_array_length(p_travellers) not between 1 and 20 then
    raise exception 'invalid application';
  end if;
  if length(v_phone) < 10 then raise exception 'phone required'; end if;
  if pg_column_size(p_trip) + pg_column_size(p_travellers) > 65536 then raise exception 'too large'; end if;
  loop
    v_id := 'AST-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.applications where id = v_id);
  end loop;
  insert into public.applications (id, trip, travellers, phone_norm, history)
  values (v_id, p_trip, p_travellers, v_phone, jsonb_build_array(jsonb_build_object('status', 'new', 'at', now())));
  return v_id;
end $$;

-- Клиент: статус по номеру заявки + телефону (только нужные для кабинета поля)
create or replace function public.find_application(p_id text, p_phone text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', a.id, 'created', a.created, 'status', a.status, 'note', a.note, 'history', a.history,
    'trip', jsonb_build_object('arrival', a.trip->'arrival'),
    'travellers', coalesce((select jsonb_agg(jsonb_build_object('fields', jsonb_build_object(
        'given_names', t->'fields'->'given_names', 'surname', t->'fields'->'surname')))
      from jsonb_array_elements(a.travellers) t), '[]'::jsonb))
  from public.applications a
  where a.id = upper(trim(p_id))
    and length(public.norm_phone(p_phone)) >= 10
    and a.phone_norm = public.norm_phone(p_phone);
$$;

revoke all on function public.submit_application(jsonb, jsonb) from public;
revoke all on function public.find_application(text, text) from public;
grant execute on function public.submit_application(jsonb, jsonb) to anon, authenticated;
grant execute on function public.find_application(text, text) to anon, authenticated;
revoke all on function public.applications_history() from public, anon, authenticated;
