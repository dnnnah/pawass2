import { describe, expect, it } from 'vitest';
import { getRegistrationPasswordChecks, validateRegistrationPassword } from '../src/features/auth/domain';

describe('registration password requirements', () => {
  it('rejects a short password even with all character types', () => {
    expect(validateRegistrationPassword('Ab1!', 'Ab1!').ok).toBe(false);
  });
  it('accepts a matching password with eight characters and all requirements', () => {
    expect(validateRegistrationPassword('Abcdef1!', 'Abcdef1!')).toEqual({ ok: true });
  });
  it.each(['abcdef1!', 'Abcdefg!', 'Abcdef12', 'Abcdef1 '])('rejects missing character requirements in %s', password => {
    expect(validateRegistrationPassword(password, password).ok).toBe(false);
    expect(getRegistrationPasswordChecks(password).every(check => check.met)).toBe(false);
  });
  it('rejects different valid passwords', () => {
    expect(validateRegistrationPassword('Abcdef1!', 'Abcdef2!')).toEqual({ ok: false, error: 'Las contraseñas no coinciden.' });
  });
  it('accepts 72 characters and rejects more', () => {
    const password = `A1!${'a'.repeat(69)}`;
    expect(validateRegistrationPassword(password, password).ok).toBe(true);
    expect(validateRegistrationPassword(`${password}a`, `${password}a`).ok).toBe(false);
  });
  it('recognizes Spanish uppercase letters', () => {
    expect(validateRegistrationPassword('Ñabcdef1!', 'Ñabcdef1!').ok).toBe(true);
  });
});
