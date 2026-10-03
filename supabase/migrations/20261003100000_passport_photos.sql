-- Фото паспортов для ручной сверки менеджером.
-- Закрытое хранилище: клиент может только один раз загрузить фото к своей свежей заявке,
-- смотреть и удалять фото могут только менеджеры. Путь файла: <номер заявки>/<номер путешественника>.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('passports', 'passports', false, 8388608, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.can_upload_passport(p_name text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
  v_parts text[] := string_to_array(p_name, '/');
  v_idx int;
begin
  if array_length(v_parts, 1) <> 2 or v_parts[2] !~ '^[0-9]{1,2}\.jpg$' then return false; end if;
  v_idx := split_part(v_parts[2], '.', 1)::int;
  -- только к заявке, созданной в последний час, и только для существующего путешественника
  return exists (
    select 1 from public.applications a
    where a.id = v_parts[1]
      and a.created > now() - interval '1 hour'
      and v_idx < jsonb_array_length(a.travellers)
  );
end $$;
revoke all on function public.can_upload_passport(text) from public;
grant execute on function public.can_upload_passport(text) to anon, authenticated;

create policy "passports client upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'passports' and public.can_upload_passport(name));
create policy "passports managers read" on storage.objects for select to authenticated
  using (bucket_id = 'passports' and (select public.is_manager()));
create policy "passports managers delete" on storage.objects for delete to authenticated
  using (bucket_id = 'passports' and (select public.is_manager()));
