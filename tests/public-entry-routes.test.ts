import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { createClient, exchangeCode } = vi.hoisted(() => ({
  createClient: vi.fn(),
  exchangeCode: vi.fn(),
}));
// Only the external session/data client is replaced; handlers run unchanged.
vi.mock('@/lib/supabase/server', () => ({ createClient }));
vi.mock('@/lib/supabase/env', () => ({ getSiteUrl: () => 'https://pawpass.example' }));

import { GET } from '../src/app/auth/callback/route';
import sitemap from '../src/app/sitemap';

beforeEach(() => { vi.resetAllMocks(); });

describe('callback de acceso', () => {
  it('devuelve un callback incompleto al formulario dedicado', async () => {
    createClient.mockResolvedValue(null);
    const response = await GET(new NextRequest('https://pawpass.example/auth/callback'));
    expect(response.headers.get('location')).toBe('https://pawpass.example/acceso?auth=error');
  });

  it('conserva el cambio de contraseña como destino tras un intercambio válido', async () => {
    createClient.mockResolvedValue({ auth: { exchangeCodeForSession: exchangeCode } });
    exchangeCode.mockResolvedValue({ error: null });
    const response = await GET(new NextRequest('https://pawpass.example/auth/callback?code=prueba&next=/auth/reset-password'));
    expect(exchangeCode).toHaveBeenCalledWith('prueba');
    expect(response.headers.get('location')).toBe('https://pawpass.example/auth/reset-password');
  });

  it('rechaza un destino externo aunque el intercambio sea válido', async () => {
    createClient.mockResolvedValue({ auth: { exchangeCodeForSession: exchangeCode } });
    exchangeCode.mockResolvedValue({ error: null });
    const response = await GET(new NextRequest('https://pawpass.example/auth/callback?code=prueba&next=https://otro.example'));
    expect(response.headers.get('location')).toBe('https://pawpass.example/mascotas');
  });
});

describe('sitemap público', () => {
  it('conserva portada y tablón incluso sin conexión de datos', async () => {
    createClient.mockResolvedValue(null);
    const entries = await sitemap();
    expect(entries.map(entry => entry.url)).toEqual(['https://pawpass.example/', 'https://pawpass.example/perdidas']);
  });

  it('solo añade los códigos de búsqueda públicos del RPC', async () => {
    createClient.mockResolvedValue({ rpc: vi.fn().mockResolvedValue({ data: [{ public_code: 'DEMO', lost_at: '2026-11-01' }] }) });
    const entries = await sitemap();
    expect(entries.map(entry => entry.url)).toEqual(['https://pawpass.example/', 'https://pawpass.example/perdidas', 'https://pawpass.example/perdidas/DEMO']);
  });
});
