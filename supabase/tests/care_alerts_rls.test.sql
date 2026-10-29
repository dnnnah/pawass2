begin;
select plan(10);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.care_alerts'::regclass),
  'care alerts have row level security enabled'
);
select ok(not has_table_privilege('anon', 'public.care_alerts', 'select'), 'anon cannot select the private table');
select ok(has_table_privilege('authenticated', 'public.care_alerts', 'select'), 'tutors can read their own alerts through RLS');
select ok(has_table_privilege('authenticated', 'public.care_alerts', 'insert'), 'tutors can insert alerts through RLS');
select ok(has_table_privilege('authenticated', 'public.care_alerts', 'update'), 'tutors can update alerts through RLS');
select ok(has_table_privilege('authenticated', 'public.care_alerts', 'delete'), 'tutors can delete alerts through RLS');
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'care_alerts'),
  4,
  'every tutor operation has an ownership policy'
);
select ok(has_function_privilege('anon', 'public.get_public_care_alerts(text)', 'execute'), 'anon can read the intentionally public QR projection');
select ok((select prosecdef from pg_proc where oid = 'public.get_public_care_alerts(text)'::regprocedure), 'public projection runs with its restricted function owner');
select is(
  (select pg_get_function_result('public.get_public_care_alerts(text)'::regprocedure)),
  'TABLE(category text, label text, severity text, instructions text)',
  'public projection contains only the approved fields'
);

select * from finish();
rollback;
