import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSiteUrl } from './env';

afterEach(() => vi.unstubAllEnvs());

describe('getSiteUrl', () => {
  it('uses the explicit public origin and removes trailing slashes', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://pawpass.example/');
    expect(getSiteUrl()).toBe('https://pawpass.example');
  });

  it('keeps preview canonicals on the project production domain', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_URL', 'pawpass-git-feat-preview-team.vercel.app');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'pawpass.vercel.app');
    expect(getSiteUrl()).toBe('https://pawpass.vercel.app');
  });

  it('uses the deployment URL if no production domain is available', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_URL', 'pawpass-git-feature-team.vercel.app');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    expect(getSiteUrl()).toBe('https://pawpass-git-feature-team.vercel.app');
  });

  it('keeps localhost as the local development default', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    expect(getSiteUrl()).toBe('http://localhost:3000');
  });
});
