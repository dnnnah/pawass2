import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { normalizeUploadedPhoto } from './image-server';

describe('normalización segura de fotos subidas', () => {
  it('decodifica y vuelve a codificar la foto como WebP dentro del límite', async () => {
    const png = await sharp({ create: { width: 12, height: 9, channels: 3, background: '#176986' } }).png().toBuffer();
    const normalized = await normalizeUploadedPhoto(png, 1024);

    expect((await sharp(normalized).metadata()).format).toBe('webp');
    expect(normalized.length).toBeLessThanOrEqual(1024);
  });

  it('rechaza documentos disfrazados de imagen y cargas superiores al límite', async () => {
    await expect(normalizeUploadedPhoto(Buffer.from('%PDF-1.7 fake'), 1024)).rejects.toThrow();
    await expect(normalizeUploadedPhoto(Buffer.alloc(1025, 0), 1024)).rejects.toThrow();
  });
});
