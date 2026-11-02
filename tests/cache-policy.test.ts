import { describe, expect, it } from 'vitest';
import { shouldDisableResponseCaching } from '../src/lib/supabase/cache-policy';

describe('shouldDisableResponseCaching', () => {
  it.each([
    ['/cuenta', true],
    ['/cuenta/mascotas', true],
    ['/mascotas', true],
    ['/mascotas/abc/carnet', true],
    ['/p/PC-63L3ET', true],
    ['/perdidas', true],
    ['/perdidas/PC-63L3ET', true],
    ['/auth/callback', true],
    ['/auth/reset-password', true],
    ['/', false],
    ['/robots.txt', false],
    ['/sitemap.xml', false],
    ['/perdidas-extra', false],
  ])('returns %s cache policy as %s', (pathname, expected) => {
    expect(shouldDisableResponseCaching(pathname)).toBe(expected);
  });
});
