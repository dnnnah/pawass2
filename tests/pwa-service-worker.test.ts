import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const workerSource = readFileSync('public/service-worker.js', 'utf8');

function createWorker(fetchImplementation: typeof fetch) {
  const listeners = new Map<string, (event: Record<string, unknown>) => void>();
  const stored = new Map<string, Response>();
  const requestUrl = (request: RequestInfo | URL) => {
    const path = typeof request === 'object' && 'url' in request ? request.url : String(request);
    return new URL(path, 'https://pawpass.test').href;
  };
  const cache = {
    addAll: vi.fn(async (paths: string[]) => {
      paths.forEach((path) => stored.set(new URL(path, 'https://pawpass.test').href, new Response('<h1>Sin conexión</h1>')));
    }),
    match: async (request: RequestInfo | URL) => stored.get(requestUrl(request))?.clone(),
    put: async (request: RequestInfo | URL, response: Response) => {
      stored.set(requestUrl(request), response.clone());
    },
  };
  const caches = {
    open: vi.fn(async () => cache),
    match: async (request: RequestInfo | URL) => cache.match(request),
    keys: async () => ['pawpass-shell-v1', 'pawpass-static-v1'],
    delete: vi.fn(async () => true),
  };
  const self = {
    location: { origin: 'https://pawpass.test' },
    addEventListener: (name: string, callback: (event: Record<string, unknown>) => void) => listeners.set(name, callback),
    skipWaiting: vi.fn(async () => undefined),
    clients: { claim: vi.fn(async () => undefined) },
  };

  runInNewContext(workerSource, { self, caches, fetch: fetchImplementation, URL, Response });
  return { listeners, stored, cache };
}

describe('service worker de PawPass', () => {
  it('mantiene en caché el documento offline como único HTML almacenado', async () => {
    const { listeners, stored } = createWorker(vi.fn(async () => new Response('red')) as typeof fetch);
    let install: Promise<void> | undefined;
    listeners.get('install')?.({ waitUntil: (promise: Promise<void>) => { install = promise; } });
    await install;

    expect([...stored.keys()]).toEqual(['https://pawpass.test/offline.html']);
  });

  it('sirve la pantalla offline ante una navegación fallida sin guardar su HTML privado', async () => {
    const fetchOffline = vi.fn(async () => { throw new Error('sin red'); }) as typeof fetch;
    const { listeners, stored } = createWorker(fetchOffline);
    let install: Promise<void> | undefined;
    listeners.get('install')?.({ waitUntil: (promise: Promise<void>) => { install = promise; } });
    await install;

    let responsePromise: Promise<Response> | undefined;
    listeners.get('fetch')?.({
      request: { method: 'GET', mode: 'navigate', url: 'https://pawpass.test/mascotas/privada/carnet' },
      respondWith: (promise: Promise<Response>) => { responsePromise = promise; },
    });
    const response = await responsePromise;

    expect(await response?.text()).toContain('Sin conexión');
    expect([...stored.keys()]).toEqual(['https://pawpass.test/offline.html']);
  });

  it('cachea recursos estáticos del mismo origen sin almacenar archivos firmados', async () => {
    const networkFetch = vi.fn(async () => new Response('bundle', { headers: { 'content-type': 'application/javascript' } })) as typeof fetch;
    const { listeners, stored } = createWorker(networkFetch);
    let responsePromise: Promise<Response> | undefined;
    listeners.get('fetch')?.({
      request: { method: 'GET', mode: 'same-origin', destination: 'script', url: 'https://pawpass.test/_next/static/app.js' },
      respondWith: (promise: Promise<Response>) => { responsePromise = promise; },
    });
    await responsePromise;

    expect([...stored.keys()]).toEqual(['https://pawpass.test/_next/static/app.js']);
  });
});
