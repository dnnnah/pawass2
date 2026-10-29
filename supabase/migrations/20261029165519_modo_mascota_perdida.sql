alter table public.pets
  add column breed text,
  add column mixed_breed text,
  add column sex text,
  add column size text,
  add column color text,
  add column birth_date date,
  add column approximate_age_years smallint,
  add column approximate_age_months smallint,
  add column approximate_age_declared_at date,
  add column weight_kg numeric(6,2),
  add column microchip text,
  add column ruac text,
  add column sterilized boolean;

alter table public.pets
  add constraint pets_breed_length check (breed is null or char_length(btrim(breed)) between 1 and 100),
  add constraint pets_mixed_breed_length check (mixed_breed is null or char_length(btrim(mixed_breed)) between 1 and 100),
  add constraint pets_sex_value check (sex is null or sex in ('macho', 'hembra')),
  add constraint pets_size_value check (size is null or size in ('pequena', 'mediana', 'grande')),
  add constraint pets_color_length check (color is null or char_length(btrim(color)) between 1 and 100),
  add constraint pets_age_values check (
    (approximate_age_years is null and approximate_age_months is null and approximate_age_declared_at is null)
    or (approximate_age_years between 0 and 40 and approximate_age_months between 0 and 11 and approximate_age_declared_at is not null)
  ),
  add constraint pets_birth_age_exclusive check (birth_date is null or approximate_age_years is null),
  add constraint pets_weight_positive check (weight_kg is null or weight_kg > 0 and weight_kg <= 300),
  add constraint pets_microchip_length check (microchip is null or char_length(btrim(microchip)) between 1 and 80),
  add constraint pets_ruac_length check (ruac is null or char_length(btrim(ruac)) between 1 and 40);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('pet-photos', 'pet-photos', false, 5242880, array['image/webp']),
  ('lost-pet-photos', 'lost-pet-photos', false, 5242880, array['image/webp'])
on conflict (id) do nothing;

create policy "Tutors manage their pet photos"
  on storage.objects for all to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Tutors manage their lost pet photos"
  on storage.objects for all to authenticated
  using (bucket_id = 'lost-pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'lost-pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create table public.lost_pet_reports (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  status text not null default 'active',
  lost_at timestamptz not null default now(),
  recovered_at timestamptz,
  last_seen_location text,
  last_seen_at timestamptz,
  wearing text,
  message text,
  reward text,
  recent_photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lost_pet_reports_status check (status in ('active', 'recovered')),
  constraint lost_pet_reports_recovery_state check (
    (status = 'active' and recovered_at is null)
    or (status = 'recovered' and recovered_at is not null)
  ),
  constraint lost_pet_reports_location_length check (last_seen_location is null or char_length(btrim(last_seen_location)) <= 160),
  constraint lost_pet_reports_wearing_length check (wearing is null or char_length(btrim(wearing)) <= 160),
  constraint lost_pet_reports_message_length check (message is null or char_length(btrim(message)) <= 500),
  constraint lost_pet_reports_reward_length check (reward is null or char_length(btrim(reward)) <= 100)
);

create unique index lost_pet_reports_one_active_per_pet_idx
  on public.lost_pet_reports (pet_id) where status = 'active';
create index lost_pet_reports_active_lost_at_idx
  on public.lost_pet_reports (lost_at desc) where status = 'active';

alter table public.lost_pet_reports enable row level security;
revoke all on table public.lost_pet_reports from public, anon, authenticated;
grant select, insert, update, delete on table public.lost_pet_reports to authenticated;

create policy "Tutors read their own lost pet reports"
  on public.lost_pet_reports for select to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = lost_pet_reports.pet_id and pets.owner_id = (select auth.uid())
  ));
create policy "Tutors create lost reports for their own pets"
  on public.lost_pet_reports for insert to authenticated
  with check (exists (
    select 1 from public.pets
    where pets.id = lost_pet_reports.pet_id and pets.owner_id = (select auth.uid())
  ));
create policy "Tutors update lost reports for their own pets"
  on public.lost_pet_reports for update to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = lost_pet_reports.pet_id and pets.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.pets
    where pets.id = lost_pet_reports.pet_id and pets.owner_id = (select auth.uid())
  ));
create policy "Tutors delete lost reports for their own pets"
  on public.lost_pet_reports for delete to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = lost_pet_reports.pet_id and pets.owner_id = (select auth.uid())
  ));

create function public.get_public_lost_pets(p_species text default null, p_query text default null)
returns table (
  public_code text,
  pet_name text,
  species public.pet_species,
  photo_path text,
  whatsapp_phone text,
  lost_at timestamptz,
  last_seen_location text,
  last_seen_at timestamptz,
  wearing text,
  message text,
  reward text
)
language sql
stable
security definer
set search_path = ''
as $$
  select codes.code, pets.name, pets.species, reports.recent_photo_path,
    case when pets.contact_override_enabled then pets.whatsapp_phone_override else profiles.whatsapp_phone end,
    reports.lost_at, reports.last_seen_location, reports.last_seen_at,
    reports.wearing, reports.message, reports.reward
  from public.lost_pet_reports as reports
  join public.pets on pets.id = reports.pet_id
  join public.profiles on profiles.id = pets.owner_id
  join public.public_code_reservations as codes on codes.pet_id = pets.id
  where reports.status = 'active'
    and pets.privacy_accepted_at is not null
    and (p_species is null or p_species = '' or pets.species::text = p_species)
    and (p_query is null or p_query = '' or coalesce(reports.last_seen_location, '') ilike '%' || left(p_query, 80) || '%')
  order by reports.lost_at desc;
$$;

create function public.get_public_lost_pet(p_code text)
returns table (
  public_code text,
  pet_name text,
  species public.pet_species,
  photo_path text,
  rescue_phone text,
  whatsapp_phone text,
  lost_at timestamptz,
  last_seen_location text,
  last_seen_at timestamptz,
  wearing text,
  message text,
  reward text,
  care_alerts jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select codes.code, pets.name, pets.species, reports.recent_photo_path,
    case when pets.contact_override_enabled then pets.rescue_phone_override else profiles.rescue_phone end,
    case when pets.contact_override_enabled then pets.whatsapp_phone_override else profiles.whatsapp_phone end,
    reports.lost_at, reports.last_seen_location, reports.last_seen_at,
    reports.wearing, reports.message, reports.reward,
    coalesce((select jsonb_agg(jsonb_build_object(
      'category', alerts.category, 'label', alerts.label,
      'severity', alerts.severity, 'instructions', alerts.instructions
    ) order by case alerts.severity when 'critical' then 1 when 'precaution' then 2 else 3 end, alerts.created_at)
      from public.care_alerts as alerts where alerts.pet_id = pets.id and alerts.qr_visible = true), '[]'::jsonb)
  from public.lost_pet_reports as reports
  join public.pets on pets.id = reports.pet_id
  join public.profiles on profiles.id = pets.owner_id
  join public.public_code_reservations as codes on codes.pet_id = pets.id
  where reports.status = 'active' and codes.code = p_code
    and p_code ~ '^PC-[A-HJ-NP-Z2-9]{6}$'
    and pets.privacy_accepted_at is not null;
$$;

create function public.get_public_pet_rescue_status(p_code text)
returns table (lost boolean, recovered_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.lost_pet_reports reports
    join public.pets on pets.id = reports.pet_id
    join public.public_code_reservations codes on codes.pet_id = pets.id
    where codes.code = p_code and p_code ~ '^PC-[A-HJ-NP-Z2-9]{6}$'
      and pets.privacy_accepted_at is not null and reports.status = 'active'
  ), (
    select reports.recovered_at from public.lost_pet_reports reports
    join public.pets on pets.id = reports.pet_id
    join public.public_code_reservations codes on codes.pet_id = pets.id
    where codes.code = p_code and p_code ~ '^PC-[A-HJ-NP-Z2-9]{6}$'
      and pets.privacy_accepted_at is not null and reports.status = 'recovered'
    order by reports.recovered_at desc limit 1
  );
$$;

create function public.get_public_pet_photo(p_code text)
returns table (photo_path text)
language sql
stable
security definer
set search_path = ''
as $$
  select pets.primary_photo_path
  from public.pets
  join public.public_code_reservations as codes on codes.pet_id = pets.id
  where codes.code = p_code and p_code ~ '^PC-[A-HJ-NP-Z2-9]{6}$'
    and pets.privacy_accepted_at is not null;
$$;

revoke all on function public.get_public_lost_pets(text, text) from public;
revoke all on function public.get_public_lost_pet(text) from public;
revoke all on function public.get_public_pet_rescue_status(text) from public;
revoke all on function public.get_public_pet_photo(text) from public;
grant execute on function public.get_public_lost_pets(text, text) to anon, authenticated;
grant execute on function public.get_public_lost_pet(text) to anon, authenticated;
grant execute on function public.get_public_pet_rescue_status(text) to anon, authenticated;
grant execute on function public.get_public_pet_photo(text) to anon, authenticated;
