import { getCountries, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export type RescueContacts = { phone: string; whatsapp: string };
export type PetContactOverride = {
  enabled: boolean;
  phone: string | null;
  whatsapp: string | null;
};

export type ProfileInput = {
  firstName: string;
  surname1: string;
  surname2: string;
  phone: string;
  phoneCountry: string;
  whatsapp: string;
  whatsappCountry: string;
};

export type ValidatedProfile = {
  firstName: string;
  surname1: string | null;
  surname2: string | null;
  phone: string;
  whatsapp: string;
};

export type QuickPetInput = { name: string; species: string; privacyAccepted: boolean };
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function isPublicPetCode(code: string): boolean {
  return /^PC-[A-HJ-NP-Z2-9]{6}$/.test(code);
}

export function safeRedirectPath(path: string, origin: string): string {
  if (!path.startsWith('/')) return '/mascotas';
  try {
    const appOrigin = new URL(origin).origin;
    const destination = new URL(path, appOrigin);
    return destination.origin === appOrigin
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : '/mascotas';
  } catch {
    return '/mascotas';
  }
}

export function normalizePhoneNumber(value: string, country: CountryCode): string | null {
  const parsed = parsePhoneNumberFromString(value, country);
  return parsed?.isValid() ? parsed.number : null;
}

export function resolveRescueContacts(
  account: RescueContacts,
  override: PetContactOverride,
): RescueContacts {
  if (override.enabled && override.phone && override.whatsapp) {
    return { phone: override.phone, whatsapp: override.whatsapp };
  }

  return { ...account };
}

export function normalizeProfileInput(_input: ProfileInput): ValidationResult<ValidatedProfile> {
  const firstName = _input.firstName.trim();
  const surname1 = _input.surname1.trim();
  const surname2 = _input.surname2.trim();
  if (!firstName || firstName.length > 80 || surname1.length > 80 || surname2.length > 80) {
    return { ok: false, error: 'Revisa el nombre y los apellidos (máximo 80 caracteres).'};
  }

  const hasSeparateWhatsapp = Boolean(_input.whatsapp.trim());
  const whatsappCountry = hasSeparateWhatsapp ? _input.whatsappCountry : _input.phoneCountry;
  if (!getCountries().includes(_input.phoneCountry as CountryCode) || (hasSeparateWhatsapp && !getCountries().includes(whatsappCountry as CountryCode))) {
    return { ok: false, error: 'Selecciona una lada internacional válida.' };
  }

  const phone = normalizePhoneNumber(_input.phone, _input.phoneCountry as CountryCode);
  const whatsappInput = hasSeparateWhatsapp ? _input.whatsapp : _input.phone;
  const whatsapp = normalizePhoneNumber(whatsappInput, whatsappCountry as CountryCode);
  if (!phone || !whatsapp) {
    return { ok: false, error: 'Escribe un teléfono y WhatsApp válidos con su lada internacional.' };
  }

  return {
    ok: true,
    value: {
      firstName,
      surname1: surname1 || null,
      surname2: surname2 || null,
      phone,
      whatsapp,
    },
  };
}

export function validateQuickPetInput(input: QuickPetInput): ValidationResult<{ name: string; species: 'perro' | 'gato' }> {
  const name = input.name.trim();
  if (!name || name.length > 60) {
    return { ok: false, error: 'Escribe un nombre de mascota de hasta 60 caracteres.' };
  }
  if (input.species !== 'perro' && input.species !== 'gato') {
    return { ok: false, error: 'Elige perro o gato.' };
  }
  if (!input.privacyAccepted) {
    return { ok: false, error: 'Debes aceptar la publicación de la ficha QR para continuar.' };
  }
  return { ok: true, value: { name, species: input.species } };
}
