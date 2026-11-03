import { describe, expect, it, vi } from 'vitest';
import { closeReportAndRetirePhoto } from './recovery-cleanup';

describe('consistencia al recuperar una mascota', () => {
  it('cierra la alerta antes de retirar la foto y limpia la referencia después', async () => {
    const events: string[] = [];
    const result = await closeReportAndRetirePhoto({
      async close() { events.push('close'); return true; },
      async removePhoto(path) { events.push(`remove:${path}`); return true; },
      async clearPhotoReference() { events.push('clear-reference'); return true; },
    }, 'reports/photo.webp');

    expect(events).toEqual(['close', 'remove:reports/photo.webp', 'clear-reference']);
    expect(result).toEqual({ status: 'closed', photoCleanup: 'complete' });
  });

  it('mantiene la ruta registrada y saca la foto de acceso público si Storage falla', async () => {
    const clearPhotoReference = vi.fn();
    const result = await closeReportAndRetirePhoto({
      async close() { return true; },
      async removePhoto() { return false; },
      clearPhotoReference,
    }, 'reports/photo.webp');

    expect(result).toEqual({ status: 'closed', photoCleanup: 'pending' });
    expect(clearPhotoReference).not.toHaveBeenCalled();
  });

  it('no borra la foto si la transacción de cierre no se confirmó', async () => {
    const removePhoto = vi.fn();
    const result = await closeReportAndRetirePhoto({
      async close() { return false; },
      removePhoto,
      async clearPhotoReference() { return true; },
    }, 'reports/photo.webp');

    expect(result).toEqual({ status: 'not-closed' });
    expect(removePhoto).not.toHaveBeenCalled();
  });
});
