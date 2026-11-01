export type SignedPhotoResult = { path: string | null; signedUrl: string | null; error: string | null };

export type PhotoSigner = (
  paths: string[],
  expiresInSeconds: number,
) => Promise<{ data: readonly SignedPhotoResult[] | null; error: unknown | null }>;

export async function signPhotoPaths(
  paths: readonly (string | null | undefined)[],
  sign: PhotoSigner,
): Promise<Map<string, string>> {
  const uniquePaths = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (!uniquePaths.length) return new Map();
  const { data, error } = await sign(uniquePaths, 60 * 60);
  return error || !data ? new Map() : mapSignedPhotoUrls(uniquePaths, data);
}

export function mapSignedPhotoUrls(
  requestedPaths: readonly (string | null | undefined)[],
  results: readonly SignedPhotoResult[],
): Map<string, string> {
  const requested = new Set(requestedPaths.filter((path): path is string => Boolean(path)));
  return new Map(results.flatMap((result) =>
    result.path && requested.has(result.path) && result.signedUrl && !result.error
      ? [[result.path, result.signedUrl] as const]
      : [],
  ));
}
