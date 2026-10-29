'use server';

import { revalidatePath } from 'next/cache';
import { normalizeLostReport } from './domain';
import { createClient } from '@/lib/supabase/server';
import type { FormState } from '@/features/profile/actions';

async function uploadRecentPhoto(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, userId: string, petId: string, photo: FormDataEntryValue | null) {
  if (!(photo instanceof File) || photo.size === 0) return { path: null, error: '' };
  if (photo.type !== 'image/webp' || photo.size > 5 * 1024 * 1024) return { path: null, error: 'La foto debe estar convertida a WebP y pesar menos de 5 MB.' };
  const path = `${userId}/${petId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from('lost-pet-photos').upload(path, photo, { contentType: 'image/webp', upsert: false });
  return error ? { path: null, error: 'No pudimos subir la foto. Comprueba tu conexión e inténtalo de nuevo.' } : { path, error: '' };
}

function getReport(formData: FormData) {
  return normalizeLostReport({
    lastSeenLocation: String(formData.get('lastSeenLocation') || ''),
    lastSeenAt: String(formData.get('lastSeenAt') || ''),
    wearing: String(formData.get('wearing') || ''),
    message: String(formData.get('message') || ''),
    reward: String(formData.get('reward') || ''),
  });
}

export async function createLostReport(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const consent = formData.get('publicConsent') === 'on';
  const validation = getReport(formData);
  if (!petId || !consent) return { ok: false, message: 'Confirma que entiendes qué información será pública.' };
  if (!validation.ok) return { ok: false, message: validation.error };
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para reportar una mascota.' };
  const { data: pet } = await supabase.from('pets').select('id').eq('id', petId).eq('owner_id', user.id).maybeSingle();
  if (!pet) return { ok: false, message: 'No encontramos esta mascota.' };
  const uploaded = await uploadRecentPhoto(supabase, user.id, petId, formData.get('recentPhoto'));
  if (uploaded.error) return { ok: false, message: uploaded.error };
  const { error } = await supabase.from('lost_pet_reports').insert({ pet_id: petId, ...validation.value, recent_photo_path: uploaded.path });
  if (error) {
    if (uploaded.path) await supabase.storage.from('lost-pet-photos').remove([uploaded.path]);
    return { ok: false, message: 'No se pudo publicar la alerta. Comprueba que no haya otra activa e inténtalo de nuevo.' };
  }
  const { data: code } = await supabase.from('public_code_reservations').select('code').eq('pet_id', petId).maybeSingle();
  revalidatePath('/mascotas');
  revalidatePath('/perdidas');
  if (code?.code) {
    revalidatePath(`/perdidas/${code.code}`);
    revalidatePath(`/p/${code.code}`);
  }
  return { ok: true, message: 'La alerta ya está publicada en Mascotas perdidas.' };
}

export async function updateLostReport(_previous: FormState, formData: FormData): Promise<FormState> {
  const reportId = String(formData.get('reportId') || '');
  const validation = getReport(formData);
  if (!reportId) return { ok: false, message: 'No encontramos esta alerta.' };
  if (!validation.ok) return { ok: false, message: validation.error };
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para editar esta alerta.' };
  const { data: existing } = await supabase.from('lost_pet_reports').select('id,pet_id,recent_photo_path').eq('id', reportId).eq('status', 'active').maybeSingle();
  if (!existing) return { ok: false, message: 'No se pudo actualizar la alerta.' };
  const uploaded = await uploadRecentPhoto(supabase, user.id, existing.pet_id, formData.get('recentPhoto'));
  if (uploaded.error) return { ok: false, message: uploaded.error };
  const nextPhotoPath = uploaded.path || existing.recent_photo_path;
  const { data: report, error } = await supabase.from('lost_pet_reports')
    .update({ ...validation.value, recent_photo_path: nextPhotoPath, updated_at: new Date().toISOString() })
    .eq('id', reportId).eq('status', 'active').select('pet_id').maybeSingle();
  if (error || !report) {
    if (uploaded.path) await supabase.storage.from('lost-pet-photos').remove([uploaded.path]);
    return { ok: false, message: 'No se pudo actualizar la alerta.' };
  }
  if (uploaded.path && existing.recent_photo_path) {
    const { error: removeError } = await supabase.storage.from('lost-pet-photos').remove([existing.recent_photo_path]);
    if (removeError) {
      await supabase.from('lost_pet_reports').update({ recent_photo_path: existing.recent_photo_path }).eq('id', reportId).eq('status', 'active');
      await supabase.storage.from('lost-pet-photos').remove([uploaded.path]);
      return { ok: false, message: 'No pudimos reemplazar la foto anterior. Conservamos la que ya tenía.' };
    }
  }
  const { data: code } = await supabase.from('public_code_reservations').select('code').eq('pet_id', report.pet_id).maybeSingle();
  revalidatePath('/mascotas');
  revalidatePath('/perdidas');
  if (code?.code) revalidatePath(`/perdidas/${code.code}`);
  return { ok: true, message: 'Actualizamos los detalles de la alerta.' };
}

export async function recoverPet(_previous: FormState, formData: FormData): Promise<FormState> {
  const reportId = String(formData.get('reportId') || '');
  if (!reportId || formData.get('confirmRecovery') !== 'on') {
    return { ok: false, message: 'Confirma que la mascota ya está en casa.' };
  }
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para cerrar la alerta.' };
  const { data: existing } = await supabase.from('lost_pet_reports').select('id,pet_id,recent_photo_path').eq('id', reportId).eq('status', 'active').maybeSingle();
  if (!existing) return { ok: false, message: 'No se encontró una alerta activa para esta mascota.' };
  if (existing.recent_photo_path) {
    const { error: removeError } = await supabase.storage.from('lost-pet-photos').remove([existing.recent_photo_path]);
    if (removeError) return { ok: false, message: 'No pudimos borrar la foto reciente; la alerta sigue activa. Inténtalo de nuevo.' };
  }
  const { data: report, error } = await supabase.from('lost_pet_reports')
    .update({ status: 'recovered', recent_photo_path: null, recovered_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', reportId).eq('status', 'active').select('pet_id').maybeSingle();
  if (error || !report) return { ok: false, message: 'No se pudo cerrar la alerta. Actualiza la página e inténtalo de nuevo.' };
  const { data: code } = await supabase.from('public_code_reservations').select('code').eq('pet_id', report.pet_id).maybeSingle();
  revalidatePath('/mascotas');
  revalidatePath('/perdidas');
  if (code?.code) {
    revalidatePath(`/perdidas/${code.code}`);
    revalidatePath(`/p/${code.code}`);
  }
  return { ok: true, message: 'Cerramos la alerta. El QR mostrará “Ya está en casa” durante 30 días.' };
}
