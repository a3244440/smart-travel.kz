revoke all on public.applications, public.managers from anon;
revoke insert, truncate, references, trigger on public.applications from authenticated;
revoke insert, update, delete, truncate, references, trigger on public.managers from authenticated;
revoke all on function public.norm_phone(text) from public, anon, authenticated;
grant execute on function public.norm_phone(text) to postgres;
