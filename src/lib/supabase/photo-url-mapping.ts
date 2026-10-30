export type SignedPhotoResult = { path: string | null; signedUrl: string | null; error: string | null };

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
