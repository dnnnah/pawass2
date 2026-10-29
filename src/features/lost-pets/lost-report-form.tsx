'use client';

import { useActionState, useState, useTransition } from 'react';
import { createLostReport, recoverPet, updateLostReport } from './actions';
import type { LostReportRow } from './lost-report-state';
import type { FormState } from '@/features/profile/actions';
import { convertImageToWebp } from '@/lib/image';

const initialState: FormState = { ok: false, message: '' };

export function LostReportForm({ petId, report }: { petId: string; report?: LostReportRow | null }) {
  const submit = report ? updateLostReport : createLostReport;
  const [state, action, pending] = useActionState(submit, initialState);
  const [pendingConversion, startTransition] = useTransition();
  const [photoError, setPhotoError] = useState('');
  const isPending = pending || pendingConversion;
  const dateTimeDefault = report?.last_seen_at ? report.last_seen_at.slice(0, 16) : '';
  async function prepareAndSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPhotoError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const source = data.get('recentPhoto');
    if (source instanceof File && source.size) {
      try { data.set('recentPhoto', await convertImageToWebp(source)); }
      catch (error) { setPhotoError(error instanceof Error ? error.message : 'No pudimos preparar la fotografía.'); return; }
    }
    startTransition(() => action(data));
  }
  return (
    <details className={`lost-report-editor ${report ? 'lost-report-editor--active' : ''}`}>
      <summary className={`button ${report ? 'button--outline' : 'button--danger'} button--wide`}>{report ? 'Editar alerta de pérdida' : 'Reportar perdida'}</summary>
      <form action={action} onSubmit={prepareAndSubmit} className="form-stack lost-report-form">
        {report ? <input type="hidden" name="reportId" value={report.id} /> : <input type="hidden" name="petId" value={petId} />}
        {!report && <div className="lost-public-notice"><strong>La alerta será pública e indexable.</strong><p>Mostrará el nombre, los contactos de rescate, las alertas ya autorizadas para el QR y los detalles que agregues aquí. Si no indicas ubicación, aparecerá “Ubicación pendiente”.</p><label className="consent-check"><input type="checkbox" name="publicConsent" required /><span>Entiendo qué información se publicará y acepto crear la alerta.</span></label></div>}
        <label className="field"><span>Última ubicación vista <em>opcional</em></span><input name="lastSeenLocation" maxLength={160} defaultValue={report?.last_seen_location || ''} placeholder="Ciudad, colonia o zona" /></label>
        <label className="field"><span>Fecha y hora aproximadas <em>opcional</em></span><input type="datetime-local" name="lastSeenAt" defaultValue={dateTimeDefault} /></label>
        <label className="field"><span>¿Qué llevaba puesto? <em>opcional</em></span><input name="wearing" maxLength={160} defaultValue={report?.wearing || ''} placeholder="Ej. Collar azul y pechera roja" /></label>
        <label className="field"><span>Mensaje para quien la encuentre <em>opcional</em></span><textarea name="message" maxLength={500} rows={3} defaultValue={report?.message || ''} placeholder="Cualquier detalle que ayude a reconocerla o acercarse con calma." /></label>
        <label className="field"><span>Recompensa informativa <em>opcional</em></span><input name="reward" maxLength={100} defaultValue={report?.reward || ''} placeholder="Ej. Se ofrece recompensa" /></label>
        <label className="field"><span>Foto reciente <em>opcional</em></span><input type="file" name="recentPhoto" accept="image/*" /></label>
        <p className="form-description">Se convierte a WebP, con un máximo de 2000 px y 5 MB. Se borra del almacenamiento al recuperar a la mascota.</p>
        {photoError && <p className="form-message" role="alert">{photoError}</p>}
        {state.message && <p className={`form-message ${state.ok ? 'form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
        <button className="button button--danger" type="submit" disabled={isPending}>{isPending ? 'Guardando…' : report ? 'Guardar cambios' : 'Publicar alerta ahora'}</button>
      </form>
    </details>
  );
}

export function RecoverPetForm({ report }: { report: LostReportRow }) {
  const [state, action, pending] = useActionState(recoverPet, initialState);
  return (
    <form action={action} className="recovery-form">
      <input type="hidden" name="reportId" value={report.id} />
      <label className="consent-check"><input type="checkbox" name="confirmRecovery" required /><span>Confirmo que esta mascota ya está en casa.</span></label>
      {state.message && <p className="form-message" role="status" aria-live="polite">{state.message}</p>}
      <button className="button button--primary button--wide" type="submit" disabled={pending}>{pending ? 'Cerrando alerta…' : 'Marcar como recuperada'}</button>
    </form>
  );
}

