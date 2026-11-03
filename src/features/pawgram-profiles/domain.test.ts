import { describe, expect, it } from 'vitest';
import { buildSnapshot, publicProfile, isVisible } from './domain';
const pet = { name: 'Luna', species: 'gato', breed: 'Europeo', sex: 'hembra', size: 'pequena', birth_date: '2020-01-01', approximate_age_years: null, approximate_age_months: null, approximate_age_declared_at: null, rescue_phone: 'secreto', microchip: 'privado' };
describe('perfil autorizado', () => {
  it('no hereda opcionales ni datos privados', () => {
    expect(buildSnapshot(pet, {}, new Date('2026-11-02'))).toEqual({ name: 'Luna', species: 'gato', presentation: null, breed: null, sex: null, size: null, age_months: null, age_as_of: null });
  });
  it('calcula edad aprobada sin entregar su referencia al público', () => {
    const snapshot = buildSnapshot(pet, { age: true, breed: true }, new Date('2026-11-02'));
    const projected = publicProfile(snapshot, new Date('2027-01-02'));
    expect(projected.age).toBe('7 años');
    expect(projected).not.toHaveProperty('age_as_of');
    expect(projected).not.toHaveProperty('age_months');
    expect(projected.breed).toBe('Europeo');
    expect(snapshot.name).toBe('Luna');
  });
  it('rechaza presentación demasiado larga', () => {
    expect(() => buildSnapshot(pet, { presentation: 'a'.repeat(301) })).toThrow();
  });
  it('la restricción de perfil prevalece y republicar no la evade', () => {
    expect(isVisible(true, 'Motivo', null)).toBe(false);
    expect(isVisible(false, null, null)).toBe(false);
    expect(isVisible(true, null, 'Motivo post')).toBe(false);
    expect(isVisible(true, null, null)).toBe(true);
  });
});
