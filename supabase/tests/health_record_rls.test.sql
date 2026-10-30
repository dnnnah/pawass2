begin;
select plan(18);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.pet_health_records'::regclass),
  'health records have row level security enabled'
);
select ok(not has_table_privilege('anon', 'public.pet_health_records', 'select'), 'anon cannot select private health records');
select ok(has_table_privilege('authenticated', 'public.pet_health_records', 'select'), 'authenticated tutors can read health records through RLS');
select ok(has_table_privilege('authenticated', 'public.pet_health_records', 'insert'), 'authenticated tutors can attempt health record inserts through RLS');
select ok(has_table_privilege('authenticated', 'public.pet_health_records', 'update'), 'authenticated tutors can attempt health record updates through RLS');
select ok(has_table_privilege('authenticated', 'public.pet_health_records', 'delete'), 'authenticated tutors can attempt health record deletes through RLS');
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'pet_health_records'),
  4,
  'every health record operation has an owner policy'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.pet_health_documents'::regclass),
  'health documents have row level security enabled'
);
select ok(not has_table_privilege('anon', 'public.pet_health_documents', 'select'), 'anon cannot select private document metadata');
select ok(has_table_privilege('authenticated', 'public.pet_health_documents', 'insert'), 'authenticated tutors can attempt document metadata inserts through RLS');
select ok(has_table_privilege('authenticated', 'public.pet_health_documents', 'update'), 'authenticated tutors can attempt document metadata updates through RLS');
select ok(has_table_privilege('authenticated', 'public.pet_health_documents', 'delete'), 'authenticated tutors can attempt document metadata deletes through RLS');
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'pet_health_documents'),
  4,
  'every document metadata operation has an owner policy'
);
select ok(
  exists(select 1 from storage.buckets where id = 'pet-health-documents' and public = false and file_size_limit = 10485760),
  'health documents use a private ten MiB bucket'
);
select is(
  (select count(*)::integer from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'Tutors % health documents'),
  3,
  'Storage has separate select, insert, and delete policies for document objects'
);
select ok(
  exists(select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Tutors read their own health documents' and qual ilike '%pet_health_documents%'),
  'Storage reads require a document metadata row'
);

insert into public.pet_health_records (pet_id, record_type, catalog_id, label, administered_on, notes)
select pets.id, 'vaccination', 'other', 'Prueba de aislamiento fase 4', '2026-01-01', 'nota original'
from public.pets
join public.profiles on profiles.id = pets.owner_id
where profiles.first_name = 'Prueba'
order by pets.created_at
limit 1;

set local request.jwt.claim.sub = 'f1e6f676-238a-4f92-9391-ef34fb236c20';
set local role authenticated;
select is(
  (select count(*)::integer from public.pet_health_records where label = 'Prueba de aislamiento fase 4'),
  1,
  'the owner can read their private health record'
);
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000099';
select is(
  (select count(*)::integer from public.pet_health_records where label = 'Prueba de aislamiento fase 4'),
  0,
  'another authenticated user cannot read the health record'
);

reset role;
select * from finish();
rollback;
