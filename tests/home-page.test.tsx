import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient }));
import HomePage from '../src/app/page';

beforeEach(() => { vi.resetAllMocks(); });

describe('entrada pública según identidad verificada', () => {
  it('ofrece registro e inicio de sesión sin conexión de autenticación', async () => {
    createClient.mockResolvedValue(null);
    const html = renderToStaticMarkup(await HomePage());
    expect(html).toContain('href="/acceso?modo=crear"');
    expect(html).toContain('Iniciar sesión');
    expect(html).not.toContain('Ir a mis mascotas');
  });

  it('ofrece el área privada sin serializar los datos de identidad', async () => {
    createClient.mockResolvedValue({ auth: { getClaims: async () => ({ data: { claims: {
      sub: 'f1e6f676-238a-4f92-9391-ef34fb236c20', email: 'privado@example.invalid',
    } } }) } });
    const html = renderToStaticMarkup(await HomePage());
    expect(html).toContain('Ir a mis mascotas');
    expect(html).not.toContain('Crear cuenta');
    expect(html).not.toContain('privado@example.invalid');
    expect(html).not.toContain('f1e6f676-238a-4f92-9391-ef34fb236c20');
  });
});
