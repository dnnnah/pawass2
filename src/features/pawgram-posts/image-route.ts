import { createClient, createAdminClient } from '@/lib/supabase/server';
import { socialImageResponse } from '@/features/pawgram-posts/image-response';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createClient();
  const privateView = new URL(request.url).searchParams.get('privada') === '1';
  const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  const resolve = async () => {
    if (!db || !validId) return null;
    if (privateView) { const { data: { user } } = await db.auth.getUser(); if (!user) return null; }
    const { data, error } = await db.rpc('pawgram_photo_path', { p_asset: id, p_private: privateView });
    if (error) throw new Error('Image authorization unavailable');
    return typeof data === 'string' ? data : null;
  };
  return socialImageResponse(resolve, async (path) => {
    // Privileged access is limited to bytes already authorized by the caller's
    // DB projection, checked again after download. Never return a Storage URL.
    const admin = createAdminClient();
    if (!admin) throw new Error('Storage unavailable');
    const { data, error } = await admin.storage.from('pawgram-photos').download(path);
    if (error) throw error;
    return data;
  });
}
