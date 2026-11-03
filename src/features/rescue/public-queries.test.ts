import { describe, expect, it, vi } from 'vitest';
import { getPublicRescueData } from './public-queries';

const emptyResults = () => ({ data: [], error: null });

describe('consulta pública de la ficha QR', () => {
  it('marca la ficha como no disponible si falla cualquiera de sus lecturas', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: null, error: new Error('timeout') })
      .mockResolvedValue(emptyResults());

    await expect(getPublicRescueData({ rpc } as never, 'PC-AB2345')).resolves.toEqual({ status: 'unavailable' });
  });

  it('reserva el 404 para un código válido sin mascota publicada', async () => {
    const rpc = vi.fn().mockResolvedValue(emptyResults());

    await expect(getPublicRescueData({ rpc } as never, 'PC-AB2345')).resolves.toEqual({ status: 'missing' });
  });

  it('devuelve solo la proyección pública y sus estados autorizados', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: [{ pet_name: 'Mora', species: 'gato', rescue_phone: '+12025550101', whatsapp_phone: '+12025550101' }], error: null })
      .mockResolvedValueOnce({ data: [{ category: 'cuidado', label: 'Ejemplo', severity: 'informative', instructions: 'Texto público' }], error: null })
      .mockResolvedValueOnce({ data: [{ lost: false, recovered_at: null }], error: null })
      .mockResolvedValueOnce({ data: [{ photo_path: 'owner/pet/photo.webp' }], error: null });

    await expect(getPublicRescueData({ rpc } as never, 'PC-AB2345')).resolves.toMatchObject({
      status: 'found',
      pet: { pet_name: 'Mora' },
      careAlerts: [{ label: 'Ejemplo' }],
      rescueStatus: { lost: false },
      photoPath: 'owner/pet/photo.webp',
    });
  });
});
