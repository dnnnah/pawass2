create type public.pet_species as enum ('perro', 'gato');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  surname1 text,
  surname2 text,
  rescue_phone text,
  whatsapp_phone text,
  updated_at timestamptz not null default now(),
  constraint profiles_first_name_length check (first_name is null or char_length(btrim(first_name)) between 1 and 80),
  constraint profiles_surname1_length check (surname1 is null or char_length(surname1) <= 80),
  constraint profiles_surname2_length check (surname2 is null or char_length(surname2) <= 80),
  constraint profiles_rescue_phone_e164 check (rescue_phone is null or rescue_phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint profiles_whatsapp_phone_e164 check (whatsapp_phone is null or whatsapp_phone ~ '^\+[1-9][0-9]{7,14}$')
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  species public.pet_species not null,
  primary_photo_path text,
  privacy_accepted_at timestamptz not null,
  contact_override_enabled boolean not null default false,
  rescue_phone_override text,
  whatsapp_phone_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pets_name_length check (char_length(btrim(name)) between 1 and 60),
  constraint pets_override_complete check (
    (contact_override_enabled = false and rescue_phone_override is null and whatsapp_phone_override is null)
    or (contact_override_enabled = true and rescue_phone_override is not null and whatsapp_phone_override is not null)
  ),
  constraint pets_override_phone_e164 check (rescue_phone_override is null or rescue_phone_override ~ '^\+[1-9][0-9]{7,14}$'),
  constraint pets_override_whatsapp_phone_e164 check (whatsapp_phone_override is null or whatsapp_phone_override ~ '^\+[1-9][0-9]{7,14}$')
);

create table public.public_code_reservations (
  code text primary key,
  pet_id uuid unique references public.pets (id) on delete set null,
  reserved_at timestamptz not null default now(),
  constraint public_code_format check (code ~ '^PC-[A-HJ-NP-Z2-9]{6}$')
);

create index pets_owner_id_created_at_idx on public.pets (owner_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.public_code_reservations enable row level security;

grant select, update on public.profiles to authenticated;
grant select, update, delete on public.pets to authenticated;
grant select on public.public_code_reservations to authenticated;

create policy "Tutors read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Tutors update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Tutors read their own pets"
  on public.pets for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy "Tutors update their own pets"
  on public.pets for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "Tutors delete their own pets"
  on public.pets for delete to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Tutors read their own reserved codes"
  on public.public_code_reservations for select to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = public_code_reservations.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

create function public.create_pet_with_code(p_name text, p_species public.pet_species, p_privacy_accepted boolean)
returns table (pet_id uuid, public_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  tutor_id uuid := auth.uid();
  new_pet_id uuid;
  candidate text;
  random_source uuid;
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  attempt integer;
begin
  if tutor_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;
  if p_privacy_accepted is distinct from true then
    raise exception 'privacy_consent_required' using errcode = '22023';
  end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 60 then
    raise exception 'invalid_pet_name' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = tutor_id
      and first_name is not null and rescue_phone is not null and whatsapp_phone is not null
  ) then
    raise exception 'profile_incomplete' using errcode = '23514';
  end if;

  insert into public.pets (owner_id, name, species, privacy_accepted_at)
  values (tutor_id, btrim(p_name), p_species, statement_timestamp())
  returning id into new_pet_id;

  for attempt in 1..64 loop
    random_source := gen_random_uuid();
    candidate := 'PC-' || (
      select string_agg(substr(alphabet, (get_byte(uuid_send(random_source), byte_index) % char_length(alphabet)) + 1, 1), '' order by byte_index)
      from generate_series(0, 5) as bytes(byte_index)
    );
    insert into public.public_code_reservations (code, pet_id)
    values (candidate, new_pet_id)
    on conflict (code) do nothing;
    if found then
      return query select new_pet_id, candidate;
      return;
    end if;
  end loop;
  raise exception 'public_code_allocation_failed' using errcode = 'P0001';
end;
$$;
revoke all on function public.create_pet_with_code(text, public.pet_species, boolean) from public, anon;
grant execute on function public.create_pet_with_code(text, public.pet_species, boolean) to authenticated;

-- PostgreSQL views execute with their owner's privileges by default. This view is
-- intentionally a small public contract; never add owner names, private health data,
-- documents, or unapproved fields here.
create view public.rescue_pet_cards
with (security_barrier = true)
as
select
  codes.code,
  pets.name,
  pets.species,
  coalesce(pets.rescue_phone_override, profiles.rescue_phone) as rescue_phone,
  coalesce(pets.whatsapp_phone_override, profiles.whatsapp_phone) as whatsapp_phone
from public.public_code_reservations as codes
join public.pets on pets.id = codes.pet_id
join public.profiles on profiles.id = pets.owner_id
where pets.privacy_accepted_at is not null;

revoke all on public.rescue_pet_cards from public, authenticated;
grant select on public.rescue_pet_cards to anon;
