import { describe, expect, it } from 'vitest';
import { getIdentityFromClaims } from '../src/lib/supabase/identity';

describe('verified Supabase identity claims', () => {
  it('extracts the stable user ID and optional email from verified claims', () => {
    expect(getIdentityFromClaims({ sub: 'f1e6f676-238a-4f92-9391-ef34fb236c20', email: 'tutor@example.test' })).toEqual({
      id: 'f1e6f676-238a-4f92-9391-ef34fb236c20',
      email: 'tutor@example.test',
    });
  });

  it('rejects claims without a valid user ID', () => {
    expect(getIdentityFromClaims(null)).toBeNull();
    expect(getIdentityFromClaims({ email: 'tutor@example.test' })).toBeNull();
    expect(getIdentityFromClaims({ sub: 'not-a-user-id' })).toBeNull();
  });

  it('does not treat a non-string email as an email address', () => {
    expect(getIdentityFromClaims({ sub: 'f1e6f676-238a-4f92-9391-ef34fb236c20', email: 7 })).toEqual({
      id: 'f1e6f676-238a-4f92-9391-ef34fb236c20', email: null,
    });
  });
});
