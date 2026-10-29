import { describe, expect, it } from 'vitest';
import {
  CARE_ALERT_CATALOG,
  normalizeCareAlertInput,
  projectPublicCareAlerts,
} from '../src/features/care-alerts/domain';

describe('catalog severity suggestions', () => {
  it('keeps the tutor-selected severity instead of replacing it with the catalog suggestion', () => {
    expect(CARE_ALERT_CATALOG.find((item) => item.id === 'allergy-peanut')?.suggestedSeverity).toBe('critical');
    expect(normalizeCareAlertInput({
      catalogId: 'allergy-peanut', category: 'allergy', label: '', severity: 'precaution',
      instructions: 'Evitar premios con cacahuate', qrVisible: true,
    })).toEqual({
      ok: true,
      value: {
        catalogId: 'allergy-peanut', category: 'allergy', label: 'Alergia a cacahuate',
        severity: 'precaution', instructions: 'Evitar premios con cacahuate', qrVisible: true,
      },
    });
  });

  it('requires a custom label when the tutor chooses Otra', () => {
    expect(normalizeCareAlertInput({
      catalogId: 'other', category: 'care', label: '  ', severity: 'informative',
      instructions: '', qrVisible: false,
    })).toEqual({ ok: false, error: 'Escribe el nombre de la alerta.' });
  });
});

describe('public care alert projection', () => {
  it('returns only explicitly selected alerts and omits private fields', () => {
    expect(projectPublicCareAlerts([
      {
        id: 'private-id', category: 'temperament', catalogId: 'noise-sensitive',
        label: 'Se asusta con ruidos fuertes', severity: 'precaution',
        instructions: 'Acércate con calma', qrVisible: true, privateNotes: 'No publicar esta nota',
      },
      {
        id: 'hidden-id', category: 'medication', catalogId: 'daily-medication',
        label: 'Medicación diaria', severity: 'critical',
        instructions: 'Nota privada', qrVisible: false, privateNotes: 'Tampoco publicar',
      },
    ])).toEqual([{
      category: 'temperament', label: 'Se asusta con ruidos fuertes',
      severity: 'precaution', instructions: 'Acércate con calma',
    }]);
  });
});
