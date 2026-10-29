'use server';

import { normalizeProfileInput } from '@/lib/domain';
import { createClient } from '@/lib/supabase/server';

export type FormState = { ok: boolean; message: string };

export async function saveProfile(_previous: FormState, formData: FormData): Promise<FormState> {
  const validation = normalizeProfileInput({
    firstName: String(formData.get('firstName') || ''),
    surname1: String(formData.get('surname1') || ''),
    surname2: String(formData.get('surname2') || ''),
    phone: String(formData.get('phone') || ''),
    phoneCountry: String(formData.get('phoneCountry') || ''),
    whatsapp: String(formData.get('whatsapp') || ''),
    whatsappCountry: String(formData.get('whatsappCountry') || ''),
  });
  if (!validation.ok) return { ok: false, message: validation.error };

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para guardar tu perfil.' };

  const { error } = await supabase.from('profiles').update({
    first_name: validation.value.firstName,
    surname1: validation.value.surname1,
    surname2: validation.value.surname2,
    rescue_phone: validation.value.phone,
    whatsapp_phone: validation.value.whatsapp,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id);
  if (error) return { ok: false, message: 'No se pudo guardar tu perfil. Revisa los datos e intenta de nuevo.' };
  return { ok: true, message: 'Perfil guardado. Estos contactos se usarán en las fichas QR que hereden los datos de tu cuenta.' };
}
