import { describe, expect, it } from 'vitest';
import {
  isRecoveryNoticeVisible,
  normalizeLostReport,
  projectPublicLostPet,
} from '../src/features/lost-pets/domain';

describe('lost report input', () => {
  it('allows an immediate report with no optional location or photo', () => {
    expect(normalizeLostReport({
      lastSeenLocation: '',
      lastSeenAt: '',
      wearing: '',
      message: '',
      reward: '',
    })).toEqual({
      ok: true,
      value: {
        lastSeenLocation: null,
        lastSeenAt: null,
        wearing: null,
        message: null,
        reward: null,
      },
    });
  });

  it('rejects excessive public report text', () => {
    expect(normalizeLostReport({
      lastSeenLocation: 'a'.repeat(161),
      lastSeenAt: '',
      wearing: '',
      message: '',
      reward: '',
    })).toEqual({ ok: false, error: 'La ubicación debe tener 160 caracteres o menos.' });
  });
});

describe('public lost pet projection', () => {
  it('exposes only rescue fields and care alerts already approved for the QR', () => {
    expect(projectPublicLostPet({
      publicCode: 'PC-AB2345', petName: 'Luna', species: 'perro', photoUrl: null,
      rescuePhone: '+525512345678', whatsappPhone: '+525512345678',
      lastSeenLocation: null, lastSeenAt: null, wearing: null, message: null, reward: null,
      ownerId: 'private-owner-id', vetNotes: 'private clinical notes',
      careAlerts: [
        { label: 'Alergia', severity: 'critical', instructions: 'Evitar cacahuate', qrVisible: true },
        { label: 'Privada', severity: 'critical', instructions: 'No publicar', qrVisible: false },
      ],
    })).toEqual({
      publicCode: 'PC-AB2345', petName: 'Luna', species: 'perro', photoUrl: null,
      rescuePhone: '+525512345678', whatsappPhone: '+525512345678',
      lastSeenLocation: null, lastSeenAt: null, wearing: null, message: null, reward: null,
      careAlerts: [{ label: 'Alergia', severity: 'critical', instructions: 'Evitar cacahuate' }],
    });
  });
});

describe('recovery notice window', () => {
  it('shows the home notice for 30 days, then hides it', () => {
    const recoveredAt = '2026-01-01T10:00:00.000Z';
    expect(isRecoveryNoticeVisible(recoveredAt, '2026-01-31T09:59:59.999Z')).toBe(true);
    expect(isRecoveryNoticeVisible(recoveredAt, '2026-01-31T10:00:00.000Z')).toBe(false);
  });
});

describe('recompensa numérica', () => {
  const input = { lastSeenLocation: '', lastSeenAt: '', wearing: '', message: '' };
  it('rechaza texto, moneda, decimales y signos sin convertirlos en otra cantidad', () => {
    for (const reward of ['Se ofrece recompensa', '$1000', '10.50', '-100', '1e3']) {
      expect(normalizeLostReport({ ...input, reward })).toEqual({ ok: false, error: 'Escribe la recompensa solo con dígitos, sin símbolos ni decimales.' });
    }
  });
  it('conserva la cantidad en dígitos y permite omitirla', () => {
    expect(normalizeLostReport({ ...input, reward: '1000' })).toEqual({ ok: true, value: expect.objectContaining({ reward: '1000' }) });
    expect(normalizeLostReport({ ...input, reward: '' })).toEqual({ ok: true, value: expect.objectContaining({ reward: null }) });
  });
});
