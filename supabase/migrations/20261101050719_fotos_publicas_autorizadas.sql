-- Only photos already authorized for a public rescue card or active search can
-- be signed by visitors. Health documents and obsolete photos remain private.
create function public.is_public_rescue_photo(p_bucket text, p_path text)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.pets p
    join public.public_code_reservations c on c.pet_id = p.id
    where p.privacy_accepted_at is not null
      and (
        (p_bucket = 'pet-photos' and p.primary_photo_path = p_path)
        or (p_bucket = 'lost-pet-photos' and exists (
          select 1 from public.lost_pet_reports r
          where r.pet_id = p.id and r.status = 'active' and r.recent_photo_path = p_path
        ))
      )
  );
$$;
revoke all on function public.is_public_rescue_photo(text, text) from public;
grant execute on function public.is_public_rescue_photo(text, text) to anon, authenticated;
create policy "Visitors read authorized rescue photos"
on storage.objects for select to anon, authenticated
using (bucket_id in ('pet-photos', 'lost-pet-photos') and public.is_public_rescue_photo(bucket_id, name));
