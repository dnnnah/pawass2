import 'server-only';

import { createAdminClient } from './server';

export async function createPhotoUrl(bucket: 'pet-photos' | 'lost-pet-photos', path: string | null | undefined) {
  if (!path) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}
