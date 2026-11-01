'use server';

import type { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { normalizeCareAlertInput } from './domain';
import { createClient } from '@/lib/supabase/server';
import type { FormState } from '@/features/profile/actions';

export async function saveCareAlert(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const alertId = String(formData.get('alertId') || '');
  const validation = normalizeCareAlertInput({
    catalogId: String(formData.get('catalogId') || ''),
    category: String(formData.get('category') || ''),
    label: String(formData.get('label') || ''),
    severity: String(formData.get('severity') || ''),
    instructions: String(formData.get('instructions') || ''),
    qrVisible: formData.get('qrVisible') === 'on',
  });
  if (!validation.ok) return { ok: false, message: validation.error };
  if (!isUuid(petId) || (alertId && !isUuid(alertId))) {
    return { ok: false, message: 'No se pudo identificar la mascota o la alerta.' };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para guardar una alerta.' };

  const alert = validation.value;
  const values = {
    pet_id: petId,
    category: alert.category,
    catalog_id: alert.catalogId,
    label: alert.label,
    severity: alert.severity,
    instructions: alert.instructions,
    qr_visible: alert.qrVisible,
    updated_at: new Date().toISOString(),
  };
  const result = alertId
    ? await supabase.from('care_alerts').update(values).eq('id', alertId).eq('pet_id', petId).select('id').maybeSingle()
    : await supabase.from('care_alerts').insert(values).select('id').single();

  if (result.error || !result.data) {
    return { ok: false, message: 'No se pudo guardar la alerta. Confirma que la mascota te pertenece e intenta de nuevo.' };
  }

  await revalidateCareAlertViews(petId, supabase);
  return { ok: true, message: alertId ? 'Alerta actualizada.' : 'Alerta guardada.' };
}

export async function deleteCareAlert(formData: FormData): Promise<void> {
  const petId = String(formData.get('petId') || '');
  const alertId = String(formData.get('alertId') || '');
  if (!isUuid(petId) || !isUuid(alertId)) return;

  const supabase = await createClient();
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('care_alerts').delete().eq('id', alertId).eq('pet_id', petId);
  await revalidateCareAlertViews(petId, supabase);
}

export async function setCareAlertVisibility(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const alertId = String(formData.get('alertId') || '');
  const visibility = formData.get('visibility');
  if (!isUuid(petId) || !isUuid(alertId) || (visibility !== 'public' && visibility !== 'private')) return { ok: false, message: 'No pudimos identificar la alerta.' };
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'No hay conexión con los datos.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para cambiar la visibilidad.' };
  const { data: pet } = await supabase.from('pets').select('id').eq('id', petId).eq('owner_id', user.id).maybeSingle();
  if (!pet) return { ok: false, message: 'Solo el dueño puede cambiar esta alerta.' };
  const { data, error } = await supabase.from('care_alerts').update({ qr_visible: visibility === 'public', updated_at: new Date().toISOString() }).eq('id', alertId).eq('pet_id', petId).select('id').maybeSingle();
  if (error || !data) return { ok: false, message: 'No pudimos cambiar la visibilidad. Inténtalo de nuevo.' };
  await revalidateCareAlertViews(petId, supabase);
  return { ok: true, message: visibility === 'public' ? 'La alerta y sus instrucciones ahora son públicas en el QR.' : 'La alerta ya no aparece públicamente.' };
}

async function revalidateCareAlertViews(petId: string, supabase: SupabaseClient) {
  const { data } = await supabase.from('public_code_reservations').select('code').eq('pet_id', petId).maybeSingle();
  revalidatePath('/perdidas');
  revalidatePath(`/mascotas/${petId}/perdida`);
  if (data?.code) { revalidatePath(`/p/${data.code}`); revalidatePath(`/perdidas/${data.code}`); }
  revalidatePath('/mascotas');
  revalidatePath(`/mascotas/${petId}`);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
