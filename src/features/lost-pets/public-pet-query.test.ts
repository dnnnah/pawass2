import { describe, expect, it, vi } from 'vitest';
import { getPublicLostPet } from './public-queries';

describe('consulta de ficha pública de pérdida', () => {
  it('conserva el error de lectura como no disponible y no como ausencia de mascota', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: new Error('timeout') });

    await expect(getPublicLostPet({ rpc } as never, 'PC-AB2345')).resolves.toEqual({ status: 'unavailable' });
  });

  it('distingue un código sin alerta de una lectura fallida', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });

    await expect(getPublicLostPet({ rpc } as never, 'PC-AB2345')).resolves.toEqual({ status: 'missing' });
  });
});
