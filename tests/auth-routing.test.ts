import { describe, expect, it } from 'vitest';
import { getAuthRedirectPath, getBrandHomePath } from '../src/lib/supabase/auth-routing';

describe('auth route redirects', () => {
  it('sends unauthenticated requests for private pages to sign in', () => {
    expect(getAuthRedirectPath('/mascotas', false)).toBe('/acceso');
    expect(getAuthRedirectPath('/mascotas/abc/carnet', false)).toBe('/acceso');
    expect(getAuthRedirectPath('/cuenta', false)).toBe('/acceso');
  });

  it('sends authenticated visitors away from sign in to their pets', () => {
    expect(getAuthRedirectPath('/acceso', true)).toBe('/mascotas');
  });

  it('keeps the public home reachable from the brand with either session state', () => {
    expect(getBrandHomePath()).toBe('/');
  });

  it('leaves public pages and matching authenticated pages alone', () => {
    expect(getAuthRedirectPath('/perdidas', false)).toBeNull();
    expect(getAuthRedirectPath('/p/PC-AB2345', false)).toBeNull();
    expect(getAuthRedirectPath('/mascotas', true)).toBeNull();
    expect(getAuthRedirectPath('/', false)).toBeNull();
    expect(getAuthRedirectPath('/', true)).toBeNull();
    expect(getAuthRedirectPath('/auth/reset-password', true)).toBeNull();
    expect(getAuthRedirectPath('/acceso', false)).toBeNull();
    expect(getAuthRedirectPath('/mascotas-extra', false)).toBeNull();
  });
});
