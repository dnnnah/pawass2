'use server';
import { revalidatePath } from 'next/cache';
import { buildSnapshot, publicProfile, type Snapshot } from './domain';
import { socialSession, previewSecret } from './server';
import { signPreview, verifyPreview } from './preview';
import { storeSocialPhoto, retireSocialPhoto, cleanSocialPhotos } from '@/features/pawgram-posts/assets';
import { createPhotoUrl } from '@/lib/supabase/photo-url';
export type SocialState = { ok: boolean; message: string; preview?: ReturnType<typeof publicProfile>; token?: string; photoUrl?: string | null };
type Preview = { petId: string; ownerId: string; snapshot: Snapshot; photoPath: string | null; keepPhoto: string | null };
const failed = (message: string): SocialState => ({ ok: false, message });
export async function prepareProfile(_state: SocialState, form: FormData): Promise<SocialState> {
  try {
    const { db, user } = await socialSession();
    const petId = String(form.get('petId') || '');
    const { data: pet } = await db.from('pets').select('name,species,breed,sex,size,birth_date,approximate_age_years,approximate_age_months,approximate_age_declared_at,primary_photo_path').eq('id', petId).eq('owner_id', user.id).maybeSingle();
    if (!pet) return failed('No encontramos esta mascota.');
    const snapshot = buildSnapshot(pet, { presentation: String(form.get('presentation') || ''), breed: form.has('breed'), sex: form.has('sex'), size: form.has('size'), age: form.has('age') });
    const { data: current } = await db.from('pawgram_profiles').select('photo_id').eq('pet_id', petId).eq('owner_id', user.id).maybeSingle();
    const photoPath = form.get('photo') === 'rescue' ? pet.primary_photo_path : null;
    const keepPhoto = form.get('photo') === 'keep' ? current?.photo_id || null : null;
    const photoUrl = photoPath ? await createPhotoUrl('pet-photos', photoPath, db) : keepPhoto ? `/pawgram/imagenes/${keepPhoto}?privada=1` : null;
    return { ok: true, message: 'Revisa exactamente lo que se publicará.', preview: publicProfile(snapshot), photoUrl, token: signPreview({ petId, ownerId: user.id, snapshot, photoPath, keepPhoto }, previewSecret()) };
  } catch { return failed('No pudimos preparar la vista previa. Revisa la presentación y tu conexión.'); }
}
export async function publishProfile(_state: SocialState, form: FormData): Promise<SocialState> {
  let newPhoto: string | null = null;
  try {
    const { db, user } = await socialSession();
    if (form.get('consent') !== 'on') return failed('Acepta la publicación social después de revisar la vista previa.');
    const preview = verifyPreview<Preview>(String(form.get('token') || ''), previewSecret(), user.id);
    const { data: pet } = await db.from('pets').select('id').eq('id', preview.petId).eq('owner_id', user.id).maybeSingle();
    if (!pet) return failed('No encontramos esta mascota.');
    if (preview.photoPath) {
      const { data: file, error } = await db.storage.from('pet-photos').download(preview.photoPath);
      if (error || !file) return failed('La foto cambió. Prepara otra vista previa.');
      newPhoto = await storeSocialPhoto(Buffer.from(await file.arrayBuffer()), user.id, pet.id);
    }
    const { error } = await db.rpc('pawgram_save_profile', { p_pet: pet.id, p_snapshot: preview.snapshot, p_consent: true, p_photo: newPhoto || preview.keepPhoto });
    if (error) { if (newPhoto) await retireSocialPhoto(newPhoto); return failed('No se publicó. La ficha pudo cambiar; revisa una nueva vista previa.'); }
    revalidatePath('/pawgram', 'layout'); revalidatePath(`/mascotas/${pet.id}/pawgram`);
    await cleanSocialPhotos();
    return { ok: true, message: 'Perfil social actualizado. Las restricciones administrativas, si existen, siguen vigentes.' };
  } catch { if (newPhoto) await retireSocialPhoto(newPhoto); return failed('No se pudo confirmar. Revisa nuevamente la vista previa.'); }
}
export async function hideProfile(_state: SocialState, form: FormData): Promise<SocialState> {
  try {
    const { db } = await socialSession(); const id = String(form.get('petId') || '');
    const { error } = await db.rpc('pawgram_set_published', { p_pet: id, p_published: false });
    if (error) return failed('No pudimos ocultar este perfil.');
    revalidatePath('/pawgram', 'layout'); revalidatePath(`/mascotas/${id}/pawgram`);
    return { ok: true, message: 'Perfil y fotos retirados del acceso público. Conservamos tu contenido y sus patitas.' };
  } catch { return failed('Inicia sesión e inténtalo de nuevo.'); }
}
