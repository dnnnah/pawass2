export type PetDetailsInput = {
  breed: string;
  mixedBreed: string;
  sex: string;
  size: string;
  color: string;
  birthDate: string;
  approximateYears: string;
  approximateMonths: string;
  approximateDeclaredAt?: string;
  weightKg: string;
  microchip: string;
  ruac: string;
  sterilized: string;
};

export type PetDetails = {
  breed: string | null;
  mixedBreed: string | null;
  sex: 'macho' | 'hembra' | null;
  size: 'pequena' | 'mediana' | 'grande' | null;
  color: string | null;
  birthDate: string | null;
  approximateYears: number | null;
  approximateMonths: number | null;
  approximateAgeDeclaredAt: string | null;
  weightKg: number | null;
  microchip: string | null;
  ruac: string | null;
  sterilized: boolean | null;
};

export function normalizePetDetailsInput(input: PetDetailsInput):
  | { ok: true; value: PetDetails }
  | { ok: false; error: string } {
  const birthDate = input.birthDate.trim() || null;
  const yearsRaw = input.approximateYears.trim();
  const monthsRaw = input.approximateMonths.trim();
  const hasApproximateAge = Boolean(yearsRaw || monthsRaw);
  if (birthDate && hasApproximateAge) return { ok: false, error: 'Elige fecha de nacimiento o edad aproximada, no ambas.' };
  if (birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !Number.isFinite(Date.parse(`${birthDate}T00:00:00Z`)))) {
    return { ok: false, error: 'Escribe una fecha de nacimiento válida.' };
  }
  const years = yearsRaw ? Number(yearsRaw) : null;
  const months = monthsRaw ? Number(monthsRaw) : null;
  if ((years !== null && (!Number.isInteger(years) || years < 0 || years > 40)) || (months !== null && (!Number.isInteger(months) || months < 0 || months > 11))) {
    return { ok: false, error: 'La edad aproximada debe estar entre 0 y 40 años, y 0 y 11 meses.' };
  }
  const sex = input.sex || null;
  if (sex && sex !== 'macho' && sex !== 'hembra') return { ok: false, error: 'Elige macho o hembra.' };
  const size = input.size || null;
  if (size && !['pequena', 'mediana', 'grande'].includes(size)) return { ok: false, error: 'Elige una talla válida.' };
  const weight = input.weightKg.trim() ? Number(input.weightKg) : null;
  const declaredAt = input.approximateDeclaredAt?.trim() || new Date().toISOString().slice(0, 10);
  if (hasApproximateAge && (!/^\d{4}-\d{2}-\d{2}$/.test(declaredAt) || !Number.isFinite(Date.parse(`${declaredAt}T00:00:00Z`)) || declaredAt > new Date().toISOString().slice(0, 10))) {
    return { ok: false, error: 'Revisa la fecha en que declaraste la edad aproximada.' };
  }
  if (weight !== null && (!Number.isFinite(weight) || weight <= 0 || weight > 300)) return { ok: false, error: 'El peso debe ser mayor que 0 y menor de 300 kg.' };
  if (input.breed.trim().length > 100 || input.mixedBreed.trim().length > 100 || input.color.trim().length > 100 || input.microchip.trim().length > 80 || input.ruac.trim().length > 40) {
    return { ok: false, error: 'Revisa los detalles: uno de los campos supera el límite permitido.' };
  }
  const sterilized = input.sterilized === 'yes' ? true : input.sterilized === 'no' ? false : null;
  return {
    ok: true,
    value: {
      breed: input.breed.trim() || null,
      mixedBreed: input.mixedBreed.trim() || null,
      sex: sex as PetDetails['sex'],
      size: size as PetDetails['size'],
      color: input.color.trim() || null,
      birthDate,
      approximateYears: hasApproximateAge ? years ?? 0 : null,
      approximateMonths: hasApproximateAge ? months ?? 0 : null,
      approximateAgeDeclaredAt: hasApproximateAge ? declaredAt : null,
      weightKg: weight,
      microchip: input.microchip.trim() || null,
      ruac: input.ruac.trim() || null,
      sterilized,
    },
  };
}

export function resolveDefaultRescueNumbers(rescuePhone: string, whatsappPhone: string) {
  return { rescuePhone, whatsappPhone: whatsappPhone.trim() || rescuePhone };
}
