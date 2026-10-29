create table public.pet_health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  record_type text not null,
  catalog_id text,
  label text not null,
  administered_on date not null,
  next_dose_date date,
  lot text,
  veterinarian text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pet_health_records_type check (record_type in ('vaccination', 'deworming', 'procedure')),
  constraint pet_health_records_catalog_id_length check (catalog_id is null or char_length(btrim(catalog_id)) between 1 and 80),
  constraint pet_health_records_label_length check (char_length(btrim(label)) between 1 and 120),
  constraint pet_health_records_date_order check (next_dose_date is null or next_dose_date >= administered_on),
  constraint pet_health_records_record_shape check (
    (record_type = 'procedure' and catalog_id is null and next_dose_date is null)
    or (record_type in ('vaccination', 'deworming') and catalog_id is not null)
  ),
  constraint pet_health_records_lot_length check (lot is null or char_length(btrim(lot)) <= 80),
  constraint pet_health_records_veterinarian_length check (veterinarian is null or char_length(btrim(veterinarian)) <= 120),
  constraint pet_health_records_notes_length check (notes is null or char_length(notes) <= 1000)
);

create index pet_health_records_pet_date_idx
  on public.pet_health_records (pet_id, administered_on desc, created_at desc);

alter table public.pet_health_records enable row level security;
revoke all on table public.pet_health_records from public, anon, authenticated;
grant select, insert, update, delete on table public.pet_health_records to authenticated;

create policy "Tutors read their own health records"
  on public.pet_health_records for select to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = pet_health_records.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create policy "Tutors create health records for their own pets"
  on public.pet_health_records for insert to authenticated
  with check (exists (
    select 1 from public.pets
    where pets.id = pet_health_records.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create policy "Tutors update health records for their own pets"
  on public.pet_health_records for update to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = pet_health_records.pet_id
      and pets.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.pets
    where pets.id = pet_health_records.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create policy "Tutors delete health records for their own pets"
  on public.pet_health_records for delete to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = pet_health_records.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create table public.pet_health_documents (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  category text not null,
  label text not null,
  storage_path text not null unique,
  original_filename text not null,
  mime_type text not null,
  size_bytes integer not null,
  document_date date,
  notes text,
  created_at timestamptz not null default now(),
  constraint pet_health_documents_category check (category in (
    'cartilla-vacunacion', 'certificado-esterilizacion', 'registro-microchip',
    'receta', 'estudio-medico', 'identificacion', 'other'
  )),
  constraint pet_health_documents_label_length check (char_length(btrim(label)) between 1 and 120),
  constraint pet_health_documents_path_is_private_key check (
    storage_path !~* '^https?://' and storage_path !~ '(^|/)\.\.(/|$)'
  ),
  constraint pet_health_documents_filename_length check (char_length(btrim(original_filename)) between 1 and 160),
  constraint pet_health_documents_mime_type check (mime_type in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
  constraint pet_health_documents_size_bytes check (size_bytes between 1 and 10485760),
  constraint pet_health_documents_notes_length check (notes is null or char_length(notes) <= 1000)
);

create index pet_health_documents_pet_created_idx
  on public.pet_health_documents (pet_id, created_at desc);

alter table public.pet_health_documents enable row level security;
revoke all on table public.pet_health_documents from public, anon, authenticated;
grant select, insert, update, delete on table public.pet_health_documents to authenticated;

create policy "Tutors read their own health documents"
  on public.pet_health_documents for select to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = pet_health_documents.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create policy "Tutors create health documents for their own pets"
  on public.pet_health_documents for insert to authenticated
  with check (exists (
    select 1 from public.pets
    where pets.id = pet_health_documents.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create policy "Tutors update health documents for their own pets"
  on public.pet_health_documents for update to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = pet_health_documents.pet_id
      and pets.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.pets
    where pets.id = pet_health_documents.pet_id
      and pets.owner_id = (select auth.uid())
  ));

create policy "Tutors delete health documents for their own pets"
  on public.pet_health_documents for delete to authenticated
  using (exists (
    select 1 from public.pets
    where pets.id = pet_health_documents.pet_id
      and pets.owner_id = (select auth.uid())
  ));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-health-documents',
  'pet-health-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Tutors read their own health documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'pet-health-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.pet_health_documents as documents
      join public.pets on pets.id = documents.pet_id
      where documents.storage_path = storage.objects.name
        and documents.pet_id::text = (storage.foldername(name))[2]
        and pets.owner_id = (select auth.uid())
    )
  );

create policy "Tutors upload health documents for their own pets"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'pet-health-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.pet_health_documents as documents
      join public.pets on pets.id = documents.pet_id
      where documents.storage_path = storage.objects.name
        and documents.pet_id::text = (storage.foldername(name))[2]
        and pets.owner_id = (select auth.uid())
    )
  );

create policy "Tutors delete their own health documents"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'pet-health-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.pet_health_documents as documents
      join public.pets on pets.id = documents.pet_id
      where documents.storage_path = storage.objects.name
        and documents.pet_id::text = (storage.foldername(name))[2]
        and pets.owner_id = (select auth.uid())
    )
  );
