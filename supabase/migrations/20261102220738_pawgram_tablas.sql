-- Private rows; all public reads use explicit, checked projections.
create schema if not exists pawgram_private;
revoke all on schema pawgram_private from public, anon, authenticated;
create table public.pawgram_admins (
  account_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.pawgram_admins enable row level security;
revoke all on public.pawgram_admins from public, anon, authenticated;
create function public.pawgram_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists(select 1 from public.pawgram_admins where account_id=auth.uid());
$$;
revoke all on function public.pawgram_is_admin() from public;
grant execute on function public.pawgram_is_admin() to authenticated;

-- Assets survive cascades until Storage deletion succeeds. No client Storage
-- policies: even the owner cannot mint a signed URL that outlives withdrawal.
create table public.pawgram_assets (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null,
  owner_id uuid references auth.users(id) on delete set null,
  path text unique not null,
  state text not null default 'pending' check(state in ('pending','active','retired')),
  created_at timestamptz not null default now(),
  check(path = id::text || '.webp')
);
alter table public.pawgram_assets enable row level security;
revoke all on public.pawgram_assets from public, anon, authenticated;
grant all on public.pawgram_assets to service_role;
create index pawgram_assets_cleanup on public.pawgram_assets(state,created_at);
create index pawgram_assets_pet on public.pawgram_assets(pet_id);
create index pawgram_assets_owner on public.pawgram_assets(owner_id);

create table public.pawgram_profiles (
  pet_id uuid primary key references public.pets(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check(char_length(btrim(name)) between 1 and 60),
  species text not null check(species in ('perro','gato')),
  presentation text check(char_length(presentation)<=300),
  breed text check(char_length(breed)<=120),
  sex text check(char_length(sex)<=40),
  size text check(char_length(size)<=40),
  age_months integer check(age_months between 0 and 1200),
  age_as_of date,
  photo_id uuid unique references public.pawgram_assets(id),
  published boolean not null default false,
  consent_at timestamptz not null,
  restriction_reason text check(char_length(btrim(restriction_reason)) between 1 and 1000),
  moderated_at timestamptz,
  moderated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  check ((age_months is null) = (age_as_of is null))
);
create index pawgram_profiles_owner on public.pawgram_profiles(owner_id);
create table public.pawgram_posts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pawgram_profiles(pet_id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  photo_id uuid not null unique references public.pawgram_assets(id),
  body text not null default '' check(char_length(body)<=1000),
  alt text not null check(char_length(btrim(alt)) between 1 and 500),
  restriction_reason text check(char_length(btrim(restriction_reason)) between 1 and 1000),
  moderated_at timestamptz,
  moderated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index pawgram_posts_feed on public.pawgram_posts(created_at desc,id desc);
create index pawgram_posts_profile on public.pawgram_posts(pet_id,created_at desc,id desc);
create index pawgram_posts_owner on public.pawgram_posts(owner_id);
create table public.pawgram_paws (
  post_id uuid not null references public.pawgram_posts(id) on delete cascade,
  account_id uuid not null references auth.users(id) on delete cascade,
  primary key(post_id,account_id)
);
create index pawgram_paws_account on public.pawgram_paws(account_id);
alter table public.pawgram_profiles enable row level security;
alter table public.pawgram_posts enable row level security;
alter table public.pawgram_paws enable row level security;
revoke all on public.pawgram_profiles,public.pawgram_posts,public.pawgram_paws from public,anon,authenticated;
grant select on public.pawgram_profiles,public.pawgram_posts,public.pawgram_paws to authenticated;
create policy "Owner and admin read social profiles" on public.pawgram_profiles for select to authenticated
using (owner_id=(select auth.uid()) or (select public.pawgram_is_admin()));
create policy "Owner and admin read social posts" on public.pawgram_posts for select to authenticated
using (owner_id=(select auth.uid()) or (select public.pawgram_is_admin()));
create policy "Accounts read only their own paws" on public.pawgram_paws for select to authenticated
using (account_id=(select auth.uid()));

create function pawgram_private.retire_asset() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then
    update public.pawgram_assets set state='retired' where id=old.photo_id;
    return old;
  end if;
  if old.photo_id is distinct from new.photo_id then
    update public.pawgram_assets set state='retired' where id=old.photo_id;
  end if;
  return new;
end $$;
create trigger pawgram_profile_asset after delete or update on public.pawgram_profiles for each row execute function pawgram_private.retire_asset();
create trigger pawgram_post_asset after delete on public.pawgram_posts for each row execute function pawgram_private.retire_asset();
-- Pending uploads for a deleted pet are also eligible for durable cleanup.
create function pawgram_private.retire_pet_assets() returns trigger language plpgsql security definer set search_path='' as $$
begin update public.pawgram_assets set state='retired' where pet_id=old.id; return old; end $$;
create trigger pawgram_pet_assets after delete on public.pets for each row execute function pawgram_private.retire_pet_assets();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('pawgram-photos','pawgram-photos',false,10485760,array['image/webp']);
