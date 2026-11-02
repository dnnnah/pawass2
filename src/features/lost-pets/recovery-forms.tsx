'use client';
import './recovery-forms.css';
import { useActionState, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { recoverPet } from './actions';
import type { LostReportRow } from './lost-report-state';
import type { FormState } from '@/features/profile/actions';
const initialState: FormState = { ok: false, message: '' };

export function RecoverPetForm({ report }: { report: Pick<LostReportRow, 'id'> }) {
  const [state, action, pending] = useActionState(recoverPet, initialState);
  return (
    <form action={action} className="recovery-form">
      <input type="hidden" name="reportId" value={report.id} />
      <label className="consent-check"><input type="checkbox" name="confirmRecovery" required /><span>Confirmo que esta mascota ya está en casa.</span></label>
      <FormMessage>{state.message}</FormMessage>
      <Button fullWidth type="submit" disabled={pending}>{pending ? 'Cerrando alerta…' : 'Marcar como recuperada'}</Button>
    </form>
  );
}


export function QuickRecovery({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return <div className="quick-recovery"><Button variant="outline" className="recovery-trigger" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7M5 9v12h14V9M9 15l2 2 4-4" /></svg>Ya está en casa</Button>{open && <div id={panelId}><p>Se cerrará la búsqueda pública y se mostrará el aviso de regreso durante 30 días.</p><RecoverPetForm report={{ id: reportId }} /><Button variant="text" onClick={() => setOpen(false)}>Cancelar</Button></div>}</div>;
}
