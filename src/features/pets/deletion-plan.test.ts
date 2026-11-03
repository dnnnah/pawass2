import { describe, expect, it } from 'vitest';
import { getPetDeletionPlan } from './deletion-plan';

const emptyRead = <T,>(data: T) => ({ data, error: null });

describe('preflight de eliminación de mascota', () => {
  it('detiene la eliminación si no pudo leer los archivos de una alerta', () => {
    const plan = getPetDeletionPlan({
      pet: emptyRead({ name: 'Mora', primary_photo_path: null }),
      code: emptyRead({ code: 'PP-ABC234' }),
      reports: { data: null, error: new Error('timeout') },
      healthDocuments: emptyRead([]),
    });

    expect(plan).toEqual({ status: 'unavailable' });
  });

  it('devuelve todas las rutas cuando las cuatro lecturas terminaron bien', () => {
    const plan = getPetDeletionPlan({
      pet: emptyRead({ name: 'Mora', primary_photo_path: 'owner/pet/profile.webp' }),
      code: emptyRead({ code: 'PP-ABC234' }),
      reports: emptyRead([{ recent_photo_path: 'owner/pet/lost.webp' }]),
      healthDocuments: emptyRead([{ storage_path: 'owner/pet/record.pdf' }]),
    });

    expect(plan).toEqual({
      status: 'ready',
      name: 'Mora',
      publicCode: 'PP-ABC234',
      primaryPhotoPath: 'owner/pet/profile.webp',
      lostPhotoPaths: ['owner/pet/lost.webp'],
      healthDocumentPaths: ['owner/pet/record.pdf'],
    });
  });
});
