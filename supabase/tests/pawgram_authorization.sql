-- Isolated integration test. Transactions roll back every fixture.
begin;
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001'),('10000000-0000-4000-8000-000000000002'),('10000000-0000-4000-8000-000000000003');
insert into public.pets(id,owner_id,name,species,privacy_accepted_at) values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Luna','gato',now());
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select public.pawgram_save_profile('20000000-0000-4000-8000-000000000001','{"name":"Luna","species":"gato"}',true,null);
do $$ begin assert (select count(*)=1 from public.pawgram_profiles), 'Owner reads profile'; end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin
  assert (select count(*)=0 from public.pawgram_profiles), 'Other tutor cannot read raw profile';
  begin
    perform public.pawgram_save_profile('20000000-0000-4000-8000-000000000001','{"name":"Luna","species":"gato"}',true,null);
    raise exception 'Expected owner rejection';
  exception when insufficient_privilege then null; end;
  begin
    perform public.pawgram_moderate('profile','20000000-0000-4000-8000-000000000001','Motivo');
    raise exception 'Expected admin rejection';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.pawgram_admins values('10000000-0000-4000-8000-000000000003');
insert into public.pawgram_assets(id,pet_id,owner_id,path) values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001.webp');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select public.pawgram_create_post('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Hola','Luna jugando');
do $$ begin
  begin perform public.pawgram_set_paw('40000000-0000-4000-8000-000000000001',true); raise exception 'Expected own paw rejection'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select public.pawgram_set_paw('40000000-0000-4000-8000-000000000001',true);
select public.pawgram_set_paw('40000000-0000-4000-8000-000000000001',true);
do $$ begin assert (select count(*)=1 from public.pawgram_paws), 'Idempotent own paw'; end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select public.pawgram_moderate('profile','20000000-0000-4000-8000-000000000001','Revisión de privacidad');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select public.pawgram_set_published('20000000-0000-4000-8000-000000000001',false);
select public.pawgram_set_published('20000000-0000-4000-8000-000000000001',true);
do $$ begin
 assert (select restriction_reason='Revisión de privacidad' from public.pawgram_profiles), 'Cannot evade restriction';
 assert public.pawgram_photo_path('30000000-0000-4000-8000-000000000001',false) is null, 'Revoked public image';
 assert public.pawgram_photo_path('30000000-0000-4000-8000-000000000001',true) is not null, 'Owner can still manage image';
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin
 begin perform public.pawgram_set_paw('40000000-0000-4000-8000-000000000001',true); raise exception 'Expected hidden paw rejection'; exception when insufficient_privilege then null; end;
 assert public.pawgram_photo_path('30000000-0000-4000-8000-000000000001',true) is null, 'Other tutor cannot read hidden image';
end $$;
reset role;
set local role anon;
do $$ begin
 assert public.pawgram_public_profile('20000000-0000-4000-8000-000000000001') is null, 'Hidden public projection';
 assert (select count(*)=0 from public.pawgram_feed()), 'Hidden feed';
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select public.pawgram_delete_post('40000000-0000-4000-8000-000000000001');
reset role;
do $$ begin
 assert (select state='retired' from public.pawgram_assets where id='30000000-0000-4000-8000-000000000001'), 'Durable cleanup after delete';
 assert (select count(*)=0 from public.pawgram_paws), 'Cascade paws';
 assert (select count(*)=1 from public.pets), 'Rescue untouched';
end $$;
rollback;
