import sharp from 'sharp';

const ACCEPTED_IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp', 'heif', 'avif']);

export async function normalizeUploadedPhoto(input: Buffer, maxBytes: number): Promise<Buffer> {
  if (!input.length || input.length > maxBytes) throw new Error('La fotografía supera el tamaño permitido.');
  const image = sharp(input, { limitInputPixels: 40_000_000, failOn: 'warning' });
  const metadata = await image.metadata();
  if (!ACCEPTED_IMAGE_FORMATS.has(metadata.format || '') || (metadata.pages || 1) > 1) {
    throw new Error('El archivo no es una fotografía válida o contiene animación.');
  }
  const output = await image.autoOrient().resize(2000, 2000, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  if (output.length > maxBytes) throw new Error('La fotografía convertida supera el tamaño permitido.');
  return output;
}
