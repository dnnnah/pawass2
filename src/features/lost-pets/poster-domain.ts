import { parsePhoneNumberFromString } from 'libphonenumber-js';

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

function formatPosterPhone(phone: string): string {
  const parsed = parsePhoneNumberFromString(phone);
  if (!parsed) return phone.trim();
  if (parsed.country === 'MX') return `Lada ${parsed.formatNational()} · +${parsed.countryCallingCode}`;
  return parsed.formatInternational();
}

function formatWhatsAppPhone(phone: string): string {
  return parsePhoneNumberFromString(phone)?.formatInternational() || phone.trim();
}

function normalizedPhone(phone: string): string {
  return parsePhoneNumberFromString(phone)?.number || phone.replace(/\D/g, '');
}

export function getPosterContactInfo(phone: string, whatsappPhone: string | null) {
  const whatsapp = whatsappPhone?.trim() || phone;
  return {
    callNumber: formatPosterPhone(phone),
    whatsappNumber: formatWhatsAppPhone(whatsapp),
    usesSameNumber: normalizedPhone(phone) === normalizedPhone(whatsapp),
  };
}

export function getPosterFormats(): PosterFormat[] {
  return POSTER_FORMATS.map((format) => ({ ...format }));
}

export function isPosterReady(input: { active: boolean; photoUrl: string | null; lastSeenLocation: string | null }): boolean {
  return input.active && Boolean(input.photoUrl?.trim()) && Boolean(input.lastSeenLocation?.trim());
}

export function canExportPoster(input: { hasImage: boolean; busy: boolean }): boolean {
  return input.hasImage && !input.busy;
}

export function getRescueQrUrl(code: string, siteUrl: string): string {
  return new URL(`/p/${encodeURIComponent(code)}`, siteUrl).toString();
}

export function getPosterEditorHref(petId: string): string {
  return `/mascotas/${encodeURIComponent(petId)}#cartel-se-busca`;
}
