'use server';

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

  revalidateCareAlertViews(petId);
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
  revalidateCareAlertViews(petId);
}

function revalidateCareAlertViews(petId: string) {
  revalidatePath('/mascotas');
  revalidatePath(`/mascotas/${petId}`);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
