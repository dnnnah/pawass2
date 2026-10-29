'use client';

import { useActionState } from 'react';
import { useState } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { CountryPhoneField } from '@/components/country-phone-field';
import { saveProfile, type FormState } from './actions';

const initialState: FormState = { ok: false, message: '' };

type Profile = {
  first_name: string | null;
  surname1: string | null;
  surname2: string | null;
  rescue_phone: string | null;
  whatsapp_phone: string | null;
};

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [state, action, pending] = useActionState(saveProfile, initialState);
  const [separateWhatsapp, setSeparateWhatsapp] = useState(Boolean(profile.whatsapp_phone && profile.whatsapp_phone !== profile.rescue_phone));
  return (
    <form action={action} className="form-stack profile-form">
      <div className="form-heading"><div><p className="section-label">Tu cuenta</p><h2>Contacto de rescate</h2></div><span className="email-badge">{email}</span></div>
      <p className="form-description">El nombre y los apellidos son privados. El teléfono y WhatsApp aparecen en la ficha QR de tus mascotas, a menos que una tenga un contacto propio.</p>
      <div className="form-grid form-grid--three">
        <label className="field"><span>Nombre</span><input name="firstName" autoComplete="given-name" maxLength={80} defaultValue={profile.first_name || ''} required /></label>
        <label className="field"><span>Primer apellido <em>opcional</em></span><input name="surname1" autoComplete="family-name" maxLength={80} defaultValue={profile.surname1 || ''} /></label>
        <label className="field"><span>Segundo apellido <em>opcional</em></span><input name="surname2" maxLength={80} defaultValue={profile.surname2 || ''} /></label>
      </div>
      <div className={`form-grid ${separateWhatsapp ? 'form-grid--two' : ''}`}>
        <CountryPhoneField label="Teléfono para llamadas" inputName="phone" countryName="phoneCountry" defaultValue={nationalDefault(profile.rescue_phone)} defaultCountry={countryDefault(profile.rescue_phone)} />
        {separateWhatsapp && <CountryPhoneField label="Número distinto para WhatsApp" inputName="whatsapp" countryName="whatsappCountry" defaultValue={nationalDefault(profile.whatsapp_phone)} defaultCountry={countryDefault(profile.whatsapp_phone)} />}
      </div>
      <label className="consent-check contact-editor__toggle"><input type="checkbox" checked={separateWhatsapp} onChange={(event) => setSeparateWhatsapp(event.target.checked)} /><span>Uso un número distinto para WhatsApp</span></label>
      <p className="form-description">Por defecto, WhatsApp y llamadas usan el mismo número. Solo guardamos otro número cuando eliges separarlo.</p>
      {state.message && <p className={`form-message ${state.ok ? 'form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
      <div className="form-actions"><button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar contacto'}</button><span>La ficha QR nunca muestra tu nombre ni apellidos.</span></div>
    </form>
  );
}

function nationalDefault(value: string | null) {
  return value ? parsePhoneNumberFromString(value)?.formatNational() || value : '';
}

function countryDefault(value: string | null) {
  return value ? parsePhoneNumberFromString(value)?.country || 'MX' : 'MX';
}
