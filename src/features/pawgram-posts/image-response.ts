const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'same-origin',
};
export async function socialImageResponse(resolve: () => Promise<string | null>, download: (path: string) => Promise<Blob | null>) {
  try {
    const path = await resolve();
    if (!path) return new Response(null, { status: 404, headers });
    const blob = await download(path);
    if (!blob || await resolve() !== path) return new Response(null, { status: 404, headers });
    return new Response(blob, { headers: { ...headers, 'Content-Type': 'image/webp' } });
  } catch { return new Response(null, { status: 503, headers }); }
}
