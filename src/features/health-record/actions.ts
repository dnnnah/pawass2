'use server';

import { revalidatePath } from 'next/cache';
import type { FormState } from '@/features/profile/actions';
import { createClient } from '@/lib/supabase/server';
import {
  isDateOnly,
  normalizeHealthDocument,
  normalizeHealthRecord,
  normalizeProcedure,
  validateDocumentPayload,
} from './domain';

const DOCUMENT_BUCKET = 'pet-health-documents';
const DOCUMENT_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function saveHealthRecord(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const recordId = String(formData.get('recordId') || '');
  const kind = String(formData.get('kind') || '');
  if (kind !== 'vaccination' && kind !== 'deworming') return { ok: false, message: 'Elige una categoría válida.' };
  const validation = normalizeHealthRecord({
    kind,
    petId,
    catalogId: String(formData.get('catalogId') || ''),
    label: String(formData.get('label') || ''),
    administeredOn: String(formData.get('administeredOn') || ''),
    nextDoseDate: String(formData.get('nextDoseDate') || ''),
    nextDoseConfirmed: formData.get('nextDoseConfirmed') === 'on',
    lot: String(formData.get('lot') || ''),
    veterinarian: String(formData.get('veterinarian') || ''),
    notes: String(formData.get('notes') || ''),
  });
  if (!validation.ok) return { ok: false, message: validation.error };
  if (recordId && !isUuid(recordId)) return { ok: false, message: 'No se pudo identificar el registro.' };

  const auth = await getOwnerClient(petId);
  if (!auth.ok) return auth;
  const { supabase } = auth;
  const record = validation.value;
  const values = {
    pet_id: petId,
    record_type: record.kind,
    catalog_id: record.catalogId,
    label: record.label,
    administered_on: record.administeredOn,
    next_dose_date: record.nextDoseDate,
    lot: record.lot,
    veterinarian: record.veterinarian,
    notes: record.notes,
    updated_at: new Date().toISOString(),
  };
  const result = recordId
    ? await supabase.from('pet_health_records').update(values).eq('id', recordId).eq('pet_id', petId).select('id').maybeSingle()
    : await supabase.from('pet_health_records').insert(values).select('id').single();
  if (result.error || !result.data) return { ok: false, message: 'No pudimos guardar el registro. Revisa que la mascota te pertenezca e intenta de nuevo.' };
  revalidateHealthViews(petId);
  return { ok: true, message: recordId ? 'Actualizamos el registro.' : 'Guardamos el registro.' };
}

export async function saveProcedure(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const recordId = String(formData.get('recordId') || '');
  const validation = normalizeProcedure({
    name: String(formData.get('name') || ''),
    performedOn: String(formData.get('performedOn') || ''),
    notes: String(formData.get('notes') || ''),
  });
  if (!validation.ok) return { ok: false, message: validation.error };
  if (!isUuid(petId) || (recordId && !isUuid(recordId))) return { ok: false, message: 'No se pudo identificar el registro.' };

  const auth = await getOwnerClient(petId);
  if (!auth.ok) return auth;
  const values = {
    pet_id: petId,
    record_type: 'procedure',
    catalog_id: null,
    label: validation.value.name,
    administered_on: validation.value.performedOn,
    next_dose_date: null,
    lot: null,
    veterinarian: null,
    notes: validation.value.notes,
    updated_at: new Date().toISOString(),
  };
  const result = recordId
    ? await auth.supabase.from('pet_health_records').update(values).eq('id', recordId).eq('pet_id', petId).eq('record_type', 'procedure').select('id').maybeSingle()
    : await auth.supabase.from('pet_health_records').insert(values).select('id').single();
  if (result.error || !result.data) return { ok: false, message: 'No pudimos guardar la cirugía o intervención.' };
  revalidateHealthViews(petId);
  return { ok: true, message: recordId ? 'Actualizamos la intervención.' : 'Guardamos la intervención.' };
}

export async function deleteHealthRecord(formData: FormData): Promise<void> {
  const petId = String(formData.get('petId') || '');
  const recordId = String(formData.get('recordId') || '');
  if (!isUuid(petId) || !isUuid(recordId)) return;
  const auth = await getOwnerClient(petId);
  if (!auth.ok) return;
  await auth.supabase.from('pet_health_records').delete().eq('id', recordId).eq('pet_id', petId);
  revalidateHealthViews(petId);
}

export async function uploadHealthDocument(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const file = formData.get('file');
  if (!isUuid(petId) || !(file instanceof File) || file.size === 0) return { ok: false, message: 'Elige un documento para subir.' };
  if (file.size > 10 * 1024 * 1024) return { ok: false, message: 'El documento debe pesar 10 MB o menos.' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!validateDocumentPayload(file.type, file.size, bytes)) {
    return { ok: false, message: 'El archivo debe ser PDF, JPEG, PNG o WebP válido y no superar 10 MB.' };
  }
  const validation = normalizeHealthDocument({
    category: String(formData.get('category') || ''),
    label: String(formData.get('label') || ''),
    fileName: file.name,
  });
  if (!validation.ok) return { ok: false, message: validation.error };
  const documentDate = String(formData.get('documentDate') || '');
  const notes = String(formData.get('notes') || '').trim();
  if (documentDate && !isDateOnly(documentDate)) return { ok: false, message: 'La fecha del documento no es válida.' };
  if (notes.length > 1000) return { ok: false, message: 'Las notas deben tener 1000 caracteres o menos.' };

  const auth = await getOwnerClient(petId);
  if (!auth.ok) return auth;
  const id = crypto.randomUUID();
  const storagePath = `${auth.user.id}/${petId}/${id}.${DOCUMENT_EXTENSION[file.type]}`;
  const values = {
    id,
    pet_id: petId,
    category: validation.value.category,
    label: validation.value.label,
    storage_path: storagePath,
    original_filename: validation.value.fileName,
    mime_type: file.type,
    size_bytes: file.size,
    document_date: documentDate || null,
    notes: notes || null,
  };
  const { error: insertError } = await auth.supabase.from('pet_health_documents').insert(values);
  if (insertError) return { ok: false, message: 'No pudimos preparar el documento para guardarlo.' };

  const { error: uploadError } = await auth.supabase.storage.from(DOCUMENT_BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    await auth.supabase.from('pet_health_documents').delete().eq('id', id).eq('pet_id', petId);
    return { ok: false, message: 'No pudimos subir el documento. Comprueba tu conexión e inténtalo de nuevo.' };
  }

  revalidateHealthViews(petId);
  return { ok: true, message: 'Documento guardado de forma privada.' };
}

export async function updateHealthDocument(_previous: FormState, formData: FormData): Promise<FormState> {
  const petId = String(formData.get('petId') || '');
  const documentId = String(formData.get('documentId') || '');
  if (!isUuid(petId) || !isUuid(documentId)) return { ok: false, message: 'No se pudo identificar el documento.' };
  const validation = normalizeHealthDocument({
    category: String(formData.get('category') || ''),
    label: String(formData.get('label') || ''),
    fileName: String(formData.get('fileName') || ''),
  });
  if (!validation.ok) return { ok: false, message: validation.error };
  const documentDate = String(formData.get('documentDate') || '');
  const notes = String(formData.get('notes') || '').trim();
  if (documentDate && !isDateOnly(documentDate)) return { ok: false, message: 'La fecha del documento no es válida.' };
  if (notes.length > 1000) return { ok: false, message: 'Las notas deben tener 1000 caracteres o menos.' };
  const auth = await getOwnerClient(petId);
  if (!auth.ok) return auth;
  const { data, error } = await auth.supabase.from('pet_health_documents').update({
    category: validation.value.category,
    label: validation.value.label,
    document_date: documentDate || null,
    notes: notes || null,
  }).eq('id', documentId).eq('pet_id', petId).select('id').maybeSingle();
  if (error || !data) return { ok: false, message: 'No pudimos actualizar el documento.' };
  revalidateHealthViews(petId);
  return { ok: true, message: 'Actualizamos la clasificación del documento.' };
}

export async function deleteHealthDocument(formData: FormData): Promise<void> {
  const petId = String(formData.get('petId') || '');
  const documentId = String(formData.get('documentId') || '');
  if (!isUuid(petId) || !isUuid(documentId)) return;
  const auth = await getOwnerClient(petId);
  if (!auth.ok) return;
  const { data: document } = await auth.supabase.from('pet_health_documents')
    .select('storage_path').eq('id', documentId).eq('pet_id', petId).maybeSingle();
  if (!document) return;
  const { error: storageError } = await auth.supabase.storage.from(DOCUMENT_BUCKET).remove([document.storage_path]);
  if (storageError) return;
  await auth.supabase.from('pet_health_documents').delete().eq('id', documentId).eq('pet_id', petId);
  revalidateHealthViews(petId);
}

async function getOwnerClient(petId: string) {
  if (!isUuid(petId)) return { ok: false as const, message: 'No se pudo identificar a la mascota.' };
  const supabase = await createClient();
  if (!supabase) return { ok: false as const, message: 'Supabase todavía no está configurado.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: 'Inicia sesión para actualizar el carnet.' };
  const { data: pet } = await supabase.from('pets').select('id').eq('id', petId).eq('owner_id', user.id).maybeSingle();
  if (!pet) return { ok: false as const, message: 'No encontramos esta mascota.' };
  return { ok: true as const, supabase, user };
}

function revalidateHealthViews(petId: string) {
  revalidatePath('/mascotas');
  revalidatePath(`/mascotas/${petId}`);
  revalidatePath(`/mascotas/${petId}/carnet`);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
