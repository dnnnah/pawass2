'use client';

import { useId, useState, useActionState } from 'react';
import { CARE_ALERT_CATALOG, CARE_ALERT_CATEGORIES, type CareAlertCategory, type CareAlertSeverity } from './domain';
import { deleteCareAlert, saveCareAlert } from './actions';
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
  critical: 'Crítica',
  precaution: 'Precaución',
  informative: 'Informativa',
};

export function CareAlertManager({ petId, alerts }: { petId: string; alerts: CareAlertRecord[] }) {
  return (
    <section className="care-section" aria-labelledby="care-heading">
      <div className="section-title">
        <div><h2 id="care-heading">Alertas de cuidado</h2><p>Elige qué necesita saber quien encuentre a tu mascota.</p></div>
        <span className="section-count">{alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}</span>
      </div>
      <p className="care-privacy-note">Las alertas son privadas. Solo las que autorices aparecen en su ficha QR, donde cualquier persona con el código puede verlas.</p>
      {alerts.length > 0 ? (
        <ol className="care-alert-list">
          {alerts.map((alert) => (
            <li className="care-alert-item" key={alert.id}>
              <div className="care-alert-item__heading">
                <div><p className="care-alert-item__category">{categoryLabels[alert.category]}</p><h3>{alert.label}</h3></div>
                <span className={`severity-badge severity-badge--${alert.severity}`}>{severityLabels[alert.severity]}</span>
              </div>
              <p className="care-alert-item__visibility">{alert.qr_visible ? 'Visible en ficha QR' : 'Solo tú puedes verla'}</p>
              {alert.instructions && <p className="care-alert-item__instructions">{alert.instructions}</p>}
              <details className="care-alert-editor">
                <summary>Editar alerta</summary>
                <CareAlertForm petId={petId} alert={alert} />
              </details>
              <form action={deleteCareAlert}>
                <input type="hidden" name="petId" value={petId} />
                <input type="hidden" name="alertId" value={alert.id} />
                <button className="text-button" type="submit">Eliminar alerta</button>
              </form>
            </li>
          ))}
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
      <div className="form-grid form-grid--two">
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
      </div>
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
      {state.message && <p className={`form-message ${state.ok ? 'form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
      <button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Guardando…' : alert ? 'Guardar cambios' : 'Guardar alerta'}</button>
    </form>
  );
}
