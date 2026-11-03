import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { demoPets } from './domain';

const publicDemoPath = path.join(process.cwd(), 'public', 'demo');

describe('fotografías de la demo', () => {
  it('sirve exactamente cinco imágenes optimizadas con nombres neutros y sin metadatos identificables', async () => {
    const files = (await readdir(publicDemoPath)).sort();
    const images = files.filter((file) => file.endsWith('.webp'));
    const provenanceFiles = files.filter((file) => file.endsWith('.webp.json'));
    expect(images).toEqual(['pet-demo-01.webp', 'pet-demo-02.webp', 'pet-demo-03.webp', 'pet-demo-04.webp', 'pet-demo-05.webp']);
    expect(provenanceFiles).toEqual(images.map((file) => `${file}.json`));
    const metadata = await Promise.all(images.map(async (file) => sharp(await readFile(path.join(publicDemoPath, file))).metadata()));
    expect(metadata.every((image) => image.format === 'webp' && !image.exif && !image.xmp && !image.iptc)).toBe(true);
    const provenance = await Promise.all(provenanceFiles.map(async (file) => JSON.parse(await readFile(path.join(publicDemoPath, file), 'utf8')) as { prompt?: string }));
    expect(provenance.every((entry) => entry.prompt?.startsWith('Origin: User-provided photograph, authorized for use in PawPass demo; identifying source metadata removed.'))).toBe(true);
    expect(provenance.every((entry) => !/\/Users\/|\.jpe?g/i.test(entry.prompt ?? ''))).toBe(true);
    expect(new Set(demoPets.map((pet) => pet.photo))).toEqual(new Set(images.map((file) => `/demo/${file}`)));
  });
});
