import { expect, it } from 'vitest';
import { drainPhotos } from './cleanup';
it('conserva la referencia durable si Storage falla y permite reintentar', async () => {
  const pending = new Map([['id', 'id.webp']]); const storage = new Set(['id.webp']);
  let fails = true;
  const port = { retireExpired: async () => {}, list: async () => [...pending].map(([id,path])=>({id,path})), remove: async (path: string) => { if (fails) return false; storage.delete(path); return true; }, acknowledge: async (id: string) => { pending.delete(id); return true; } };
  expect(await drainPhotos(port)).toBe(false); expect(pending.size).toBe(1); expect(storage.size).toBe(1);
  fails = false;
  expect(await drainPhotos(port)).toBe(true); expect(pending.size).toBe(0); expect(storage.size).toBe(0);
  expect(await drainPhotos(port)).toBe(true);
});
