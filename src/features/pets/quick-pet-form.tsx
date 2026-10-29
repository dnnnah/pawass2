'use client';

import { useActionState, useState } from 'react';
import { createPet } from './actions';
import { PetContactEditor } from './pet-contact-editor';
import { PetDetailsForm } from './pet-details-form';
import type { FormState } from '@/features/profile/actions';

const initialState: FormState = { ok: false, message: '' };

export function PetCreateControl({
  phone,
  whatsapp,
  hasPets,
}: {
  phone: string;
  whatsapp: string;
  hasPets: boolean;
}) {
  const [open, setOpen] = useState(false);
  return open ? (
    <section className="add-pet-panel" aria-labelledby="add-pet-heading">
      <div className="add-pet-panel__heading">
        <div className="add-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" /></svg></div>
        <div><h2 id="add-pet-heading">{hasPets ? 'Agregar mascota' : 'Registrar a tu primera mascota'}</h2><p>La ficha QR queda lista al completar el primer paso.</p></div>
        <button className="text-button add-pet-close" type="button" onClick={() => setOpen(false)}>Cerrar</button>
      </div>
      <QuickPetForm phone={phone} whatsapp={whatsapp} onFinish={() => setOpen(false)} />
    </section>
  ) : (
    <button className="button button--primary add-pet-trigger" type="button" onClick={() => setOpen(true)}>
      <span aria-hidden="true">+</span>{hasPets ? 'Agregar mascota' : 'Registrar mi primera mascota'}
    </button>
  );
}

function QuickPetForm({ phone, whatsapp, onFinish }: { phone: string; whatsapp: string; onFinish: () => void }) {
  const [state, action, pending] = useActionState(createPet, initialState);
  const [step, setStep] = useState<'choose' | 'identity' | 'contact'>('choose');
  if (state.petId) {
    if (step === 'identity') {
      return <div className="pet-setup-step">
        <StepHeading step={2} title="Completa su identidad" description="Raza, aspecto y edad aproximada. Puedes dejar campos vacíos." />
        <PetDetailsForm petId={state.petId} species={state.species || 'perro'} onComplete={() => setStep('contact')} />
        <button className="button button--text" type="button" onClick={() => setStep('contact')}>Omitir por ahora</button>
      </div>;
    }
    if (step === 'contact') {
      return <div className="pet-setup-step">
        <StepHeading step={3} title="Elige a quién pueden contactar" description="Por defecto hereda los teléfonos de tu cuenta. Solo crea una excepción si esta mascota necesita otros números." />
        <PetContactEditor petId={state.petId} enabled={false} phone={phone} whatsapp={whatsapp} />
        <div className="form-actions"><button className="button button--primary" type="button" onClick={onFinish}>Terminar</button><button className="button button--text" type="button" onClick={onFinish}>Lo haré después</button></div>
      </div>;
    }
    return <div className="pet-created" role="status" aria-live="polite">
      <p className="pet-created__mark" aria-hidden="true">✓</p>
      <h3>La ficha ya está activa</h3>
      <p>{state.message}</p>
      <p className="form-description">Los pasos de identidad y contacto son opcionales. Puedes completarlos ahora o más adelante desde la ficha de tu mascota.</p>
      <div className="form-actions"><button className="button button--primary" type="button" onClick={() => setStep('identity')}>Continuar al paso 2</button><button className="button button--text" type="button" onClick={onFinish}>Terminar por ahora</button></div>
    </div>;
  }
  return (
    <form action={action} className="form-stack quick-pet-form">
      <StepHeading step={1} title="Crea su ficha de rescate" description="Solo necesitamos dos datos para empezar." />
      <div className="form-grid form-grid--two">
        <label className="field"><span>Nombre de la mascota</span><input name="name" autoComplete="off" maxLength={60} required placeholder="Ej. Luna" /></label>
        <label className="field"><span>Especie</span><select name="species" defaultValue="perro"><option value="perro">Perro</option><option value="gato">Gato</option></select></label>
      </div>
      <div className="privacy-summary">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.7 2.8 8.2 7 10 4.2-1.8 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
        <div><strong>Al crearla, activas una ficha QR pública</strong><p>Cualquier persona con el código podrá ver el nombre, la especie y los teléfonos de rescate que elijas.</p><p className="privacy-summary__numbers">Llamadas y WhatsApp: <bdi>{whatsapp || phone}</bdi></p></div>
      </div>
      <label className="consent-check"><input type="checkbox" name="privacyAccepted" required /><span>Acepto que esos datos estén disponibles para quien tenga el código QR. Puedo cambiar los contactos después.</span></label>
      {state.message && <p className="form-message" role="status" aria-live="polite">{state.message}</p>}
      <button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Creando ficha…' : 'Crear ficha y activar QR'}</button>
    </form>
  );
}

function StepHeading({ step, title, description }: { step: number; title: string; description: string }) {
  return <div className="step-heading"><p>Paso {step} de 3</p><h3>{title}</h3><span>{description}</span></div>;
}
