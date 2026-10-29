export const CARE_ALERT_CATEGORIES = [
  'allergy',
  'condition',
  'medication',
  'care',
  'temperament',
] as const;

export const CARE_ALERT_SEVERITIES = ['critical', 'precaution', 'informative'] as const;

export type CareAlertCategory = typeof CARE_ALERT_CATEGORIES[number];
export type CareAlertSeverity = typeof CARE_ALERT_SEVERITIES[number];

export type CareAlertCatalogItem = {
  id: string;
  category: CareAlertCategory;
  label: string;
  suggestedSeverity: CareAlertSeverity;
};

export const CARE_ALERT_CATALOG: readonly CareAlertCatalogItem[] = [
  { id: 'allergy-peanut', category: 'allergy', label: 'Alergia a cacahuate', suggestedSeverity: 'critical' },
  { id: 'allergy-insect-sting', category: 'allergy', label: 'Reacción a picadura de insecto', suggestedSeverity: 'critical' },
  { id: 'allergy-food', category: 'allergy', label: 'Sensibilidad a un alimento', suggestedSeverity: 'precaution' },
  { id: 'condition-seizures', category: 'condition', label: 'Convulsiones', suggestedSeverity: 'critical' },
  { id: 'condition-heart', category: 'condition', label: 'Condición cardiaca', suggestedSeverity: 'critical' },
  { id: 'condition-arthritis', category: 'condition', label: 'Artritis', suggestedSeverity: 'precaution' },
  { id: 'medication-daily', category: 'medication', label: 'Toma medicación diaria', suggestedSeverity: 'precaution' },
  { id: 'medication-emergency', category: 'medication', label: 'Necesita medicación de emergencia', suggestedSeverity: 'critical' },
  { id: 'care-mobility', category: 'care', label: 'Movilidad reducida', suggestedSeverity: 'precaution' },
  { id: 'care-heat', category: 'care', label: 'Evitar calor intenso', suggestedSeverity: 'precaution' },
  { id: 'care-senior', category: 'care', label: 'Requiere manejo cuidadoso por edad', suggestedSeverity: 'informative' },
  { id: 'temperament-noise', category: 'temperament', label: 'Se asusta con ruidos fuertes', suggestedSeverity: 'precaution' },
  { id: 'temperament-strangers', category: 'temperament', label: 'Necesita acercamiento gradual', suggestedSeverity: 'precaution' },
  { id: 'temperament-handling', category: 'temperament', label: 'No tolera que le toquen las patas', suggestedSeverity: 'informative' },
];

export type CareAlertInput = {
  catalogId: string;
  category: string;
  label: string;
  severity: string;
  instructions: string;
  qrVisible: boolean;
};

export type CareAlertValue = {
  catalogId: string | null;
  category: CareAlertCategory;
  label: string;
  severity: CareAlertSeverity;
  instructions: string;
  qrVisible: boolean;
};

export type CareAlertValidation<T> = { ok: true; value: T } | { ok: false; error: string };

export function normalizeCareAlertInput(input: CareAlertInput): CareAlertValidation<CareAlertValue> {
  if (!CARE_ALERT_CATEGORIES.includes(input.category as CareAlertCategory)) {
    return { ok: false, error: 'Elige un tipo de alerta válido.' };
  }
  if (!CARE_ALERT_SEVERITIES.includes(input.severity as CareAlertSeverity)) {
    return { ok: false, error: 'Elige un nivel de importancia válido.' };
  }
  if (typeof input.qrVisible !== 'boolean') {
    return { ok: false, error: 'Indica si esta alerta puede aparecer en el QR.' };
  }

  const category = input.category as CareAlertCategory;
  const catalogItem = input.catalogId && input.catalogId !== 'other'
    ? CARE_ALERT_CATALOG.find((item) => item.id === input.catalogId)
    : null;
  if (input.catalogId !== 'other' && !catalogItem) {
    return { ok: false, error: 'Elige una alerta del catálogo o «Otra».' };
  }
  if (catalogItem && catalogItem.category !== category) {
    return { ok: false, error: 'El tipo de alerta no corresponde con el catálogo.' };
  }

  const label = catalogItem?.label || input.label.trim();
  if (!label || label.length > 120) {
    return { ok: false, error: 'Escribe el nombre de la alerta.' };
  }
  const instructions = input.instructions.trim();
  if (instructions.length > 500) {
    return { ok: false, error: 'Las instrucciones deben tener 500 caracteres o menos.' };
  }

  return {
    ok: true,
    value: {
      catalogId: catalogItem?.id || null,
      category,
      label,
      severity: input.severity as CareAlertSeverity,
      instructions,
      qrVisible: input.qrVisible,
    },
  };
}

export type CareAlertForProjection = {
  id?: string;
  catalogId?: string | null;
  category: CareAlertCategory;
  label: string;
  severity: CareAlertSeverity;
  instructions: string;
  qrVisible: boolean;
  privateNotes?: string;
};

export type PublicCareAlert = Pick<CareAlertForProjection, 'category' | 'label' | 'severity' | 'instructions'>;

export function projectPublicCareAlerts(alerts: readonly CareAlertForProjection[]): PublicCareAlert[] {
  return alerts
    .filter((alert) => alert.qrVisible)
    .map(({ category, label, severity, instructions }) => ({ category, label, severity, instructions }));
}
