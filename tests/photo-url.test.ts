import { describe, expect, it } from 'vitest';
import { mapSignedPhotoUrls } from '../src/lib/supabase/photo-url-mapping';

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
});
