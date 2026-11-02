import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './server';
import { signPhotoPaths } from './photo-url-mapping';

type PhotoBucket = 'pet-photos' | 'lost-pet-photos';
type PhotoStorageClient = Pick<SupabaseClient, 'storage'>;

export async function createPhotoUrl(bucket: PhotoBucket, path: string | null | undefined, client?: PhotoStorageClient) {
  if (!path) return null;
  const urls = await createPhotoUrls(bucket, [path], client);
  return urls.get(path) || null;
}

export async function createPhotoUrls(
  bucket: PhotoBucket,
  paths: readonly (string | null | undefined)[],
  client?: PhotoStorageClient,
) {
  const storageClient = client || await createClient();
  if (!storageClient) return new Map<string, string>();
  return signPhotoPaths(paths, (uniquePaths, expiresInSeconds) =>
    storageClient.storage.from(bucket).createSignedUrls(uniquePaths, expiresInSeconds),
  );
}
