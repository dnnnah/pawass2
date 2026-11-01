import { describe, expect, it } from 'vitest';
import {
  isRecoveryNoticeVisible,
  getLostReportRevalidationPaths,
  normalizeLostReport,
  projectPublicLostPet,
  toLostReportDatabaseFields,
} from '../src/features/lost-pets/domain';

describe('lost report input', () => {
  it('combines the separate date and time in the matching local timezone', () => {
    expect(normalizeLostReport({
      lastSeenLocation: '', lastSeenDate: '2026-10-29', lastSeenTime: '18:45', wearing: '', message: '', reward: '',
    })).toEqual({ ok: true, value: expect.objectContaining({ lastSeenAt: new Date('2026-10-29T18:45').toISOString() }) });
  });

  it('requires both date and time when the approximate moment is supplied', () => {
    expect(normalizeLostReport({
      lastSeenLocation: '', lastSeenDate: '', lastSeenTime: '18:45', wearing: '', message: '', reward: '',
    })).toEqual({ ok: false, error: 'Indica también el día aproximado, o deja ambos campos vacíos.' });
    expect(normalizeLostReport({
      lastSeenLocation: '', lastSeenDate: '2026-10-29', lastSeenTime: '', wearing: '', message: '', reward: '',
    })).toEqual({ ok: false, error: 'Indica también la hora aproximada, o deja ambos campos vacíos.' });
  });
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

  it('maps normalized report fields to the database column names', () => {
    const report = normalizeLostReport({
      lastSeenLocation: 'Centro',
      lastSeenAt: '2026-10-29T12:00',
      wearing: 'Collar azul',
      message: 'Ayuda a volver a casa',
      reward: '1000',
    });

    if (!report.ok) throw new Error(report.error);
    expect(toLostReportDatabaseFields(report.value)).toEqual({
      last_seen_location: 'Centro',
      last_seen_at: expect.any(String),
      wearing: 'Collar azul',
      message: 'Ayuda a volver a casa',
      reward: '1000',
    });
  });

  it('revalidates the pet editor after report details change', () => {
    expect(getLostReportRevalidationPaths('pet-123', 'PC-AB2345')).toEqual([
      '/mascotas',
      '/mascotas/pet-123',
      '/mascotas/pet-123/perdida',
      '/perdidas',
      '/perdidas/PC-AB2345',
      '/p/PC-AB2345',
    ]);
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
