-- Курсы валют обменного пункта MiG (mig.kz), обновляются по расписанию
create table public.rates (
  code text primary key,
  buy numeric not null,
  sell numeric not null,
  updated_at timestamptz not null default now()
);
alter table public.rates enable row level security;
create policy "rates are public" on public.rates for select to anon, authenticated using (true);
revoke insert, update, delete, truncate, references, trigger on public.rates from anon, authenticated;

create or replace function public.refresh_rates() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  html text; m text[]; n integer := 0;
begin
  perform extensions.http_set_curlopt('CURLOPT_TIMEOUT', '20');
  select content into html from extensions.http_get('http://mig.kz/') where status = 200;
  if html is null then return 0; end if;
  for m in select regexp_matches(html,
      '<td class="buy[^"]*">\s*([0-9.]+)\s*</td>\s*<td class="currency"[^>]*>\s*([A-Z]+)\s*</td>\s*<td class="sell[^"]*">\s*([0-9.]+)\s*</td>', 'g')
  loop
    insert into public.rates(code, buy, sell, updated_at) values (m[2], m[1]::numeric, m[3]::numeric, now())
    on conflict (code) do update set buy = excluded.buy, sell = excluded.sell, updated_at = excluded.updated_at;
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public.refresh_rates() from public, anon, authenticated;

select cron.schedule('refresh-mig-rates', '*/30 * * * *', 'select public.refresh_rates()');
select public.refresh_rates();
