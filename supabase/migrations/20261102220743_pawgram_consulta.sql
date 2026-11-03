create function pawgram_private.profile_projection(p public.pawgram_profiles) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('pet_id',p.pet_id,'name',p.name,'species',p.species,'presentation',p.presentation,'breed',p.breed,'sex',p.sex,'size',p.size,'photo_id',p.photo_id,
 'age',case when p.age_months is null then null else
   (select case when months>=12 then (months/12)::text || case when months/12=1 then ' año' else ' años' end else months::text || case when months=1 then ' mes' else ' meses' end end
    from (select p.age_months + greatest(0,extract(year from age(current_date,p.age_as_of))::integer*12+extract(month from age(current_date,p.age_as_of))::integer) as months) a) end);
$$;
create function public.pawgram_public_profile(p_pet uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select pawgram_private.profile_projection(p) from public.pawgram_profiles p where pet_id=p_pet and published and restriction_reason is null;
$$;
create function public.pawgram_feed(p_pet uuid default null,p_before timestamptz default null,p_before_id uuid default null,p_post uuid default null,p_limit integer default 12)
returns setof jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',s.id,'pet_id',s.pet_id,'name',p.name,'body',s.body,'alt',s.alt,'photo_id',s.photo_id,'created_at',s.created_at,
 'paw_count',(select count(*) from public.pawgram_paws a where a.post_id=s.id),
 'has_paw',exists(select 1 from public.pawgram_paws a where a.post_id=s.id and a.account_id=auth.uid()),'is_own',coalesce(s.owner_id=auth.uid(),false))
 from public.pawgram_posts s join public.pawgram_profiles p on p.pet_id=s.pet_id
 where p.published and p.restriction_reason is null and s.restriction_reason is null
 and (p_pet is null or s.pet_id=p_pet) and (p_post is null or s.id=p_post)
 and (p_before is null or (s.created_at,s.id)<(p_before,p_before_id))
 order by s.created_at desc,s.id desc limit greatest(1,least(p_limit,30));
$$;
create function public.pawgram_photo_path(p_asset uuid,p_private boolean default false) returns text
language sql stable security definer set search_path='' as $$
 select a.path from public.pawgram_assets a where a.id=p_asset and a.state='active'
 and (
  exists(select 1 from public.pawgram_profiles p where p.photo_id=a.id and (
    (not p_private and p.published and p.restriction_reason is null)
    or (p_private and auth.uid() is not null and (p.owner_id=auth.uid() or public.pawgram_is_admin()))))
  or exists(select 1 from public.pawgram_posts s join public.pawgram_profiles p on p.pet_id=s.pet_id where s.photo_id=a.id and (
    (not p_private and p.published and p.restriction_reason is null and s.restriction_reason is null)
    or (p_private and auth.uid() is not null and (s.owner_id=auth.uid() or public.pawgram_is_admin()))))
 );
$$;
revoke all on function public.pawgram_public_profile(uuid),public.pawgram_feed(uuid,timestamptz,uuid,uuid,integer),public.pawgram_photo_path(uuid,boolean) from public;
grant execute on function public.pawgram_public_profile(uuid),public.pawgram_feed(uuid,timestamptz,uuid,uuid,integer),public.pawgram_photo_path(uuid,boolean) to anon,authenticated;
