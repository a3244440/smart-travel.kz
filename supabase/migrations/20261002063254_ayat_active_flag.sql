-- 17:1 скрыт: в казахском переводе источника обрезан конец аята
alter table public.ayat add column active boolean not null default true;
update public.ayat set active = false where ref = '17:1';
