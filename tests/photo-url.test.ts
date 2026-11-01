import { describe, expect, it } from 'vitest';
import { mapSignedPhotoUrls, signPhotoPaths } from '../src/lib/supabase/photo-url-mapping';

describe('signed photo URL mapping', () => {
  it('maps batch results by storage path and ignores failed objects', () => {
    expect(mapSignedPhotoUrls(['pets/a.webp', 'pets/b.webp'], [
      { path: 'pets/b.webp', signedUrl: 'https://storage.example/b', error: null },
      { path: 'pets/a.webp', signedUrl: null, error: 'missing' },
    ])).toEqual(new Map([['pets/b.webp', 'https://storage.example/b']]));
  });

  it('returns no entries for an empty batch', () => {
    expect(mapSignedPhotoUrls([], [])).toEqual(new Map());
  });

  it('signs stored pet photos from the authenticated storage client', async () => {
    const signed = await signPhotoPaths(['owner/pet/luna.webp'], async (paths, expiresInSeconds) => {
      expect(paths).toEqual(['owner/pet/luna.webp']);
      expect(expiresInSeconds).toBe(3600);
      return {
        data: [{ path: 'owner/pet/luna.webp', signedUrl: 'https://storage.example/luna', error: null }],
        error: null,
      };
    });

    expect(signed).toEqual(new Map([['owner/pet/luna.webp', 'https://storage.example/luna']]));
  });
});
