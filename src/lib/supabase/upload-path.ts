const UUID_PATTERN = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const EXTENSION_PATTERN = /^[a-z\d]{2,5}$/i;

export function createStagedUploadPath(ownerId: string, resourceId: string, extension: string): string | null {
  if (!UUID_PATTERN.test(ownerId) || !UUID_PATTERN.test(resourceId) || !EXTENSION_PATTERN.test(extension)) return null;
  return `staging/${ownerId}/${resourceId}/${crypto.randomUUID()}.${extension.toLowerCase()}`;
}

export function isScopedStagingPath(path: string, ownerId: string, resourceId: string, extensions: readonly string[]): boolean {
  if (!UUID_PATTERN.test(ownerId) || !UUID_PATTERN.test(resourceId)) return false;
  const parts = path.split('/');
  if (parts.length !== 4 || parts[0] !== 'staging' || parts[1] !== ownerId || parts[2] !== resourceId) return false;
  const [fileId, extension] = parts[3].split('.');
  return Boolean(fileId && extension && UUID_PATTERN.test(fileId) && extensions.some((allowed) => allowed === extension.toLowerCase()));
}
