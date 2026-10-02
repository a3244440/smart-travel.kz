-- Аят дня: тексты из api.alquran.cloud (арабский — quran-uthmani, ru.kuliev, en.sahih, kk.khalifahaltai)
create table public.ayat (
  ord int primary key,
  ref text not null unique,
  surah int not null,
  ar text not null, ru text not null, en text not null, kk text not null,
  excerpt boolean not null default false
);
alter table public.ayat enable row level security;
create policy "ayat are public" on public.ayat for select to anon, authenticated using (true);
revoke insert, update, delete, truncate, references, trigger on public.ayat from anon, authenticated;

select extensions.http_set_curlopt('CURLOPT_TIMEOUT','15');
insert into public.ayat (ord, ref, surah, ar, ru, en, kk)
select r.ord, r.ref, (d.j->0->'surah'->>'number')::int,
  regexp_replace(d.j->0->>'text', '^\s*بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s+', ''),
  trim(d.j->1->>'text'), trim(d.j->2->>'text'), trim(both E'\r\n ' from d.j->3->>'text')
from unnest(array['2:196','3:96','22:27','22:26','2:125','2:158','2:201','17:1','43:13','11:41','2:152','2:153','2:186','13:28','94:5','94:6','39:53','16:97','3:8','9:51','28:24']) with ordinality as r(ref, ord)
cross join lateral (select (content::jsonb)->'data' j from extensions.http_get('https://api.alquran.cloud/v1/ayah/'||r.ref||'/editions/quran-uthmani,ru.kuliev,en.sahih,kk.khalifahaltai')) d;

-- длинные аяты: только начало (первая фраза), как цитата
update public.ayat set excerpt = true,
  ru = split_part(ru, '. ', 1) || '.', en = split_part(en, '. ', 1) || '.', kk = split_part(kk, '. ', 1) || '.',
  ar = trim(split_part(ar, 'ۚ', 1))
where ref = '2:196';
update public.ayat set excerpt = true,
  ru = split_part(ru, '. ', 1) || '.', en = split_part(en, '. ', 1) || '.', kk = split_part(kk, '. ', 1) || '.',
  ar = trim(split_part(ar, 'وَٱتَّخِذُوا۟', 1))
where ref = '2:125';
