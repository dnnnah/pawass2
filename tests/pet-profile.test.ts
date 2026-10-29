import { describe, expect, it } from 'vitest';
import { normalizePetDetailsInput, resolveDefaultRescueNumbers } from '../src/features/pets/domain';

describe('optional pet identity details', () => {
  it('accepts either an exact birth date or an approximate age', () => {
    expect(normalizePetDetailsInput({
      breed: 'Mestizo', mixedBreed: '', sex: 'hembra', size: 'mediana', color: 'Negra',
      birthDate: '', approximateYears: '4', approximateMonths: '2', approximateDeclaredAt: '2021-10-28', weightKg: '18',
      microchip: '', ruac: '', sterilized: 'on',
    })).toEqual({ ok: true, value: expect.objectContaining({ approximateYears: 4, approximateMonths: 2, approximateAgeDeclaredAt: '2021-10-28' }) });
    expect(normalizePetDetailsInput({
      breed: '', mixedBreed: '', sex: '', size: '', color: '', birthDate: '2020-05-10',
      approximateYears: '4', approximateMonths: '', approximateDeclaredAt: '', weightKg: '', microchip: '', ruac: '', sterilized: '',
    })).toEqual({ ok: false, error: 'Elige fecha de nacimiento o edad aproximada, no ambas.' });
  });
});

describe('default rescue numbers', () => {
  it('uses the same account number for calls and WhatsApp unless explicitly separated', () => {
    expect(resolveDefaultRescueNumbers('+525512345678', '')).toEqual({
      rescuePhone: '+525512345678', whatsappPhone: '+525512345678',
    });
    expect(resolveDefaultRescueNumbers('+525512345678', '+14155552671')).toEqual({
      rescuePhone: '+525512345678', whatsappPhone: '+14155552671',
    });
  });
});
