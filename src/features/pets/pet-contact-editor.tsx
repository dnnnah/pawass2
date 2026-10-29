'use client';

import { useActionState, useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { CountryPhoneField } from '@/components/country-phone-field';
import { savePetContactOverride } from './actions';
import type { FormState } from '@/features/profile/actions';

const initialState: FormState = { ok: false, message: '' };

export function PetContactEditor({ petId, enabled, phone, whatsapp }: { petId: string; enabled: boolean; phone: string | null; whatsapp: string | null }) {
  const [state, action, pending] = useActionState(savePetContactOverride, initialState);
  const [custom, setCustom] = useState(enabled);
  const [separateWhatsapp, setSeparateWhatsapp] = useState(Boolean(whatsapp && phone && whatsapp !== phone));
  return (
    <details className="contact-editor">
      <summary>{enabled ? 'Editar contacto propio' : 'Usar otro contacto para esta mascota'}</summary>
      <form action={action} className="form-stack contact-editor__body">
        <input type="hidden" name="petId" value={petId} />
        <label className="consent-check contact-editor__toggle"><input type="checkbox" name="enabled" checked={custom} onChange={(event) => setCustom(event.target.checked)} /><span>Esta mascota tiene un contacto distinto al de mi cuenta.</span></label>
        {custom ? <>
          <CountryPhoneField label="Teléfono para llamadas" inputName="phone" countryName="phoneCountry" defaultValue={toNational(phone)} defaultCountry={toCountry(phone)} required />
          <label className="consent-check contact-editor__toggle"><input type="checkbox" checked={separateWhatsapp} onChange={(event) => setSeparateWhatsapp(event.target.checked)} /><span>Usar otro número para WhatsApp</span></label>
          {separateWhatsapp && <CountryPhoneField label="Número de WhatsApp" inputName="whatsapp" countryName="whatsappCountry" defaultValue={toNational(whatsapp)} defaultCountry={toCountry(whatsapp)} required />}
          <p className="form-description">Si no eliges un segundo número, llamadas y WhatsApp usarán el teléfono que escribiste.</p>
        </> : <p className="form-description">La mascota heredará el contacto vigente de tu cuenta, incluidos los cambios que hagas después.</p>}
        {state.message && <p className={`form-message ${state.ok ? 'form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
        <button className="button button--outline" type="submit" disabled={pending}>{pending ? 'Guardando…' : custom ? 'Guardar contacto propio' : 'Volver al contacto de mi cuenta'}</button>
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
