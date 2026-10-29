-- Solo para desarrollo y pruebas. Credenciales ficticias; no reutilizar en producción.
do $$
declare
  test_user_id constant uuid := 'f1e6f676-238a-4f92-9391-ef34fb236c20';
  test_email constant text := 'pawpass-seed@pawpass.invalid';
  created_pet record;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change, email_change_token_new,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000', test_user_id, 'authenticated', 'authenticated', test_email,
    extensions.crypt('PawPass-Test-2026!', extensions.gen_salt('bf')),
    statement_timestamp(), '', '', '', '', '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"seed":true}'::jsonb,
    statement_timestamp(), statement_timestamp()
  ) on conflict (id) do update set
    instance_id = excluded.instance_id,
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    confirmation_token = excluded.confirmation_token,
    recovery_token = excluded.recovery_token,
    email_change = excluded.email_change,
    email_change_token_new = excluded.email_change_token_new,
    email_change_token_current = excluded.email_change_token_current,
    phone_change = excluded.phone_change,
    phone_change_token = excluded.phone_change_token,
    reauthentication_token = excluded.reauthentication_token,
    updated_at = statement_timestamp();

  insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
  values (
    test_user_id::text,
    test_user_id,
    jsonb_build_object('sub', test_user_id::text, 'email', test_email, 'email_verified', true),
    'email', statement_timestamp(), statement_timestamp()
  ) on conflict (provider_id, provider) do update set
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = statement_timestamp();

  update public.profiles set
    first_name = 'Tutora de prueba',
    surname1 = 'Semilla',
    surname2 = null,
    rescue_phone = '+12025550101',
    whatsapp_phone = '+12025550102',
    updated_at = statement_timestamp()
  where id = test_user_id;

  perform set_config('request.jwt.claim.sub', test_user_id::text, true);

  if not exists (select 1 from public.pets where owner_id = test_user_id and name = 'Luna de prueba') then
    select * into created_pet from public.create_pet_with_code('Luna de prueba', 'perro', true);
  end if;

  if not exists (select 1 from public.pets where owner_id = test_user_id and name = 'Miso de prueba') then
    select * into created_pet from public.create_pet_with_code('Miso de prueba', 'gato', true);
    update public.pets set
      contact_override_enabled = true,
      rescue_phone_override = '+14155550126',
      whatsapp_phone_override = '+14155550127',
      updated_at = statement_timestamp()
    where id = created_pet.pet_id and owner_id = test_user_id;
  end if;
end;
$$;
