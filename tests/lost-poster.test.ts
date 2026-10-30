import { describe, expect, it } from 'vitest';
import { getPosterFormats, isPosterReady, getRescueQrUrl } from '../src/features/lost-pets/poster-domain';

describe('lost poster domain', () => {
  it('only enables the poster when an active loss has a photo and last seen location', () => {
    expect(isPosterReady({ active: true, photoUrl: '/pet.webp', lastSeenLocation: 'Roma Norte' })).toBe(true);
    expect(isPosterReady({ active: true, photoUrl: null, lastSeenLocation: 'Roma Norte' })).toBe(false);
    expect(isPosterReady({ active: true, photoUrl: '/pet.webp', lastSeenLocation: ' ' })).toBe(false);
    expect(isPosterReady({ active: false, photoUrl: '/pet.webp', lastSeenLocation: 'Roma Norte' })).toBe(false);
  });

  it('defines the two social image dimensions and both print page sizes', () => {
    expect(getPosterFormats()).toEqual([
      { id: 'story', label: 'Historias y estados', width: 1080, height: 1920, ratio: '9:16' },
      { id: 'feed', label: 'Publicaciones', width: 1440, height: 1800, ratio: '4:5' },
      { id: 'a4', label: 'Papel A4', width: 1275, height: 1800, ratio: 'A4' },
      { id: 'letter', label: 'Papel carta', width: 1275, height: 1650, ratio: 'Carta' },
    ]);
  });

  it('points the QR to the stable rescue page for the pet code', () => {
    expect(getRescueQrUrl('PC-123456', 'https://pawpass.example')).toBe('https://pawpass.example/p/PC-123456');
  });
});
