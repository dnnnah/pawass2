import { expect, it } from 'vitest';
import { socialImageResponse } from './image-response';
it('revoca la misma URL antes de leer Storage y no cachea respuestas', async () => {
  let visible = true; let reads = 0;
  const resolve = async () => visible ? 'photo.webp' : null;
  const download = async () => { reads++; return new Blob(['image'], { type: 'image/webp' }); };
  const response = await socialImageResponse(resolve, download);
  expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toContain('no-store');
  visible = false;
  expect((await socialImageResponse(resolve, download)).status).toBe(404); expect(reads).toBe(1);
});
it('comprueba otra vez la visibilidad después de descargar', async () => {
  let visible = true;
  const response = await socialImageResponse(async () => visible ? 'path' : null, async () => { visible = false; return new Blob(['image']); });
  expect(response.status).toBe(404);
  expect(response.headers.get('Cache-Control')).toContain('no-store');
});
