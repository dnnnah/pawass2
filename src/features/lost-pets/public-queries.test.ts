import { describe, expect, it, vi } from 'vitest';
import { getPublicLostPets } from './public-queries';

describe('consulta pública de pérdidas', () => {
  it('distingue un fallo de lectura de una lista vacía', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: new Error('timeout') });

    await expect(getPublicLostPets({ rpc } as never, null)).resolves.toEqual({ ok: false });
    expect(rpc).toHaveBeenCalledWith('get_public_lost_pets', { p_species: null, p_query: null });
  });

  it('conserva una lista vacía cuando la consulta sí terminó correctamente', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });

    await expect(getPublicLostPets({ rpc } as never, 'gato')).resolves.toEqual({ ok: true, pets: [] });
  });
});
