import { describe, expect, it } from 'vitest';
import { validateRegistrationPassword } from '../src/features/auth/domain';

describe('registration password requirements', () => {
  it('rejects matching passwords that are too short', () => {
    expect(validateRegistrationPassword('abc123', 'abc123').ok).toBe(false);
  });
  it('accepts a matching password at the minimum length', () => {
    expect(validateRegistrationPassword('abc12345', 'abc12345')).toEqual({ ok: true });
  });
  it('rejects a mismatch even when both passwords have enough characters', () => {
    expect(validateRegistrationPassword('abc12345', 'abc12346')).toEqual({ ok: false, error: 'Las contraseñas no coinciden.' });
  });
  it('accepts the maximum length and rejects a longer password', () => {
    expect(validateRegistrationPassword('a'.repeat(72), 'a'.repeat(72)).ok).toBe(true);
    expect(validateRegistrationPassword('a'.repeat(73), 'a'.repeat(73)).ok).toBe(false);
  });
});
