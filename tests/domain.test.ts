import { describe, expect, it } from 'vitest';
import {
  isPublicPetCode,
  normalizePhoneNumber,
  normalizeProfileInput,
  resolveRescueContacts,
  safeRedirectPath,
  validateQuickPetInput,
} from '../src/lib/domain';
import { validatePasswordConfirmation } from '../src/features/auth/domain';

describe('isPublicPetCode', () => {
  it('accepts six unambiguous uppercase characters after the PC prefix', () => {
    expect(isPublicPetCode('PC-AB2345')).toBe(true);
  });

  it('rejects confusing and malformed codes', () => {
    expect(isPublicPetCode('PC-ABO245')).toBe(false);
    expect(isPublicPetCode('pc-AB2345')).toBe(false);
    expect(isPublicPetCode('PC-AB234')).toBe(false);
  });
});

describe('safeRedirectPath', () => {
  it('keeps redirects on the application origin', () => {
    expect(safeRedirectPath('/cuenta?tab=mascotas', 'https://pawpass.example')).toBe('/cuenta?tab=mascotas');
    expect(safeRedirectPath('//evil.example/steal', 'https://pawpass.example')).toBe('/mascotas');
    expect(safeRedirectPath('/\\\\evil.example', 'https://pawpass.example')).toBe('/mascotas');
  });
});

describe('profile and quick-pet input validation', () => {
  it('requires both rescue numbers and normalizes them before storage', () => {
    expect(normalizeProfileInput({
      firstName: ' Ana ',
      surname1: ' Pérez ',
      surname2: '',
      phone: '55 1234 5678',
      phoneCountry: 'MX',
      whatsapp: '+1 415 555 2671',
      whatsappCountry: 'US',
    })).toEqual({
      ok: true,
      value: {
        firstName: 'Ana', surname1: 'Pérez', surname2: null,
        phone: '+525512345678', whatsapp: '+14155552671',
      },
    });
  });

  it('uses the calls phone as WhatsApp by default when no separate WhatsApp number is chosen', () => {
    expect(normalizeProfileInput({
      firstName: 'Ana', surname1: '', surname2: '',
      phone: '55 1234 5678', phoneCountry: 'MX', whatsapp: '', whatsappCountry: '',
    })).toEqual({
      ok: true,
      value: { firstName: 'Ana', surname1: null, surname2: null, phone: '+525512345678', whatsapp: '+525512345678' },
    });
  });

  it('requires explicit privacy acceptance before a pet can be created', () => {
    expect(validateQuickPetInput({ name: 'Luna', species: 'gato', privacyAccepted: false })).toEqual({
      ok: false,
      error: 'Debes aceptar la publicación de la ficha QR para continuar.',
    });
  });
});

describe('password confirmation', () => {
  it('accepts a repeated password only when both entries match', () => {
    expect(validatePasswordConfirmation('MiClaveSegura8', 'MiClaveSegura8')).toEqual({ ok: true });
    expect(validatePasswordConfirmation('MiClaveSegura8', 'MiClaveSegura9')).toEqual({
      ok: false, error: 'Las contraseñas no coinciden.',
    });
  });
});

describe('normalizePhoneNumber', () => {
  it('normalizes Mexican numbers to international E.164', () => {
    expect(normalizePhoneNumber('55 1234 5678', 'MX')).toBe('+525512345678');
  });

  it('rejects numbers that are not valid for the selected country', () => {
    expect(normalizePhoneNumber('123', 'MX')).toBeNull();
  });
});

describe('resolveRescueContacts', () => {
  it('uses current account numbers unless both pet overrides are enabled', () => {
    expect(resolveRescueContacts(
      { phone: '+525512345678', whatsapp: '+525598765432' },
      { enabled: true, phone: '+14155552671', whatsapp: '+14155550123' },
    )).toEqual({ phone: '+14155552671', whatsapp: '+14155550123' });
    expect(resolveRescueContacts(
      { phone: '+525512345678', whatsapp: '+525598765432' },
      { enabled: false, phone: null, whatsapp: null },
    )).toEqual({ phone: '+525512345678', whatsapp: '+525598765432' });
  });
});
