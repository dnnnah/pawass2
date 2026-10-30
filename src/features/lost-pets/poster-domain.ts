export type PosterFormatId = 'story' | 'feed' | 'a4' | 'letter';

export type PosterFormat = {
  id: PosterFormatId;
  label: string;
  width: number;
  height: number;
  ratio: string;
};

const POSTER_FORMATS: PosterFormat[] = [
  { id: 'story', label: 'Historias y estados', width: 1080, height: 1920, ratio: '9:16' },
  { id: 'feed', label: 'Publicaciones', width: 1440, height: 1800, ratio: '4:5' },
  { id: 'a4', label: 'Papel A4', width: 1275, height: 1800, ratio: 'A4' },
  { id: 'letter', label: 'Papel carta', width: 1275, height: 1650, ratio: 'Carta' },
];

export function getPosterFormats(): PosterFormat[] {
  return POSTER_FORMATS.map((format) => ({ ...format }));
}

export function isPosterReady(input: { active: boolean; photoUrl: string | null; lastSeenLocation: string | null }): boolean {
  return input.active && Boolean(input.photoUrl?.trim()) && Boolean(input.lastSeenLocation?.trim());
}

export function getRescueQrUrl(code: string, siteUrl: string): string {
  return new URL(`/p/${encodeURIComponent(code)}`, siteUrl).toString();
}
