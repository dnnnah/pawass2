import { describe, expect, it } from 'vitest';
import { getAuthRedirectPath, getBrandHomePath } from '../src/lib/supabase/auth-routing';

describe('auth route redirects', () => {
  it('sends unauthenticated requests for private pages to sign in', () => {
    expect(getAuthRedirectPath('/mascotas', false)).toBe('/');
    expect(getAuthRedirectPath('/mascotas/abc/carnet', false)).toBe('/');
    expect(getAuthRedirectPath('/cuenta', false)).toBe('/');
  });

  it('sends authenticated visitors away from sign in to their pets', () => {
    expect(getAuthRedirectPath('/', true)).toBe('/mascotas');
  });

  it('sends the brand mark to the pets page for signed-in visitors', () => {
    expect(getBrandHomePath(true)).toBe('/mascotas');
    expect(getBrandHomePath(false)).toBe('/');
  });

  it('leaves public pages and matching authenticated pages alone', () => {
    expect(getAuthRedirectPath('/perdidas', false)).toBeNull();
    expect(getAuthRedirectPath('/p/PC-AB2345', false)).toBeNull();
    expect(getAuthRedirectPath('/mascotas', true)).toBeNull();
    expect(getAuthRedirectPath('/', false)).toBeNull();
  });
});
