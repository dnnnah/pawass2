'use client';
import { FormGrid } from '@/components/ui/form-layout';

import './care-alerts-pages.css';

import { SectionHeading } from '@/components/ui/page-layout';

import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';

import { useId, useState, useActionState } from 'react';
import { CARE_ALERT_CATALOG, CARE_ALERT_CATEGORIES, type CareAlertCategory, type CareAlertSeverity } from './domain';
import { CareSeverityBadge } from '@/features/brand/status-badge';
import { RecordActionIcon } from '@/features/brand/record-action-icon';
import { deleteCareAlert, saveCareAlert, setCareAlertVisibility } from './actions';
import type { FormState } from '@/features/profile/actions';

export type CareAlertRecord = {
  id: string;
  category: CareAlertCategory;
  catalog_id: string | null;
  label: string;
  severity: CareAlertSeverity;
  instructions: string;
  qr_visible: boolean;
};

const initialState: FormState = { ok: false, message: '' };
const categoryLabels: Record<CareAlertCategory, string> = {
  allergy: 'Alergia',
  condition: 'Condición',
  medication: 'Medicación',
  care: 'Cuidado',
  temperament: 'Temperamento',
};
const severityLabels: Record<CareAlertSeverity, string> = {
  critical: 'Urgente',
  precaution: 'Precaución',
  informative: 'Informativa',
};

export function CareAlertManager({ petId, alerts }: { petId: string; alerts: CareAlertRecord[] }) {
  return (
    <section className="care-section" aria-labelledby="care-heading">
      <SectionHeading headingId="care-heading" title="Alertas de cuidado" description="Elige qué necesita saber quien encuentre a tu mascota." aside={<span className="section-count">{alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}</span>} />
      <p className="care-privacy-note">El ojo controla si la alerta y sus instrucciones son públicas en el QR y el cartel. El lápiz abre su edición. Las alertas con el ojo tachado permanecen privadas.</p>
      {alerts.length > 0 ? (
        <ol className="care-alert-list">
          {alerts.map((alert) => <CareAlertItem key={alert.id} petId={petId} alert={alert} />)}
        </ol>
      ) : (
        <p className="care-empty">Todavía no hay alertas. Puedes agregar alergias, cuidados o indicaciones de temperamento.</p>
      )}
      <details className="care-add-alert">
        <summary className="button button--primary">Agregar alerta de cuidado</summary>
        <CareAlertForm petId={petId} />
      </details>
    </section>
  );
}

function CareAlertItem({ petId, alert }: { petId: string; alert: CareAlertRecord }) {
  const [editing, setEditing] = useState(false);
  const editorId = useId();
  return <li className="care-alert-item"><div className="care-alert-item__heading"><div><p className="care-alert-item__category">{categoryLabels[alert.category]}</p><h3>{alert.label}</h3><CareSeverityBadge severity={alert.severity} /></div><div className="record-heading-actions"><button className="record-icon-button" type="button" title="Editar alerta" aria-label={`Editar alerta: ${alert.label}`} aria-expanded={editing} aria-controls={editorId} onClick={() => setEditing(!editing)}><RecordActionIcon kind="edit" /></button><VisibilityControl petId={petId} alert={alert} disabled={editing} /></div></div><p className="care-alert-item__visibility">{alert.qr_visible ? 'Pública en QR y cartel' : 'Privada: solo tú puedes verla'}</p>{alert.instructions && <p className="care-alert-item__instructions">{alert.instructions}</p>}{editing && <div id={editorId}><CareAlertForm petId={petId} alert={alert} /><Button variant="text" onClick={() => setEditing(false)}>Cancelar edición</Button></div>}<form action={deleteCareAlert} className="care-alert-item__delete"><input type="hidden" name="petId" value={petId} /><input type="hidden" name="alertId" value={alert.id} /><Button variant="text" className="care-alert-delete" type="submit">Eliminar alerta</Button></form></li>;
}
function VisibilityControl({ petId, alert, disabled }: { petId: string; alert: CareAlertRecord; disabled: boolean }) {
  const [state, action, pending] = useActionState(setCareAlertVisibility, initialState);
  const label = alert.qr_visible ? `Ocultar del QR: ${alert.label}` : `Hacer pública en QR: ${alert.label}`;
  return <form action={action} className="care-visibility-control" aria-busy={pending}><input type="hidden" name="petId" value={petId} /><input type="hidden" name="alertId" value={alert.id} /><input type="hidden" name="visibility" value={alert.qr_visible ? 'private' : 'public'} /><button className="record-icon-button" type="submit" title={pending ? 'Guardando visibilidad…' : label} aria-label={pending ? 'Guardando visibilidad…' : label} aria-pressed={alert.qr_visible} disabled={pending || disabled}><span className={pending ? 'care-visibility-pending' : undefined}><RecordActionIcon kind={alert.qr_visible ? 'eye' : 'eye-off'} /></span></button><span className="sr-only" role="status">{pending ? 'Guardando visibilidad…' : state.ok ? state.message : ''}</span>{!state.ok && state.message && <p className="care-visibility-error" role="alert">{state.message}</p>}</form>;
}

function CareAlertForm({ petId, alert }: { petId: string; alert?: CareAlertRecord }) {
  const [state, action, pending] = useActionState(saveCareAlert, initialState);
  const formId = useId();
  const [category, setCategory] = useState<CareAlertCategory>(alert?.category || 'allergy');
  const [catalogId, setCatalogId] = useState(alert ? alert.catalog_id || 'other' : '');
  const initialCatalog = CARE_ALERT_CATALOG.find((item) => item.id === alert?.catalog_id);
  const [severity, setSeverity] = useState<CareAlertSeverity>(alert?.severity || initialCatalog?.suggestedSeverity || 'informative');
  const custom = catalogId === 'other';
  const options = CARE_ALERT_CATALOG.filter((item) => item.category === category);

  return (
    <form action={action} className="form-stack care-alert-form">
      <input type="hidden" name="petId" value={petId} />
      {alert && <input type="hidden" name="alertId" value={alert.id} />}
      <FormGrid columns={2}>
        <label className="field" htmlFor={`${formId}-category`}>
          <span>Tipo</span>
          <select id={`${formId}-category`} name="category" value={category} onChange={(event) => {
            setCategory(event.target.value as CareAlertCategory);
            setCatalogId('');
          }}>
            {CARE_ALERT_CATEGORIES.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}
          </select>
        </label>
        <label className="field" htmlFor={`${formId}-catalog`}>
          <span>Alerta del catálogo</span>
          <select id={`${formId}-catalog`} name="catalogId" value={catalogId} required onChange={(event) => {
            const nextId = event.target.value;
            const nextOption = CARE_ALERT_CATALOG.find((item) => item.id === nextId);
            setCatalogId(nextId);
            if (nextOption) setSeverity(nextOption.suggestedSeverity);
          }}>
            <option value="">Elige una opción</option>
            {options.map((item) => <option value={item.id} key={item.id}>{item.label} · sugerida: {severityLabels[item.suggestedSeverity].toLowerCase()}</option>)}
            <option value="other">Otra</option>
          </select>
        </label>
      </FormGrid>
      {custom && (
        <label className="field" htmlFor={`${formId}-label`}>
          <span>Nombre de la alerta</span>
          <input id={`${formId}-label`} name="label" maxLength={120} defaultValue={alert?.catalog_id ? '' : alert?.label || ''} required />
        </label>
      )}
      <label className="field" htmlFor={`${formId}-severity`}>
        <span>Nivel de importancia</span>
        <select id={`${formId}-severity`} name="severity" value={severity} onChange={(event) => setSeverity(event.target.value as CareAlertSeverity)}>
          {Object.entries(severityLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
        <small>La sugerencia del catálogo se puede cambiar. No sustituye una indicación veterinaria.</small>
      </label>
      <label className="field" htmlFor={`${formId}-instructions`}>
        <span>Instrucciones de manejo <em>opcional</em></span>
        <textarea id={`${formId}-instructions`} name="instructions" maxLength={500} rows={3} defaultValue={alert?.instructions || ''} placeholder="Ej. Acércate con calma y evita tocarle la cabeza." />
        <small>Si la alerta se muestra en QR, estas instrucciones también serán públicas.</small>
      </label>
      <label className="consent-check care-alert-form__public">
        <input type="checkbox" name="qrVisible" defaultChecked={alert?.qr_visible || false} />
        <span>Mostrar esta alerta y sus instrucciones en la ficha QR. Cualquier persona con el código podrá verlas.</span>
      </label>
      <FormMessage success={state.ok}>{state.message}</FormMessage>
      <Button type="submit" disabled={pending}>{pending ? 'Guardando…' : alert ? 'Guardar cambios' : 'Guardar alerta'}</Button>
    </form>
  );
}
