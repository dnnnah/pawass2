'use server';

import { normalizeProfileInput } from '@/lib/domain';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type FormState = { ok: boolean; message: string; petId?: string; publicCode?: string; species?: 'perro' | 'gato' };

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
  revalidatePath('/cuenta');
  revalidatePath('/mascotas');
  return { ok: true, message: 'Perfil guardado. Estos contactos se usarán en las fichas QR que hereden los datos de tu cuenta.' };
}

export async function deleteAccount(_previous: FormState, formData: FormData): Promise<FormState> {
  if (String(formData.get('confirmation') || '') !== 'ELIMINAR CUENTA' || formData.get('confirmDelete') !== 'on') {
    return { ok: false, message: 'Escribe ELIMINAR CUENTA y confirma que entiendes que es permanente.' };
  }
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) return { ok: false, message: 'La eliminación requiere Supabase y la clave privada de servidor.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para eliminar tu cuenta.' };

  const { data: pets, error: petsError } = await supabase.from('pets').select('id,primary_photo_path').eq('owner_id', user.id);
  if (petsError) return { ok: false, message: 'No pudimos preparar la limpieza de tus mascotas.' };
  const petIds = (pets || []).map((pet) => pet.id);
  const reportsResponse = petIds.length
    ? await supabase.from('lost_pet_reports').select('recent_photo_path').in('pet_id', petIds)
    : { data: [], error: null };
  if (reportsResponse.error) return { ok: false, message: 'No pudimos preparar la limpieza de tus fotos de búsqueda.' };

  const primaryPhotos = (pets || []).map((pet) => pet.primary_photo_path).filter((path): path is string => Boolean(path));
  const lostPhotos = (reportsResponse.data || []).map((report) => report.recent_photo_path).filter((path): path is string => Boolean(path));
  if (primaryPhotos.length) {
    const { error } = await admin.storage.from('pet-photos').remove(primaryPhotos);
    if (error) return { ok: false, message: 'No pudimos quitar las fotos de perfil; la cuenta sigue intacta.' };
  }
  if (lostPhotos.length) {
    const { error } = await admin.storage.from('lost-pet-photos').remove(lostPhotos);
    if (error) return { ok: false, message: 'No pudimos quitar las fotos de búsqueda; la cuenta sigue intacta.' };
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, message: 'No se pudo eliminar la cuenta después de limpiar sus archivos. Inicia sesión e inténtalo de nuevo.' };
  await supabase.auth.signOut({ scope: 'local' });
  revalidatePath('/mascotas');
  revalidatePath('/cuenta');
  redirect('/');
}
