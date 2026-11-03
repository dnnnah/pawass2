import { createAdminClient } from './server';
import { createStagedUploadPath, isScopedStagingPath } from './upload-path';

export async function prepareStagedUpload(bucket: string, ownerId: string, resourceId: string, extension: string) {
  const path = createStagedUploadPath(ownerId, resourceId, extension);
  const admin = createAdminClient();
  if (!path || !admin) return null;
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path, { upsert: false });
  if (error || !data?.token) return null;
  return { path, token: data.token };
}

export async function readStagedUpload(bucket: string, path: string, ownerId: string, resourceId: string, extensions: readonly string[]) {
  if (!isScopedStagingPath(path, ownerId, resourceId, extensions)) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.storage.from(bucket).download(path);
  if (error || !data) return null;
  return { admin, file: data, bytes: Buffer.from(await data.arrayBuffer()) };
}

export async function discardStagedUpload(bucket: string, path: string, ownerId: string, resourceId: string, extensions: readonly string[]) {
  if (!isScopedStagingPath(path, ownerId, resourceId, extensions)) return false;
  const admin = createAdminClient();
  if (!admin) return false;
  const { error } = await admin.storage.from(bucket).remove([path]);
  return !error;
}
