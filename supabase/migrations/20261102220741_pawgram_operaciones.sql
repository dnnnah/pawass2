create function public.pawgram_save_profile(p_pet uuid,p_snapshot jsonb,p_consent boolean,p_photo uuid)
returns void language plpgsql security definer set search_path='' as $$
declare pet public.pets; previous_photo uuid;
begin
 select * into pet from public.pets where id=p_pet and owner_id=auth.uid() for update;
 if not found then raise insufficient_privilege; end if;
 if p_consent is distinct from true then raise exception 'social_consent_required'; end if;
 if (p_snapshot->>'name') is distinct from pet.name or (p_snapshot->>'species') is distinct from pet.species::text then raise exception 'preview_outdated'; end if;
 select photo_id into previous_photo from public.pawgram_profiles where pet_id=p_pet for update;
 if p_photo is not null and p_photo is distinct from previous_photo then
   update public.pawgram_assets set state='active' where id=p_photo and pet_id=p_pet and owner_id=auth.uid() and state='pending';
   if not found then raise insufficient_privilege; end if;
 end if;
 insert into public.pawgram_profiles(pet_id,owner_id,name,species,presentation,breed,sex,size,age_months,age_as_of,photo_id,published,consent_at)
 values(p_pet,auth.uid(),pet.name,pet.species,p_snapshot->>'presentation',p_snapshot->>'breed',p_snapshot->>'sex',p_snapshot->>'size',(p_snapshot->>'age_months')::integer,(p_snapshot->>'age_as_of')::date,p_photo,true,now())
 on conflict(pet_id) do update set name=excluded.name,species=excluded.species,presentation=excluded.presentation,breed=excluded.breed,sex=excluded.sex,size=excluded.size,age_months=excluded.age_months,age_as_of=excluded.age_as_of,photo_id=excluded.photo_id,published=true,consent_at=now(),updated_at=now();
end $$;
create function public.pawgram_set_published(p_pet uuid,p_published boolean) returns void
language plpgsql security definer set search_path='' as $$
begin
 update public.pawgram_profiles set published=p_published,updated_at=now() where pet_id=p_pet and owner_id=auth.uid();
 if not found then raise insufficient_privilege; end if;
end $$;
create function public.pawgram_create_post(p_id uuid,p_pet uuid,p_photo uuid,p_body text,p_alt text) returns void
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.pawgram_profiles where pet_id=p_pet and owner_id=auth.uid() and published and restriction_reason is null for share;
 if not found then raise insufficient_privilege; end if;
 update public.pawgram_assets set state='active' where id=p_photo and pet_id=p_pet and owner_id=auth.uid() and state='pending';
 if not found then raise insufficient_privilege; end if;
 insert into public.pawgram_posts(id,pet_id,owner_id,photo_id,body,alt) values(p_id,p_pet,auth.uid(),p_photo,p_body,p_alt);
end $$;
create function public.pawgram_edit_post(p_id uuid,p_body text,p_alt text) returns void
language plpgsql security definer set search_path='' as $$
begin
 update public.pawgram_posts set body=p_body,alt=p_alt where id=p_id and owner_id=auth.uid();
 if not found then raise insufficient_privilege; end if;
end $$;
create function public.pawgram_delete_post(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 delete from public.pawgram_posts where id=p_id and owner_id=auth.uid();
 if not found then raise insufficient_privilege; end if;
end $$;
create function public.pawgram_set_paw(p_post uuid,p_present boolean) returns void
language plpgsql security definer set search_path='' as $$
declare profile_id uuid;
begin
 if auth.uid() is null then raise insufficient_privilege; end if;
 -- Same lock order as moderation: profile, then post. SHARE permits independent
 -- accounts to react concurrently while withdrawal must wait for the operation.
 select pet_id into profile_id from public.pawgram_posts where id=p_post;
 perform 1 from public.pawgram_profiles where pet_id=profile_id and published and restriction_reason is null for share;
 if not found and p_present then raise insufficient_privilege; end if;
 perform 1 from public.pawgram_posts where id=p_post and owner_id<>auth.uid() and restriction_reason is null for share;
 if not found and p_present then raise insufficient_privilege; end if;
 if p_present then
   insert into public.pawgram_paws(post_id,account_id) values(p_post,auth.uid()) on conflict do nothing;
 else delete from public.pawgram_paws where post_id=p_post and account_id=auth.uid(); end if;
end $$;
create function public.pawgram_moderate(p_kind text,p_id uuid,p_reason text) returns void
language plpgsql security definer set search_path='' as $$
declare profile_id uuid;
begin
 if not public.pawgram_is_admin() then raise insufficient_privilege; end if;
 if p_reason is not null and char_length(btrim(p_reason)) not between 1 and 1000 then raise exception 'reason_required'; end if;
 if p_kind='profile' then
   update public.pawgram_profiles set restriction_reason=p_reason,moderated_at=now(),moderated_by=auth.uid() where pet_id=p_id;
 elsif p_kind='post' then
   select pet_id into profile_id from public.pawgram_posts where id=p_id;
   perform 1 from public.pawgram_profiles where pet_id=profile_id for share;
   update public.pawgram_posts set restriction_reason=p_reason,moderated_at=now(),moderated_by=auth.uid() where id=p_id;
 else raise exception 'invalid_kind'; end if;
 if not found then raise exception 'not_found'; end if;
end $$;
-- Explicit grants: no default PUBLIC execution on privileged functions.
revoke all on function public.pawgram_save_profile(uuid,jsonb,boolean,uuid),public.pawgram_set_published(uuid,boolean),public.pawgram_create_post(uuid,uuid,uuid,text,text),public.pawgram_edit_post(uuid,text,text),public.pawgram_delete_post(uuid),public.pawgram_set_paw(uuid,boolean),public.pawgram_moderate(text,uuid,text) from public,anon;
grant execute on function public.pawgram_save_profile(uuid,jsonb,boolean,uuid),public.pawgram_set_published(uuid,boolean),public.pawgram_create_post(uuid,uuid,uuid,text,text),public.pawgram_edit_post(uuid,text,text),public.pawgram_delete_post(uuid),public.pawgram_set_paw(uuid,boolean),public.pawgram_moderate(text,uuid,text) to authenticated;
