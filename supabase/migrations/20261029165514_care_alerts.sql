create table public.care_alerts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  category text not null,
  catalog_id text,
  label text not null,
  severity text not null,
  instructions text not null default '',
  qr_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint care_alerts_category check (category in ('allergy', 'condition', 'medication', 'care', 'temperament')),
  constraint care_alerts_severity check (severity in ('critical', 'precaution', 'informative')),
  constraint care_alerts_label_length check (char_length(btrim(label)) between 1 and 120),
  constraint care_alerts_instructions_length check (char_length(instructions) <= 500),
  constraint care_alerts_catalog_id_length check (catalog_id is null or char_length(catalog_id) between 1 and 80)
);

create index care_alerts_pet_id_created_at_idx
  on public.care_alerts (pet_id, created_at desc);

alter table public.care_alerts enable row level security;
revoke all on table public.care_alerts from public, anon, authenticated;
grant select, insert, update, delete on table public.care_alerts to authenticated;

create policy "Tutors read their own care alerts"
  on public.care_alerts for select to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = care_alerts.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create policy "Tutors create care alerts for their own pets"
  on public.care_alerts for insert to authenticated
  with check (exists (
    select 1 from public.pets
    where pets.id = care_alerts.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create policy "Tutors update care alerts for their own pets"
  on public.care_alerts for update to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = care_alerts.pet_id
      and pets.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.pets
    where pets.id = care_alerts.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create policy "Tutors delete care alerts for their own pets"
  on public.care_alerts for delete to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = care_alerts.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create function public.get_public_care_alerts(p_code text)
returns table (
  category text,
  label text,
  severity text,
  instructions text
)
language sql
stable
security definer
set search_path = ''
as $$
  select alerts.category, alerts.label, alerts.severity, alerts.instructions
  from public.public_code_reservations as codes
  join public.pets on pets.id = codes.pet_id
  join public.care_alerts as alerts on alerts.pet_id = pets.id
  where codes.code = p_code
    and p_code ~ '^PC-[A-HJ-NP-Z2-9]{6}$'
    and pets.privacy_accepted_at is not null
    and alerts.qr_visible = true
  order by
    case alerts.severity when 'critical' then 1 when 'precaution' then 2 else 3 end,
    alerts.created_at asc;
$$;

-- This SECURITY DEFINER function is an intentional public boundary. Its contract
-- is limited to rows explicitly opted into the QR; table access remains private.
revoke all on function public.get_public_care_alerts(text) from public;
grant execute on function public.get_public_care_alerts(text) to anon, authenticated;
