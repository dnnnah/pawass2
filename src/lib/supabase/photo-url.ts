import 'server-only';

import { createAdminClient } from './server';
import { mapSignedPhotoUrls } from './photo-url-mapping';

export async function createPhotoUrl(bucket: 'pet-photos' | 'lost-pet-photos', path: string | null | undefined) {
  if (!path) return null;
  const urls = await createPhotoUrls(bucket, [path]);
  return urls.get(path) || null;
}

export async function createPhotoUrls(bucket: 'pet-photos' | 'lost-pet-photos', paths: readonly (string | null | undefined)[]) {
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (!uniquePaths.length) return new Map<string, string>();
  const admin = createAdminClient();
  if (!admin) return new Map<string, string>();
  const { data, error } = await admin.storage.from(bucket).createSignedUrls(uniquePaths, 60 * 60);
  return error || !data ? new Map<string, string>() : mapSignedPhotoUrls(uniquePaths, data);
}
