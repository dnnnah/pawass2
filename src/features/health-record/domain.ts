export type HealthDoseKind = 'vaccination' | 'deworming';
export type PetSpecies = 'perro' | 'gato';
export type DoseStatus =
  | 'sin-informacion'
  | 'sin-proxima-fecha'
  | 'vencida'
  | 'proxima-a-vencer'
  | 'al-dia';

export type HealthCatalogItem = {
  id: string;
  label: string;
  suggestedIntervalYears?: number;
  suggestionNote?: string;
  sourceUrl?: string;
};

const rabies = {
  id: 'rabia',
  label: 'Antirrábica',
  suggestedIntervalYears: 1,
  suggestionNote: 'Referencia anual para refuerzos en México. La primera aplicación puede requerir un refuerzo a los tres meses; confirma el esquema con tu veterinario y la etiqueta del biológico.',
  sourceUrl: 'https://www.gob.mx/salud/cenaprece/documentos/cartel-prevencion-de-la-rabia',
} satisfies HealthCatalogItem;

export const HEALTH_CATALOGS: Record<HealthDoseKind, Record<PetSpecies, readonly HealthCatalogItem[]>> = {
  vaccination: {
    perro: [
      rabies,
      { id: 'multiple-canina', label: 'Polivalente canina (moquillo, parvovirus y adenovirus)' },
      { id: 'leptospirosis', label: 'Leptospirosis' },
      { id: 'bordetella', label: 'Bordetella / tos de las perreras' },
      { id: 'other', label: 'Otra' },
    ],
    gato: [
      rabies,
      { id: 'triple-felina', label: 'Triple felina (panleucopenia, calicivirus y herpesvirus)' },
      { id: 'leucemia-felina', label: 'Leucemia felina' },
      { id: 'other', label: 'Otra' },
    ],
  },
  deworming: {
    perro: [
      { id: 'desparasitacion-interna', label: 'Desparasitación interna' },
      { id: 'control-externo', label: 'Control de pulgas y garrapatas' },
      { id: 'other', label: 'Otra' },
    ],
    gato: [
      { id: 'desparasitacion-interna', label: 'Desparasitación interna' },
      { id: 'control-externo', label: 'Control de pulgas y garrapatas' },
      { id: 'other', label: 'Otra' },
    ],
  },
};

export const HEALTH_DOCUMENT_CATEGORIES = [
  { id: 'cartilla-vacunacion', label: 'Cartilla de vacunación' },
  { id: 'certificado-esterilizacion', label: 'Certificado de esterilización' },
  { id: 'registro-microchip', label: 'Registro de microchip' },
  { id: 'receta', label: 'Receta médica' },
  { id: 'estudio-medico', label: 'Estudio médico' },
  { id: 'identificacion', label: 'Identificación' },
  { id: 'other', label: 'Otra' },
] as const;

export const MAX_HEALTH_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_HEALTH_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type HealthDoseForStatus = { nextDoseDate: string | null; administeredOn?: string };

export function calculateDoseStatus(records: readonly HealthDoseForStatus[], today: string): DoseStatus {
  if (records.length === 0) return 'sin-informacion';
  const datedRecords = records.filter((record) => isDateOnly(record.administeredOn || ''));
  const mostRecentDate = datedRecords.reduce<string | null>((latest, record) => {
    const date = record.administeredOn!;
    return latest === null || date > latest ? date : latest;
  }, null);
  const currentRecords = mostRecentDate
    ? datedRecords.filter((record) => record.administeredOn === mostRecentDate)
    : records;
  const dates = currentRecords.map((record) => record.nextDoseDate).filter((value): value is string => Boolean(value));
  if (dates.length === 0) return 'sin-proxima-fecha';

  const validDates = dates.filter(isDateOnly).sort();
  if (validDates.length === 0) return 'sin-proxima-fecha';
  if (validDates.some((date) => date < today)) return 'vencida';

  const threshold = addDays(today, 30);
  return validDates.some((date) => date <= threshold) ? 'proxima-a-vencer' : 'al-dia';
}

export function suggestNextDoseDate(kind: HealthDoseKind, catalogId: string, administeredOn: string): string | null {
  if (!isDateOnly(administeredOn)) return null;
  const item = Object.values(HEALTH_CATALOGS[kind]).flat().find((catalogItem) => catalogItem.id === catalogId);
  if (!item?.suggestedIntervalYears) return null;
  return addYears(administeredOn, item.suggestedIntervalYears);
}

export type HealthRecordInput = {
  kind: HealthDoseKind;
  petId: string;
  catalogId: string;
  label: string;
  administeredOn: string;
  nextDoseDate: string;
  nextDoseConfirmed: boolean;
  lot: string;
  veterinarian: string;
  notes: string;
};

export type NormalizedHealthRecord = Omit<HealthRecordInput, 'nextDoseConfirmed' | 'nextDoseDate' | 'lot' | 'veterinarian' | 'notes'> & {
  label: string;
  nextDoseDate: string | null;
  lot: string | null;
  veterinarian: string | null;
  notes: string | null;
};

export type HealthRecordValidation =
  | { ok: true; value: NormalizedHealthRecord }
  | { ok: false; error: string };

export function normalizeHealthRecord(input: HealthRecordInput): HealthRecordValidation {
  if (input.kind !== 'vaccination' && input.kind !== 'deworming') {
    return { ok: false, error: 'Elige una categoría válida.' };
  }
  if (!isUuid(input.petId)) return { ok: false, error: 'No se pudo identificar a la mascota.' };
  if (!isDateOnly(input.administeredOn)) return { ok: false, error: 'Indica una fecha de aplicación válida.' };
  if (input.nextDoseDate && !isDateOnly(input.nextDoseDate)) {
    return { ok: false, error: 'Indica una próxima fecha válida.' };
  }
  if (input.nextDoseDate && !input.nextDoseConfirmed) {
    return { ok: false, error: 'Confirma o edita la próxima fecha antes de guardar.' };
  }
  if (input.nextDoseDate && input.nextDoseDate < input.administeredOn) {
    return { ok: false, error: 'La próxima fecha no puede ser anterior a la aplicación.' };
  }
  const item = Object.values(HEALTH_CATALOGS[input.kind]).flat().find((catalogItem) => catalogItem.id === input.catalogId);
  if (!item) return { ok: false, error: 'Elige una opción válida del catálogo.' };
  const label = input.catalogId === 'other' ? input.label.trim() : item.label;
  if (!label) return { ok: false, error: 'Escribe el nombre del producto o tratamiento.' };
  if (label.length > 120) return { ok: false, error: 'El nombre debe tener 120 caracteres o menos.' };
  if (input.lot.trim().length > 80) return { ok: false, error: 'El lote debe tener 80 caracteres o menos.' };
  if (input.veterinarian.trim().length > 120) return { ok: false, error: 'El nombre del veterinario debe tener 120 caracteres o menos.' };
  if (input.notes.trim().length > 1000) return { ok: false, error: 'Las notas deben tener 1000 caracteres o menos.' };

  return {
    ok: true,
    value: {
      kind: input.kind,
      petId: input.petId,
      catalogId: input.catalogId,
      label,
      administeredOn: input.administeredOn,
      nextDoseDate: input.nextDoseDate || null,
      lot: input.lot.trim() || null,
      veterinarian: input.veterinarian.trim() || null,
      notes: input.notes.trim() || null,
    },
  };
}

export type ProcedureInput = { name: string; performedOn: string; notes: string };
export type ProcedureValidation =
  | { ok: true; value: { name: string; performedOn: string; notes: string | null } }
  | { ok: false; error: string };

export function normalizeProcedure(input: ProcedureInput): ProcedureValidation {
  const name = input.name.trim();
  if (!name) return { ok: false, error: 'Escribe el nombre de la cirugía o intervención.' };
  if (name.length > 120) return { ok: false, error: 'El nombre debe tener 120 caracteres o menos.' };
  if (!isDateOnly(input.performedOn)) return { ok: false, error: 'Indica una fecha válida.' };
  const notes = input.notes.trim();
  if (notes.length > 1000) return { ok: false, error: 'Las notas deben tener 1000 caracteres o menos.' };
  return { ok: true, value: { name, performedOn: input.performedOn, notes: notes || null } };
}

export type HealthDocumentInput = { category: string; label: string; fileName: string };
export type HealthDocumentValidation =
  | { ok: true; value: { category: string; label: string; fileName: string } }
  | { ok: false; error: string };

export function normalizeHealthDocument(input: HealthDocumentInput): HealthDocumentValidation {
  const category = HEALTH_DOCUMENT_CATEGORIES.find((item) => item.id === input.category);
  if (!category) return { ok: false, error: 'Elige una clasificación válida.' };
  const label = input.category === 'other' ? input.label.trim() : category.label;
  if (!label) return { ok: false, error: 'Escribe el tipo de documento.' };
  if (label.length > 120) return { ok: false, error: 'El tipo de documento debe tener 120 caracteres o menos.' };
  const fileName = input.fileName.replace(/\\/g, '/').split('/').pop()?.replace(/[\u0000-\u001f\u007f]/g, '').trim() || '';
  if (!fileName || fileName.length > 160) return { ok: false, error: 'El nombre del archivo no es válido.' };
  return { ok: true, value: { category: input.category, label, fileName } };
}

export function validateDocumentPayload(mimeType: string, size: number, bytes: Uint8Array): boolean {
  if (size <= 0 || size > MAX_HEALTH_DOCUMENT_BYTES || !ALLOWED_HEALTH_DOCUMENT_MIME_TYPES.includes(mimeType as typeof ALLOWED_HEALTH_DOCUMENT_MIME_TYPES[number])) {
    return false;
  }
  if (mimeType === 'application/pdf') return hasBytes(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  if (mimeType === 'image/jpeg') return hasBytes(bytes, [0xff, 0xd8, 0xff]);
  if (mimeType === 'image/png') return hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return hasBytes(bytes, [0x52, 0x49, 0x46, 0x46], 0) && hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8);
}
export function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addYears(value: string, years: number): string {
  const [year, month, day] = value.split('-').map(Number);
  const targetYear = year + years;
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
  return `${targetYear.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${Math.min(day, lastDayOfTargetMonth).toString().padStart(2, '0')}`;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hasBytes(source: Uint8Array, expected: number[], offset = 0): boolean {
  return expected.every((value, index) => source[offset + index] === value);
}
