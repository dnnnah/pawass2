import { describe, expect, it } from 'vitest';
import { isScopedStagingPath } from './upload-path';

const owner = '11111111-1111-4111-8111-111111111111';
const pet = '22222222-2222-4222-8222-222222222222';
const upload = '33333333-3333-4333-8333-333333333333';

describe('rutas de carga temporal', () => {
  it('acepta solo el archivo de staging generado para esa cuenta y recurso', () => {
    expect(isScopedStagingPath(`staging/${owner}/${pet}/${upload}.webp`, owner, pet, ['webp'])).toBe(true);
    expect(isScopedStagingPath(`staging/${owner}/${pet}/${upload}.pdf`, owner, pet, ['webp'])).toBe(false);
    expect(isScopedStagingPath(`staging/${owner}/${pet}/foto.webp`, owner, pet, ['webp'])).toBe(false);
  });

  it('rechaza rutas con traversal o asociadas a otra cuenta o recurso', () => {
    expect(isScopedStagingPath(`staging/${owner}/${pet}/../${upload}.webp`, owner, pet, ['webp'])).toBe(false);
    expect(isScopedStagingPath(`staging/${owner}/${pet}/${upload}.webp`, '44444444-4444-4444-8444-444444444444', pet, ['webp'])).toBe(false);
    expect(isScopedStagingPath(`staging/${owner}/${pet}/${upload}.webp`, owner, '55555555-5555-4555-8555-555555555555', ['webp'])).toBe(false);
  });
});
