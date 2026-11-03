import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import manifest from '@/app/manifest';

const publicPath = (...parts: string[]) => path.join(process.cwd(), 'public', ...parts);
type WorkerEvent = {
  waitUntil?: (promise: Promise<unknown>) => void;
  request?: { url: string; method: string; mode: string };
  respondWith?: (promise: Promise<Response>) => void;
};

describe('PawPass install assets', () => {
  it('serves separately composed square and maskable icons at the required sizes', async () => {
    const appManifest = manifest();
    const anyIcon = appManifest.icons?.find((icon) => icon.purpose === 'any');
    const maskableIcon = appManifest.icons?.find((icon) => icon.purpose === 'maskable');

    expect(anyIcon).toMatchObject({ src: '/pawpass-pwa-icon-512.png', sizes: '512x512', type: 'image/png' });
    expect(maskableIcon).toMatchObject({ src: '/pawpass-pwa-icon-maskable-512.png', sizes: '512x512', type: 'image/png' });
    expect(appManifest).toMatchObject({ display: 'standalone', theme_color: '#176986', start_url: '/' });

    const requiredImages = [
      ['pawpass-pwa-icon-32.png', 32],
      ['pawpass-pwa-icon-48.png', 48],
      ['pawpass-pwa-icon-180.png', 180],
      ['pawpass-pwa-icon-192.png', 192],
      ['pawpass-pwa-icon-512.png', 512],
      ['pawpass-pwa-icon-maskable-512.png', 512],
    ] as const;

    for (const [file, size] of requiredImages) {
      const metadata = await sharp(await readFile(publicPath(file))).metadata();
      expect([metadata.width, metadata.height], file).toEqual([size, size]);
    }
  });

  it('falls back to the offline screen without caching private navigation or auth responses', async () => {
    const workerSource = await readFile(publicPath('service-worker.js'), 'utf8');
    const handlers = new Map<string, (event: WorkerEvent) => void>();
    const entries = new Map<string, Response>();
    const writes: string[] = [];
    const deleted: string[] = [];
    const cache = {
      async addAll(urls: string[]) {
        for (const url of urls) entries.set(url, new Response('offline'));
      },
      async match(request: Request | string) {
        return entries.get(typeof request === 'string' ? request : request.url);
      },
      async put(request: Request, response: Response) {
        writes.push(request.url);
        entries.set(request.url, response);
      },
    };
    const cacheStorage = {
      async open() { return cache; },
      async match(request: Request | string) { return cache.match(request); },
      async keys() { return ['pawpass-shell-v2', 'pawpass-static-v2', 'unrelated-cache']; },
      async delete(key: string) { deleted.push(key); return true; },
    };
    const origin = 'https://pawpass.example';
    const context = {
      self: {
        location: { origin },
        clients: { async claim() {} },
        skipWaiting() {},
        addEventListener(type: string, listener: (event: WorkerEvent) => void) { handlers.set(type, listener); },
      },
      caches: cacheStorage,
      fetch: async (request: Request) => {
        if (new URL(request.url).pathname === '/mascotas') throw new Error('offline');
        if (new URL(request.url).pathname.endsWith('.png')) return new Response('image', { headers: { 'content-type': 'image/png' } });
        return new Response('<html>private</html>', { headers: { 'content-type': 'text/html' } });
      },
      URL,
    };

    const { runInNewContext } = await import('node:vm');
    runInNewContext(workerSource, context);
    await handlers.get('install')?.({ waitUntil: (promise: Promise<unknown>) => promise });
    await handlers.get('activate')?.({ waitUntil: (promise: Promise<unknown>) => promise });

    let offlineResponse: Promise<Response> | undefined;
    handlers.get('fetch')?.({
      request: { url: `${origin}/mascotas`, method: 'GET', mode: 'navigate' },
      respondWith: (promise: Promise<Response>) => { offlineResponse = promise; },
    });
    const navigationResponse = await offlineResponse;

    handlers.get('fetch')?.({
      request: { url: `${origin}/auth/callback?code=private`, method: 'GET', mode: 'same-origin' },
      respondWith: (promise: Promise<Response>) => { offlineResponse = promise; },
    });
    handlers.get('fetch')?.({
      request: { url: `${origin}/pawpass-pwa-icon-maskable-512.png`, method: 'GET', mode: 'no-cors' },
      respondWith: (promise: Promise<Response>) => { offlineResponse = promise; },
    });
    await offlineResponse;

    expect(await navigationResponse?.text()).toBe('offline');
    expect(writes).toEqual([`${origin}/pawpass-pwa-icon-maskable-512.png`]);
    expect(deleted).toEqual(['pawpass-shell-v2', 'pawpass-static-v2']);
  });
});
