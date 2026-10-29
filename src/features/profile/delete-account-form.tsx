'use client';

import { useActionState } from 'react';
import { deleteAccount, type FormState } from './actions';

const initialState: FormState = { ok: false, message: '' };

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, initialState);
  return (
    <section className="danger-zone" aria-labelledby="delete-account-heading">
      <div>
        <h2 id="delete-account-heading">Eliminar cuenta</h2>
        <p>Eliminaremos tu perfil, mascotas, historial de pérdidas y archivos guardados. Los códigos QR se reservarán sin conservar datos tuyos.</p>
      </div>
      <form action={action} className="form-stack danger-zone__form">
        <label className="field"><span>Escribe ELIMINAR CUENTA para confirmar</span><input name="confirmation" autoComplete="off" required /></label>
        <label className="consent-check"><input name="confirmDelete" type="checkbox" required /><span>Entiendo que eliminar la cuenta es permanente.</span></label>
        {state.message && <p className="form-message" role="status" aria-live="polite">{state.message}</p>}
        <button className="button button--danger" type="submit" disabled={pending}>{pending ? 'Eliminando…' : 'Eliminar mi cuenta'}</button>
      </form>
    </section>
  );
}
