'use server';
import { revalidatePath } from 'next/cache';
import { socialSession } from '@/features/pawgram-profiles/server';
import type { SocialState } from '@/features/pawgram-profiles/actions';
import { validatePost } from './domain';
import { MAX_SOCIAL_BYTES } from './image';
import { storeSocialPhoto, retireSocialPhoto, cleanSocialPhotos } from './assets';
export async function createPost(_state: SocialState, form: FormData): Promise<SocialState> {
  let asset: string | null = null;
  try {
    const { db, user } = await socialSession();
    const petId = String(form.get('petId') || '');
    const { data: profile } = await db.from('pawgram_profiles').select('pet_id,published,restriction_reason').eq('pet_id', petId).eq('owner_id', user.id).maybeSingle();
    if (!profile?.published || profile.restriction_reason) return { ok: false, message: 'Publica primero un perfil sin restricciones.' };
    const { body, alt } = validatePost(String(form.get('body') || ''), String(form.get('alt') || ''));
    const photo = form.get('photo');
    if (!(photo instanceof File) || !photo.size || photo.size > MAX_SOCIAL_BYTES) return { ok: false, message: 'Elige una foto de hasta 10 MB.' };
    asset = await storeSocialPhoto(Buffer.from(await photo.arrayBuffer()), user.id, petId);
    const { error } = await db.rpc('pawgram_create_post', { p_id: crypto.randomUUID(), p_pet: petId, p_photo: asset, p_body: body, p_alt: alt });
    if (error) { await retireSocialPhoto(asset); return { ok: false, message: 'No se publicó la foto. Revisa que el perfil siga activo.' }; }
    revalidatePath('/pawgram', 'layout'); revalidatePath(`/mascotas/${petId}/pawgram`);
    await cleanSocialPhotos();
    return { ok: true, message: 'Foto publicada.' };
  } catch { if (asset) await retireSocialPhoto(asset); return { ok: false, message: 'No pudimos publicar. Revisa los textos y usa una foto válida de hasta 10 MB.' }; }
}
export async function editPost(_state: SocialState, form: FormData): Promise<SocialState> {
  try {
    const { db } = await socialSession();
    const { body, alt } = validatePost(String(form.get('body') || ''), String(form.get('alt') || ''));
    const { error } = await db.rpc('pawgram_edit_post', { p_id: String(form.get('postId') || ''), p_body: body, p_alt: alt });
    if (error) return { ok: false, message: 'No pudimos editar esta publicación.' };
    revalidatePath('/pawgram', 'layout'); revalidatePath('/mascotas', 'layout');
    return { ok: true, message: 'Textos guardados. La foto y las restricciones se conservan.' };
  } catch { return { ok: false, message: 'Revisa los textos e inicia sesión para guardar.' }; }
}
export async function deletePost(_state: SocialState, form: FormData): Promise<SocialState> {
  if (form.get('confirmDelete') !== 'on') return { ok: false, message: 'Confirma la eliminación de la publicación.' };
  try {
    const { db } = await socialSession();
    const { error } = await db.rpc('pawgram_delete_post', { p_id: String(form.get('postId') || '') });
    if (error) return { ok: false, message: 'No pudimos eliminar esta publicación.' };
    const cleaned = await cleanSocialPhotos();
    revalidatePath('/pawgram', 'layout'); revalidatePath('/mascotas', 'layout');
    return { ok: true, message: cleaned ? 'Publicación, foto y patitas eliminadas.' : 'Publicación retirada. La limpieza de su archivo queda pendiente y se reintentará.' };
  } catch { return { ok: false, message: 'Inicia sesión e inténtalo de nuevo.' }; }
}
