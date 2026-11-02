import { createClient } from '@/lib/supabase/server';
export async function socialSession() {
  const db = await createClient();
  if (!db) throw new Error('Pawgram necesita conexión con Supabase.');
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error('Inicia sesión para continuar.');
  return { db, user };
}
export function previewSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('Falta configurar el almacenamiento social en servidor.');
  return secret;
}
