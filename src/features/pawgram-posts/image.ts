import sharp from 'sharp';
export const MAX_SOCIAL_BYTES = 10 * 1024 * 1024;
export async function socialWebp(input: Buffer): Promise<Buffer> {
  if (!input.length || input.length > MAX_SOCIAL_BYTES) throw new Error('Elige una foto de hasta 10 MB.');
  const image = sharp(input, { limitInputPixels: 40_000_000, failOn: 'warning' });
  const meta = await image.metadata();
  if (!['jpeg', 'png', 'webp', 'heif'].includes(meta.format || '') || (meta.pages || 1) > 1) throw new Error('Usa una foto JPEG, PNG, WebP o AVIF sin animación.');
  // No keepMetadata/withMetadata: sharp strips EXIF, GPS, XMP and ICC.
  const output = await image.autoOrient().webp({ quality: 80 }).toBuffer();
  if (output.length > MAX_SOCIAL_BYTES) throw new Error('La foto convertida supera 10 MB. Elige una más pequeña.');
  return output;
}
