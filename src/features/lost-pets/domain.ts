export type LostReportInput = {
  lastSeenLocation: string;
  lastSeenAt: string;
  wearing: string;
  message: string;
  reward: string;
};

export type LostReport = {
  lastSeenLocation: string | null;
  lastSeenAt: string | null;
  wearing: string | null;
  message: string | null;
  reward: string | null;
};

export function normalizeLostReport(input: LostReportInput):
  | { ok: true; value: LostReport }
  | { ok: false; error: string } {
  const lastSeenLocation = input.lastSeenLocation.trim();
  const wearing = input.wearing.trim();
  const message = input.message.trim();
  const reward = input.reward.trim();
  if (lastSeenLocation.length > 160) return { ok: false, error: 'La ubicación debe tener 160 caracteres o menos.' };
  if (wearing.length > 160) return { ok: false, error: 'La descripción debe tener 160 caracteres o menos.' };
  if (message.length > 500) return { ok: false, error: 'El mensaje debe tener 500 caracteres o menos.' };
  if (reward && !/^[0-9]+$/.test(reward)) return { ok: false, error: 'Escribe la recompensa solo con dígitos, sin símbolos ni decimales.' };
  if (reward.length > 100) return { ok: false, error: 'La recompensa debe tener 100 caracteres o menos.' };

  let lastSeenAt: string | null = null;
  if (input.lastSeenAt.trim()) {
    const parsed = new Date(input.lastSeenAt);
    if (!Number.isFinite(parsed.getTime())) return { ok: false, error: 'Revisa la fecha y hora aproximadas.' };
    lastSeenAt = parsed.toISOString();
  }

  return {
    ok: true,
    value: {
      lastSeenLocation: lastSeenLocation || null,
      lastSeenAt,
      wearing: wearing || null,
      message: message || null,
      reward: reward || null,
    },
  };
}

type PublicCareAlert = { label: string; severity: string; instructions: string; qrVisible: boolean };
type LostPetProjectionInput = {
  publicCode: string;
  petName: string;
  species: 'perro' | 'gato';
  photoUrl: string | null;
  rescuePhone: string;
  whatsappPhone: string;
  lastSeenLocation: string | null;
  lastSeenAt: string | null;
  wearing: string | null;
  message: string | null;
  reward: string | null;
  ownerId: string;
  vetNotes: string;
  careAlerts: PublicCareAlert[];
};

export function projectPublicLostPet(input: LostPetProjectionInput) {
  return {
    publicCode: input.publicCode,
    petName: input.petName,
    species: input.species,
    photoUrl: input.photoUrl,
    rescuePhone: input.rescuePhone,
    whatsappPhone: input.whatsappPhone,
    lastSeenLocation: input.lastSeenLocation,
    lastSeenAt: input.lastSeenAt,
    wearing: input.wearing,
    message: input.message,
    reward: input.reward,
    careAlerts: input.careAlerts.filter((alert) => alert.qrVisible).map(({ label, severity, instructions }) => ({ label, severity, instructions })),
  };
}

export function isRecoveryNoticeVisible(recoveredAt: string, now: string): boolean {
  const recoveredAtMs = new Date(recoveredAt).getTime();
  const nowMs = new Date(now).getTime();
  const expiresAtMs = recoveredAtMs + 30 * 24 * 60 * 60 * 1000;
  return Number.isFinite(recoveredAtMs) && Number.isFinite(nowMs) && nowMs >= recoveredAtMs && nowMs < expiresAtMs;
}
