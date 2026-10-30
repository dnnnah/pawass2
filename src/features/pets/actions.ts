'use server';

import { getCountries, type CountryCode } from 'libphonenumber-js';
import { normalizePhoneNumber, validateQuickPetInput } from '@/lib/domain';
import { normalizePetDetailsInput } from './domain';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import type { FormState } from '@/features/profile/actions';
import { revalidatePath } from 'next/cache';

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
  revalidatePath('/mascotas');
  return {
    ok: true,
    message: `Ficha lista. Su código público es ${data[0].public_code}.`,
    petId: data[0].pet_id,
    publicCode: data[0].public_code,
    species: validation.value.species,
  };
}

export async function savePetDetails(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const validation = normalizePetDetailsInput({
    breed: String(formData.get('customBreed') || formData.get('breed') || ''),
    mixedBreed: String(formData.get('mixedBreed') || ''),
    sex: String(formData.get('sex') || ''),
    size: String(formData.get('size') || ''),
    color: String(formData.get('color') || ''),
    birthDate: String(formData.get('birthDate') || ''),
    approximateYears: String(formData.get('approximateYears') || ''),
    approximateMonths: String(formData.get('approximateMonths') || ''),
    approximateDeclaredAt: String(formData.get('approximateDeclaredAt') || ''),
    weightKg: String(formData.get('weightKg') || ''),
    microchip: String(formData.get('microchip') || ''),
    ruac: String(formData.get('ruac') || ''),
    sterilized: String(formData.get('sterilized') || ''),
  });
  if (!petId) return { ok: false, message: 'No encontramos esta mascota.' };
  if (!validation.ok) return { ok: false, message: validation.error };
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para guardar los detalles.' };
  const { error } = await supabase.from('pets').update({
    breed: validation.value.breed,
    mixed_breed: validation.value.mixedBreed,
    sex: validation.value.sex,
    size: validation.value.size,
    color: validation.value.color,
    birth_date: validation.value.birthDate,
    approximate_age_years: validation.value.approximateYears,
    approximate_age_months: validation.value.approximateMonths,
    approximate_age_declared_at: validation.value.approximateAgeDeclaredAt,
    weight_kg: validation.value.weightKg,
    microchip: validation.value.microchip,
    ruac: validation.value.ruac,
    sterilized: validation.value.sterilized,
    updated_at: new Date().toISOString(),
  }).eq('id', petId).eq('owner_id', user.id);
  if (error) return { ok: false, message: 'No se pudieron guardar los detalles. Inténtalo de nuevo.' };
  revalidatePath('/mascotas');
  revalidatePath(`/mascotas/${petId}`);
  return { ok: true, message: 'Guardamos los detalles de esta mascota.' };
}

export async function uploadPrimaryPhoto(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const photo = formData.get('photo');
  if (!petId || !(photo instanceof File) || photo.size === 0) return { ok: false, message: 'Elige una fotografía para subir.' };
  if (photo.type !== 'image/webp' || photo.size > 5 * 1024 * 1024) return { ok: false, message: 'La foto debe estar convertida a WebP y pesar menos de 5 MB.' };
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para guardar una fotografía.' };
  const { data: pet } = await supabase.from('pets').select('primary_photo_path').eq('id', petId).eq('owner_id', user.id).maybeSingle();
  if (!pet) return { ok: false, message: 'No encontramos esta mascota.' };
  const path = `${user.id}/${petId}/${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage.from('pet-photos').upload(path, photo, { contentType: 'image/webp', upsert: false });
  if (uploadError) return { ok: false, message: 'No pudimos subir la foto. Comprueba tu conexión e inténtalo de nuevo.' };
  const { error: updateError } = await supabase.from('pets').update({ primary_photo_path: path, updated_at: new Date().toISOString() }).eq('id', petId).eq('owner_id', user.id);
  if (updateError) {
    await supabase.storage.from('pet-photos').remove([path]);
    return { ok: false, message: 'No pudimos guardar la foto en la ficha.' };
  }
  if (pet.primary_photo_path) {
    const { error: removeError } = await supabase.storage.from('pet-photos').remove([pet.primary_photo_path]);
    if (removeError) {
      await supabase.from('pets').update({ primary_photo_path: pet.primary_photo_path }).eq('id', petId).eq('owner_id', user.id);
      await supabase.storage.from('pet-photos').remove([path]);
      return { ok: false, message: 'No pudimos reemplazar la foto anterior. Conservamos la que ya tenía.' };
    }
  }
  revalidatePath('/mascotas');
  revalidatePath(`/mascotas/${petId}`);
  revalidatePath(`/p/${String(formData.get('publicCode') || '')}`);
  return { ok: true, message: 'Foto guardada en WebP.' };
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
    whatsappPhone = normalizePhoneNumber(String(formData.get('whatsapp') || '') || String(formData.get('phone') || ''), String(formData.get('whatsapp') || '').trim() ? whatsappCountry as CountryCode : phoneCountry as CountryCode);
    if (!rescuePhone || !whatsappPhone) return { ok: false, message: 'Escribe un teléfono válido con lada internacional.' };
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

export async function deletePet(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const confirmation = String(formData.get('confirmation') || '').trim().toUpperCase();
  if (!petId || formData.get('confirmDelete') !== 'on') return { ok: false, message: 'Confirma que deseas eliminar esta mascota.' };
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Inicia sesión para eliminar esta mascota.' };
  const [{ data: pet }, { data: code }, { data: reports }, { data: healthDocuments, error: healthDocumentsError }] = await Promise.all([
    supabase.from('pets').select('name,primary_photo_path').eq('id', petId).eq('owner_id', user.id).maybeSingle(),
    supabase.from('public_code_reservations').select('code').eq('pet_id', petId).maybeSingle(),
    supabase.from('lost_pet_reports').select('recent_photo_path').eq('pet_id', petId),
    supabase.from('pet_health_documents').select('storage_path').eq('pet_id', petId),
  ]);
  if (!pet || !code || confirmation !== code.code) return { ok: false, message: 'El código de confirmación no coincide con esta mascota.' };
  if (healthDocumentsError) return { ok: false, message: 'No pudimos preparar la limpieza de los documentos de salud.' };

  const admin = createAdminClient();
  const primaryPhoto = pet.primary_photo_path;
  const lostPhotos = (reports || []).map((report) => report.recent_photo_path).filter((path): path is string => Boolean(path));
  const healthDocumentPaths = (healthDocuments || []).map((document) => document.storage_path);
  if ((primaryPhoto || lostPhotos.length) && !admin) return { ok: false, message: 'Falta configurar la clave privada de servidor para limpiar sus archivos.' };
  if (healthDocumentPaths.length) {
    const { error } = await supabase.storage.from('pet-health-documents').remove(healthDocumentPaths);
    if (error) return { ok: false, message: 'No pudimos quitar los documentos de salud; no eliminamos la ficha.' };
  }
  if (admin && primaryPhoto) {
    const { error } = await admin.storage.from('pet-photos').remove([primaryPhoto]);
    if (error) return { ok: false, message: 'No pudimos quitar la foto de esta mascota; no eliminamos su ficha.' };
  }
  if (admin && lostPhotos.length) {
    const { error } = await admin.storage.from('lost-pet-photos').remove(lostPhotos);
    if (error) return { ok: false, message: 'No pudimos quitar las fotos de búsqueda; no eliminamos la ficha.' };
  }

  const { error } = await supabase.from('pets').delete().eq('id', petId).eq('owner_id', user.id);
  if (error) return { ok: false, message: 'Los archivos se limpiaron, pero no se pudo eliminar la ficha. Vuelve a intentarlo.' };
  revalidatePath('/mascotas');
  return { ok: true, message: 'Eliminamos la ficha y reservamos su código para que nunca vuelva a asignarse.' };
}
