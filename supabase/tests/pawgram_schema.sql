-- Run after migrations in an isolated database, with ON_ERROR_STOP=1.
begin;
select plan(6);
select ok((select relrowsecurity from pg_class where oid = 'public.pawgram_profiles'::regclass), 'RLS is enabled on Pawgram profiles');
select ok(not has_table_privilege('anon','public.pawgram_profiles','select'), 'Anonymous role cannot read raw profiles');
select ok(not has_table_privilege('authenticated','public.pawgram_profiles','update'), 'Profile writes go through checked functions');
select ok(not has_table_privilege('authenticated','public.pawgram_admins','insert'), 'Tutors cannot grant themselves admin access');
select ok(not has_table_privilege('anon','public.pawgram_paws','select'), 'Anonymous role cannot read reaction identities');
select ok(not exists(select 1 from storage.buckets where id='pawgram-photos' and public), 'Pawgram photos use a private bucket');
select * from finish();
rollback;
