import { describe, expect, it } from 'vitest';
import {
  HEALTH_CATALOGS,
  HEALTH_DOCUMENT_CATEGORIES,
  calculateDoseStatus,
  normalizeHealthDocument,
  normalizeProcedure,
  normalizeHealthRecord,
  suggestNextDoseDate,
  validateDocumentPayload,
} from '../src/features/health-record/domain';

describe('health dose status', () => {
  it('distinguishes no history from a record without a next date', () => {
    expect(calculateDoseStatus([], '2026-10-29')).toBe('sin-informacion');
    expect(calculateDoseStatus([{ nextDoseDate: null }], '2026-10-29')).toBe('sin-proxima-fecha');
  });

  it('marks dates before today as expired and the next 30 days as due soon', () => {
    expect(calculateDoseStatus([{ nextDoseDate: '2026-10-28' }], '2026-10-29')).toBe('vencida');
    expect(calculateDoseStatus([{ nextDoseDate: '2026-10-29' }], '2026-10-29')).toBe('proxima-a-vencer');
    expect(calculateDoseStatus([{ nextDoseDate: '2026-11-28' }], '2026-10-29')).toBe('proxima-a-vencer');
  });

  it('keeps a dose current only when its confirmed next date is more than 30 days away', () => {
    expect(calculateDoseStatus([{ nextDoseDate: '2026-11-29' }], '2026-10-29')).toBe('al-dia');
    expect(calculateDoseStatus([
      { nextDoseDate: null },
      { nextDoseDate: '2026-11-02' },
    ], '2026-10-29')).toBe('proxima-a-vencer');
  });

  it('uses the latest application when summarizing a section with dated history', () => {
    expect(calculateDoseStatus([
      { administeredOn: '2025-01-01', nextDoseDate: '2025-02-01' },
      { administeredOn: '2026-01-01', nextDoseDate: '2027-01-01' },
    ], '2026-10-29')).toBe('al-dia');
  });
});

describe('health catalog and next-dose suggestion', () => {
  it('provides Mexico-focused entries for both species and an Otra choice', () => {
    expect(HEALTH_CATALOGS.vaccination.perro.some((item) => item.id === 'rabia')).toBe(true);
    expect(HEALTH_CATALOGS.vaccination.gato.some((item) => item.id === 'rabia')).toBe(true);
    expect(HEALTH_CATALOGS.deworming.perro.some((item) => item.id === 'other')).toBe(true);
    expect(HEALTH_CATALOGS.deworming.gato.some((item) => item.id === 'other')).toBe(true);
  });

  it('suggests only catalog-backed dates and leaves confirmation to the tutor', () => {
    expect(suggestNextDoseDate('vaccination', 'rabia', '2026-03-01')).toBe('2027-03-01');
    expect(suggestNextDoseDate('deworming', 'desparasitacion-interna', '2026-03-01')).toBe(null);
    expect(normalizeHealthRecord({
      kind: 'vaccination', petId: 'b2a5eea6-5da5-48b2-b6ae-18797745825a', catalogId: 'rabia', label: '',
      administeredOn: '2026-03-01', nextDoseDate: '2027-03-01', nextDoseConfirmed: false,
      lot: '', veterinarian: '', notes: '',
    })).toEqual({ ok: false, error: 'Confirma o edita la próxima fecha antes de guardar.' });
  });

  it('requires a custom label for Otra and rejects an unconfirmed next date', () => {
    expect(normalizeHealthRecord({
      kind: 'deworming', petId: 'b2a5eea6-5da5-48b2-b6ae-18797745825a', catalogId: 'other', label: '  ',
      administeredOn: '2026-03-01', nextDoseDate: '', nextDoseConfirmed: false,
      lot: '', veterinarian: '', notes: '',
    })).toEqual({ ok: false, error: 'Escribe el nombre del producto o tratamiento.' });
    expect(normalizeHealthRecord({
      kind: 'deworming', petId: 'b2a5eea6-5da5-48b2-b6ae-18797745825a', catalogId: 'desparasitacion-interna', label: '',
      administeredOn: '2026-03-01', nextDoseDate: '2026-04-01', nextDoseConfirmed: false,
      lot: '', veterinarian: '', notes: '',
    })).toEqual({ ok: false, error: 'Confirma o edita la próxima fecha antes de guardar.' });
  });

  it('rejects impossible application dates instead of normalizing them into another day', () => {
    expect(normalizeHealthRecord({
      kind: 'vaccination', petId: 'b2a5eea6-5da5-48b2-b6ae-18797745825a', catalogId: 'rabia', label: '',
      administeredOn: '2026-02-30', nextDoseDate: '', nextDoseConfirmed: false,
      lot: '', veterinarian: '', notes: '',
    })).toEqual({ ok: false, error: 'Indica una fecha de aplicación válida.' });
  });

  it('rejects a next dose earlier than the recorded application', () => {
    expect(normalizeHealthRecord({
      kind: 'vaccination', petId: 'b2a5eea6-5da5-48b2-b6ae-18797745825a', catalogId: 'rabia', label: '',
      administeredOn: '2026-03-01', nextDoseDate: '2026-02-28', nextDoseConfirmed: true,
      lot: '', veterinarian: '', notes: '',
    })).toEqual({ ok: false, error: 'La próxima fecha no puede ser anterior a la aplicación.' });
  });

  it('clamps annual suggestions to the last day of February in a non-leap year', () => {
    expect(suggestNextDoseDate('vaccination', 'rabia', '2024-02-29')).toBe('2025-02-28');
  });

  it('stores a confirmed date as a calendar value and preserves an omitted date', () => {
    expect(normalizeHealthRecord({
      kind: 'vaccination', petId: 'b2a5eea6-5da5-48b2-b6ae-18797745825a', catalogId: 'rabia', label: '',
      administeredOn: '2026-03-01', nextDoseDate: '2027-03-01', nextDoseConfirmed: true,
      lot: '  lote 42 ', veterinarian: '', notes: '  Refuerzo anual  ',
    })).toEqual({
      ok: true,
      value: {
        kind: 'vaccination', petId: 'b2a5eea6-5da5-48b2-b6ae-18797745825a', catalogId: 'rabia',
        label: 'Antirrábica', administeredOn: '2026-03-01', nextDoseDate: '2027-03-01',
        lot: 'lote 42', veterinarian: null, notes: 'Refuerzo anual',
      },
    });
    expect(normalizeHealthRecord({
      kind: 'deworming', petId: 'b2a5eea6-5da5-48b2-b6ae-18797745825a', catalogId: 'desparasitacion-interna', label: '',
      administeredOn: '2026-03-01', nextDoseDate: '', nextDoseConfirmed: false,
      lot: '', veterinarian: '', notes: '',
    })).toMatchObject({ ok: true, value: { nextDoseDate: null, lot: null, veterinarian: null, notes: null } });
  });
});

describe('procedures and private document metadata', () => {
  it('requires a procedure name and valid date while allowing optional notes', () => {
    expect(normalizeProcedure({ name: '  ', performedOn: '2026-05-01', notes: '' })).toEqual({
      ok: false, error: 'Escribe el nombre de la cirugía o intervención.',
    });
    expect(normalizeProcedure({ name: ' Limpieza dental ', performedOn: '2026-05-01', notes: '  Sin complicaciones  ' })).toEqual({
      ok: true, value: { name: 'Limpieza dental', performedOn: '2026-05-01', notes: 'Sin complicaciones' },
    });
  });

  it('offers the supported document classes including Otra', () => {
    expect(HEALTH_DOCUMENT_CATEGORIES.map((category) => category.id)).toEqual([
      'cartilla-vacunacion', 'certificado-esterilizacion', 'registro-microchip',
      'receta', 'estudio-medico', 'identificacion', 'other',
    ]);
  });

  it('rejects unsupported file bytes, MIME mismatches and documents over 10 MiB', () => {
    expect(validateDocumentPayload('image/png', 8, new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBe(false);
    expect(validateDocumentPayload('application/pdf', 8, new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
    expect(validateDocumentPayload('application/pdf', 10_485_761, new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBe(false);
    expect(validateDocumentPayload('image/png', 8, new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
  });

  it('requires a document title for Otra and strips path fragments from original filenames', () => {
    expect(normalizeHealthDocument({ category: 'other', label: ' ', fileName: 'C:\\Users\\ana\\receta.pdf' })).toEqual({
      ok: false, error: 'Escribe el tipo de documento.',
    });
    expect(normalizeHealthDocument({ category: 'receta', label: '', fileName: 'C:\\Users\\ana\\receta.pdf' })).toEqual({
      ok: true,
      value: { category: 'receta', label: 'Receta médica', fileName: 'receta.pdf' },
    });
  });
});
