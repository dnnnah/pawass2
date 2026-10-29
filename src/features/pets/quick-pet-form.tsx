'use client';

import { useActionState } from 'react';
import { createPet } from './actions';
import type { FormState } from '@/features/profile/actions';

const initialState: FormState = { ok: false, message: '' };

export function QuickPetForm({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const [state, action, pending] = useActionState(createPet, initialState);
  return (
    <form action={action} className="form-stack quick-pet-form">
      <div className="form-grid form-grid--two">
        <label className="field"><span>Nombre de la mascota</span><input name="name" autoComplete="off" maxLength={60} required placeholder="Ej. Luna" /></label>
        <label className="field"><span>Especie</span><select name="species" defaultValue="perro"><option value="perro">Perro</option><option value="gato">Gato</option></select></label>
      </div>
      <div className="privacy-summary">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.7 2.8 8.2 7 10 4.2-1.8 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>
        <div><strong>Esto estará en su ficha QR</strong><p>Nombre, especie y acceso a los contactos de rescate:</p><p className="privacy-summary__numbers">Teléfono <bdi>{phone}</bdi> · WhatsApp <bdi>{whatsapp}</bdi></p></div>
      </div>
      <label className="consent-check"><input type="checkbox" name="privacyAccepted" required /><span>Acepto que cualquier persona que tenga su código pueda ver estos datos y contactar a mi cuenta. Puedo cambiar los contactos desde la ficha de la mascota.</span></label>
      {state.message && <p className={`form-message ${state.ok ? 'form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
      <button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Creando ficha…' : 'Crear mascota y activar QR'}</button>
    </form>
  );
}
