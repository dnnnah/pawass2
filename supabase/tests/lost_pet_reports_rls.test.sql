begin;
select plan(13);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.lost_pet_reports'::regclass),
  'lost reports have row level security enabled'
);
select ok(not has_table_privilege('anon', 'public.lost_pet_reports', 'select'), 'anon cannot select lost reports directly');
select ok(has_table_privilege('authenticated', 'public.lost_pet_reports', 'select'), 'owners can read their reports through RLS');
select ok(has_table_privilege('authenticated', 'public.lost_pet_reports', 'insert'), 'owners can create reports through RLS');
select ok(has_table_privilege('authenticated', 'public.lost_pet_reports', 'update'), 'owners can update reports through RLS');
select ok(has_table_privilege('authenticated', 'public.lost_pet_reports', 'delete'), 'owners can delete their reports through RLS');
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'lost_pet_reports'),
  4,
  'every tutor operation has an ownership policy'
);
select ok(
  exists(select 1 from pg_indexes where schemaname = 'public' and indexname = 'lost_pet_reports_one_active_per_pet_idx'),
  'a partial unique index limits each pet to one active episode'
);
select ok(has_function_privilege('anon', 'public.get_public_lost_pets(text,text)', 'execute'), 'anon can read the public active-alert board');
select ok(has_function_privilege('anon', 'public.get_public_lost_pet(text)', 'execute'), 'anon can read an active public alert');
select ok(has_function_privilege('anon', 'public.get_public_pet_rescue_status(text)', 'execute'), 'anon can read the limited QR status');
select is(
  (select pg_get_function_result('public.get_public_lost_pets(text,text)'::regprocedure)),
  'TABLE(public_code text, pet_name text, species public.pet_species, photo_path text, whatsapp_phone text, lost_at timestamp with time zone, last_seen_location text, last_seen_at timestamp with time zone, wearing text, message text, reward text)',
  'the board RPC returns only public rescue fields'
);
select is(
  (select pg_get_function_result('public.get_public_lost_pet(text)'::regprocedure)),
  'TABLE(public_code text, pet_name text, species public.pet_species, photo_path text, rescue_phone text, whatsapp_phone text, lost_at timestamp with time zone, last_seen_location text, last_seen_at timestamp with time zone, wearing text, message text, reward text, care_alerts jsonb)',
  'the detail RPC has an explicit public contract including only opted-in alerts'
);

select * from finish();
rollback;
