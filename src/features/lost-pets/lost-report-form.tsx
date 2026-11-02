'use client';
import { FormGrid } from '@/components/ui/form-layout';

import './lost-report-form.css';

import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';

import { useActionState, useState, useTransition } from 'react';
import { createLostReport, updateLostReport } from './actions';
import type { LostReportRow } from './lost-report-state';
import type { FormState } from '@/features/profile/actions';
import { convertImageToWebp } from '@/lib/image';

const initialState: FormState = { ok: false, message: '' };

export function LostReportForm({ petId, report }: { petId: string; report?: LostReportRow | null }) {
  const submit = report ? updateLostReport : createLostReport;
  const [state, action, pending] = useActionState(submit, initialState);
  const [pendingConversion, startTransition] = useTransition();
  const [photoError, setPhotoError] = useState('');
  const legacyReward = Boolean(report?.reward && !/^[0-9]+$/.test(report.reward));
  const [reward, setReward] = useState(legacyReward ? '' : report?.reward || '');
  const isPending = pending || pendingConversion;
  const lastSeenDate = report?.last_seen_at ? localDatePart(report.last_seen_at) : '';
  const lastSeenTime = report?.last_seen_at ? localTimePart(report.last_seen_at) : '';
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
    <div className={`lost-report-editor ${report ? 'lost-report-editor--active' : ''}`}>
      <form action={action} onSubmit={prepareAndSubmit} className="form-stack lost-report-form">
        {report ? <input type="hidden" name="reportId" value={report.id} /> : <input type="hidden" name="petId" value={petId} />}
        {!report && <div className="lost-public-notice"><strong>La alerta será pública e indexable.</strong><p>Mostrará el nombre, los contactos de rescate, las alertas ya autorizadas para el QR y los detalles que agregues aquí. Si no indicas ubicación, aparecerá “Ubicación pendiente”.</p><label className="consent-check"><input type="checkbox" name="publicConsent" required /><span>Entiendo qué información se publicará y acepto crear la alerta.</span></label></div>}
        <label className="field"><span>Última ubicación vista <em>opcional</em></span><input name="lastSeenLocation" maxLength={160} defaultValue={report?.last_seen_location || ''} placeholder="Ciudad, colonia o zona" /></label>
        <fieldset className="lost-time-fields"><legend>Cuándo se perdió <em>opcional</em></legend><FormGrid columns={2}><label className="field"><span>Día aproximado</span><input type="date" name="lastSeenDate" defaultValue={lastSeenDate} /></label><label className="field"><span>Hora aproximada</span><input type="time" name="lastSeenTime" defaultValue={lastSeenTime} /></label></FormGrid><p>Completa el día y la hora, o deja ambos campos vacíos.</p></fieldset>
        <label className="field"><span>¿Qué llevaba puesto? <em>opcional</em></span><input name="wearing" maxLength={160} defaultValue={report?.wearing || ''} placeholder="Ej. Collar azul y pechera roja" /></label>
        <label className="field"><span>Qué hacer si la ves <em>opcional</em></span><textarea name="message" maxLength={500} rows={3} defaultValue={report?.message || ''} placeholder="Ej. No la persigas. Llámame y mantén la distancia; se asusta si intentan cargarla." /></label>
        <label className="field"><span>Recompensa informativa <em>opcional</em></span><input name="reward" inputMode="numeric" pattern="[0-9]*" maxLength={100} value={reward} onChange={(event) => { if (/^[0-9]*$/.test(event.target.value)) setReward(event.target.value); }} placeholder="Ej. 1000" /><small>Solo dígitos, sin símbolos ni decimales.</small>{legacyReward && <small>La recompensa anterior contiene texto. Escribe una cantidad en dígitos o deja el campo vacío para retirarla al guardar.</small>}</label>
        <label className="field"><span>Foto reciente <em>opcional</em></span><input type="file" name="recentPhoto" accept="image/*" /></label>
        <p className="form-description">Se convierte a WebP, con un máximo de 2000 px y 5 MB. Se borra del almacenamiento al recuperar a la mascota.</p>
        <FormMessage role="alert">{photoError}</FormMessage>
        <FormMessage success={state.ok}>{state.message}</FormMessage>
        <Button variant="danger" type="submit" disabled={isPending}>{isPending ? 'Guardando…' : report ? 'Guardar cambios' : 'Publicar alerta ahora'}</Button>
      </form>
    </div>
  );
}

function localDatePart(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function localTimePart(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
