const MAX_WEBP_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2000;

export async function convertImageToWebp(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) throw new Error('Elige una fotografía válida.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No pudimos preparar la fotografía.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
    (value) => value ? resolve(value) : reject(new Error('No pudimos convertir la fotografía.')),
    'image/webp',
    0.8,
  ));
  if (blob.size > MAX_WEBP_SIZE) throw new Error('La fotografía comprimida debe pesar menos de 5 MB.');
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
  return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
}
