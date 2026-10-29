create function public.get_public_rescue_card(p_code text)
returns table (
  public_code text,
  pet_name text,
  species public.pet_species,
  rescue_phone text,
  whatsapp_phone text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    codes.code,
    pets.name,
    pets.species,
    case when pets.contact_override_enabled then pets.rescue_phone_override else profiles.rescue_phone end,
    case when pets.contact_override_enabled then pets.whatsapp_phone_override else profiles.whatsapp_phone end
  from public.public_code_reservations as codes
  join public.pets on pets.id = codes.pet_id
  join public.profiles on profiles.id = pets.owner_id
  where codes.code = p_code
    and p_code ~ '^PC-[A-HJ-NP-Z2-9]{6}$'
    and pets.privacy_accepted_at is not null
    and (case when pets.contact_override_enabled then pets.rescue_phone_override else profiles.rescue_phone end) is not null
    and (case when pets.contact_override_enabled then pets.whatsapp_phone_override else profiles.whatsapp_phone end) is not null;
$$;

revoke all on function public.get_public_rescue_card(text) from public, anon, authenticated;
grant execute on function public.get_public_rescue_card(text) to anon, authenticated;
