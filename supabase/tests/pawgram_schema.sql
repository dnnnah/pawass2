-- Run after migrations in an isolated database, with ON_ERROR_STOP=1.
begin;
do $$ begin
  assert (select relrowsecurity from pg_class where oid = 'public.pawgram_profiles'::regclass), 'RLS profiles';
  assert not has_table_privilege('anon','public.pawgram_profiles','select'), 'No raw public profiles';
  assert not has_table_privilege('authenticated','public.pawgram_profiles','update'), 'Writes through checked functions';
  assert not has_table_privilege('authenticated','public.pawgram_admins','insert'), 'No self promotion';
  assert not has_table_privilege('anon','public.pawgram_paws','select'), 'No public reaction identities';
  assert not exists(select 1 from storage.buckets where id='pawgram-photos' and public), 'Private bucket';
end $$;
rollback;
