'use client';

import { useActionState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { CountryPhoneField } from '@/components/country-phone-field';
import { savePetContactOverride } from './actions';
import type { FormState } from '@/features/profile/actions';

const initialState: FormState = { ok: false, message: '' };

export function PetContactEditor({
  petId,
  enabled,
  phone,
  whatsapp,
}: {
  petId: string;
  enabled: boolean;
  phone: string | null;
  whatsapp: string | null;
}) {
  const [state, action, pending] = useActionState(savePetContactOverride, initialState);
  return (
    <details className="contact-editor">
      <summary>{enabled ? 'Editar contacto propio' : 'Usar otro contacto para esta mascota'}</summary>
      <form action={action} className="form-stack contact-editor__body">
        <input type="hidden" name="petId" value={petId} />
        <label className="consent-check contact-editor__toggle"><input type="checkbox" name="enabled" defaultChecked={enabled} /><span>Esta mascota tiene contactos distintos a los de mi cuenta.</span></label>
        <div className="form-grid form-grid--two">
          <CountryPhoneField label="Teléfono para llamadas" inputName="phone" countryName="phoneCountry" defaultValue={toNational(phone)} defaultCountry={toCountry(phone)} required={false} />
          <CountryPhoneField label="WhatsApp" inputName="whatsapp" countryName="whatsappCountry" defaultValue={toNational(whatsapp)} defaultCountry={toCountry(whatsapp)} required={false} />
        </div>
        <p className="form-description">Al activar la excepción, ambos números serán obligatorios. Si la desactivas, la ficha volverá a leer los contactos vigentes de tu cuenta.</p>
        {state.message && <p className={`form-message ${state.ok ? 'form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
        <button className="button button--outline" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar contacto de esta mascota'}</button>
      </form>
    </details>
  );
}

function toNational(value: string | null) {
  if (!value) return '';
  return parsePhoneNumberFromString(value)?.formatNational() || value;
}

function toCountry(value: string | null) {
  return value ? parsePhoneNumberFromString(value)?.country || 'MX' : 'MX';
}
