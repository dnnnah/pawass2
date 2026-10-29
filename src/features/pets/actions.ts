'use server';

import { getCountries, type CountryCode } from 'libphonenumber-js';
import { normalizePhoneNumber, validateQuickPetInput } from '@/lib/domain';
import { createClient } from '@/lib/supabase/server';
import type { FormState } from '@/features/profile/actions';

export async function createPet(_previous: FormState, formData: FormData): Promise<FormState> {
  const validation = validateQuickPetInput({
    name: String(formData.get('name') || ''),
    species: String(formData.get('species') || ''),
    privacyAccepted: formData.get('privacyAccepted') === 'on',
  });
  if (!validation.ok) return { ok: false, message: validation.error };

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para registrar una mascota.' };

  const { data, error } = await supabase.rpc('create_pet_with_code', {
    p_name: validation.value.name,
    p_species: validation.value.species,
    p_privacy_accepted: true,
  });
  if (error || !data?.[0]?.public_code) {
    return { ok: false, message: 'No fue posible crear la ficha. Confirma que tu perfil esté completo e intenta de nuevo.' };
  }
  return { ok: true, message: `Ficha lista. Su código público es ${data[0].public_code}.` };
}

export async function savePetContactOverride(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const enabled = formData.get('enabled') === 'on';
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para actualizar el contacto.' };

  let rescuePhone: string | null = null;
  let whatsappPhone: string | null = null;
  if (enabled) {
    const phoneCountry = String(formData.get('phoneCountry') || '');
    const whatsappCountry = String(formData.get('whatsappCountry') || '');
    if (!getCountries().includes(phoneCountry as CountryCode) || !getCountries().includes(whatsappCountry as CountryCode)) {
      return { ok: false, message: 'Selecciona ladas válidas para ambos números.' };
    }
    rescuePhone = normalizePhoneNumber(String(formData.get('phone') || ''), phoneCountry as CountryCode);
    whatsappPhone = normalizePhoneNumber(String(formData.get('whatsapp') || ''), whatsappCountry as CountryCode);
    if (!rescuePhone || !whatsappPhone) return { ok: false, message: 'Escribe dos números válidos con lada internacional.' };
  }

  const { error } = await supabase.from('pets').update({
    contact_override_enabled: enabled,
    rescue_phone_override: rescuePhone,
    whatsapp_phone_override: whatsappPhone,
    updated_at: new Date().toISOString(),
  }).eq('id', petId).eq('owner_id', user.id);
  if (error) return { ok: false, message: 'No se pudo actualizar el contacto de esta mascota.' };
  return { ok: true, message: enabled ? 'Esta mascota usará el contacto elegido.' : 'Esta mascota heredará los contactos de tu cuenta.' };
}
