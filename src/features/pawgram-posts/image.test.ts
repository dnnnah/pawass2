import { expect, it } from 'vitest';
import sharp from 'sharp';
import { socialWebp } from './image';
it('decodifica y convierte a WebP eliminando EXIF y GPS', async () => {
  const input = await sharp({ create: { width: 12, height: 8, channels: 3, background: '#176986' } }).jpeg().withExif({ IFD0: { Artist: 'Dato privado' } }).toBuffer();
  const output = await socialWebp(input);
  const meta = await sharp(output).metadata();
  expect(meta.format).toBe('webp'); expect(meta.width).toBe(12); expect(meta.height).toBe(8);
  expect(meta.exif).toBeUndefined(); expect(meta.xmp).toBeUndefined();
});
it('rechaza bytes falsos, tamaño excesivo y SVG', async () => {
  await expect(socialWebp(Buffer.from('no soy una foto'))).rejects.toThrow();
  await expect(socialWebp(Buffer.alloc(10 * 1024 * 1024 + 1))).rejects.toThrow();
  await expect(socialWebp(Buffer.from('<svg width="10" height="10"></svg>'))).rejects.toThrow();
});
