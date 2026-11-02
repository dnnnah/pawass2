import { describe, expect, it } from 'vitest';
import { getPublicPetViewHref } from '../src/features/pets/pet-card-domain';

describe('enlace de vista pública de mascota', () => {
  it('abre la ficha de búsqueda cuando la alerta de pérdida está activa', () => {
    expect(getPublicPetViewHref('PC-AB2345', true)).toBe('/perdidas/PC-AB2345');
  });

  it('abre la ficha QR de rescate cuando no hay una pérdida activa', () => {
    expect(getPublicPetViewHref('PC-AB2345', false)).toBe('/p/PC-AB2345');
  });

  it('codifica el código al construir una ruta pública', () => {
    expect(getPublicPetViewHref('PC / 1', true)).toBe('/perdidas/PC%20%2F%201');
  });
});
