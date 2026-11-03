import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { GET } from './route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

const createClientMock = vi.mocked(createClient);
const previewOrigin = 'https://pawpass-git-feat-vercel-pwa-oauth-team.vercel.app';

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('VERCEL_URL', 'pawpass-git-feat-vercel-pwa-oauth-team.vercel.app');
});
afterEach(() => vi.unstubAllEnvs());

function setExchangeResult(error: { message: string } | null) {
  const exchangeCodeForSession = vi.fn().mockResolvedValue({ error });
  createClientMock.mockResolvedValue({ auth: { exchangeCodeForSession } } as never);
  return exchangeCodeForSession;
}

describe('Supabase Auth callback', () => {
  it('exchanges the code and redirects to the same preview origin and safe local path', async () => {
    const exchangeCodeForSession = setExchangeResult(null);
    const response = await GET(new NextRequest(`${previewOrigin}/auth/callback?code=oauth-code&next=%2Fmascotas`));

    expect(exchangeCodeForSession).toHaveBeenCalledWith('oauth-code');
    expect(response.headers.get('location')).toBe(`${previewOrigin}/mascotas`);
  });

  it('does not redirect outside the preview origin after an unsafe next parameter', async () => {
    setExchangeResult(null);
    const response = await GET(new NextRequest(`${previewOrigin}/auth/callback?code=oauth-code&next=https%3A%2F%2Fevil.example`));

    expect(response.headers.get('location')).toBe(`${previewOrigin}/mascotas`);
  });

  it('returns OAuth failures to the same origin without exposing provider details', async () => {
    setExchangeResult({ message: 'private provider error' });
    const response = await GET(new NextRequest(`${previewOrigin}/auth/callback?code=bad-code`));

    expect(response.headers.get('location')).toBe(`${previewOrigin}/acceso?auth=error`);
    expect(response.headers.get('location')).not.toContain('private provider error');
  });
});
