import { createAdminClient } from '@/lib/supabase/server';
import { socialWebp } from './image';
const bucket = 'pawgram-photos';
// Only server-validated bytes enter this bucket. No browser upload or signed URL.
export async function storeSocialPhoto(input: Buffer, ownerId: string, petId: string) {
  const bytes = await socialWebp(input);
  const admin = createAdminClient();
  if (!admin) throw new Error('Almacenamiento social no configurado.');
  const id = crypto.randomUUID(); const path = `${id}.webp`;
  const { error: registration } = await admin.from('pawgram_assets').insert({ id, path, owner_id: ownerId, pet_id: petId });
  if (registration) throw new Error('No pudimos preparar la foto.');
  const { error } = await admin.storage.from(bucket).upload(path, bytes, { contentType: 'image/webp', cacheControl: '0', upsert: false });
  if (error) { await retireSocialPhoto(id); throw new Error('No pudimos subir la foto. Inténtalo de nuevo.'); }
  return id;
}
export async function retireSocialPhoto(id: string) {
  const admin = createAdminClient();
  // Never retire active content on a retry whose first request already committed.
  await admin?.from('pawgram_assets').update({ state: 'retired' }).eq('id', id).eq('state', 'pending');
}
export async function cleanSocialPhotos() {
  const admin = createAdminClient();
  if (!admin) return false;
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  // Claim expired uploads atomically; publishing can only activate pending rows.
  await admin.from('pawgram_assets').update({ state: 'retired' }).eq('state', 'pending').lt('created_at', cutoff);
  const { data, error } = await admin.from('pawgram_assets').select('id,path').eq('state', 'retired').limit(100);
  if (error) return false;
  for (const asset of data || []) {
    const { error: removeError } = await admin.storage.from(bucket).remove([asset.path]);
    if (removeError) return false; // Durable row remains for the next attempt.
    const { error: deleteError } = await admin.from('pawgram_assets').delete().eq('id', asset.id).eq('state', 'retired');
    if (deleteError) return false;
  }
  return true;
}
