'use client';

import { useActionState } from 'react';
import { deletePet } from './actions';
import type { FormState } from '@/features/profile/actions';

const initialState: FormState = { ok: false, message: '' };

export function DeletePetForm({ petId, publicCode }: { petId: string; publicCode: string }) {
  const [state, action, pending] = useActionState(deletePet, initialState);
  return (
    <details className="danger-zone__details">
      <summary>Eliminar ficha de mascota</summary>
      <form action={action} className="form-stack danger-zone__form">
        <input type="hidden" name="petId" value={petId} />
        <p>Esto elimina la ficha, las alertas e imágenes asociadas. El código {publicCode} quedará reservado y nunca se reutilizará.</p>
        <label className="field"><span>Escribe el código para confirmar</span><input name="confirmation" autoComplete="off" maxLength={9} required /></label>
        <label className="consent-check"><input name="confirmDelete" type="checkbox" required /><span>Entiendo que no se puede deshacer.</span></label>
        {state.message && <p className="form-message" role="status" aria-live="polite">{state.message}</p>}
        <button className="button button--danger" type="submit" disabled={pending}>{pending ? 'Eliminando…' : 'Eliminar mascota'}</button>
      </form>
    </details>
  );
}
