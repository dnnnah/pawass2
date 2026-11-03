import { createClient } from '@supabase/supabase-js';

const localUserId = 'f1e6f676-238a-4f92-9391-ef34fb236c20';
export const localUserEmail = 'pawpass-seed@pawpass.invalid';
export const localUserPassword = 'PawPass-E2E-Local-Only-2026!';

export default async function globalSetup() {
  if (process.env.PAWPASS_E2E_PUBLIC_ONLY === '1') return;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('E2E requiere Supabase local y su clave de servicio temporal.');

  const parsedUrl = new URL(url);
  if (!['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname)) {
    throw new Error('E2E solo puede modificar el usuario sembrado en un Supabase local de loopback.');
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await admin.auth.admin.updateUserById(localUserId, { password: localUserPassword });
  if (error) throw new Error(`No se pudo preparar la cuenta local de E2E: ${error.message}`);
}
