'use client';

import Link from 'next/link';
import { useActionState, useId, useState, useSyncExternalStore } from 'react';
import type { FormState } from '@/features/profile/actions';
import {
  HEALTH_CATALOGS,
  HEALTH_DOCUMENT_CATEGORIES,
  calculateDoseStatus,
  suggestNextDoseDate,
  type DoseStatus,
  type HealthDoseKind,
  type PetSpecies,
} from './domain';
import {
  deleteHealthDocument,
  deleteHealthRecord,
  saveHealthRecord,
  saveProcedure,
  updateHealthDocument,
  uploadHealthDocument,
} from './actions';

export type HealthRecordRow = {
  id: string;
  record_type: HealthDoseKind | 'procedure';
  catalog_id: string | null;
  label: string;
  administered_on: string;
  next_dose_date: string | null;
  lot: string | null;
  veterinarian: string | null;
  notes: string | null;
};

export type HealthDocumentRow = {
  id: string;
  category: string;
  label: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  document_date: string | null;
  notes: string | null;
};

const initialState: FormState = { ok: false, message: '' };
const kindLabels: Record<HealthDoseKind, string> = { vaccination: 'Vacuna', deworming: 'Desparasitación' };
const statusLabels = {
  'sin-informacion': 'Sin información',
  'sin-proxima-fecha': 'Sin próxima fecha',
  vencida: 'Vencida',
  'proxima-a-vencer': 'Próxima a vencer',
  'al-dia': 'Al día',
} as const;

export function HealthRecordManager({
  petId,
  species,
  records,
  documents,
}: {
  petId: string;
  species: PetSpecies;
  records: HealthRecordRow[];
  documents: HealthDocumentRow[];
}) {
  const vaccinations = records.filter((record) => record.record_type === 'vaccination');
  const dewormings = records.filter((record) => record.record_type === 'deworming');
  const procedures = records.filter((record) => record.record_type === 'procedure');
  return (
    <div className="health-record-layout">
      <nav className="health-record-nav" aria-label="Apartados del carnet de salud">
        <a href="#vacunas">Vacunas <span>{vaccinations.length}</span></a>
        <a href="#desparasitaciones">Desparasitaciones <span>{dewormings.length}</span></a>
        <a href="#intervenciones">Cirugías e intervenciones <span>{procedures.length}</span></a>
        <a href="#documentos">Documentos <span>{documents.length}</span></a>
      </nav>

      <DoseSection id="vacunas" kind="vaccination" petId={petId} species={species} records={vaccinations} />
      <DoseSection id="desparasitaciones" kind="deworming" petId={petId} species={species} records={dewormings} />
      <ProcedureSection petId={petId} records={procedures} />
      <DocumentSection petId={petId} documents={documents} />
      <p className="health-record-privacy">Este carnet y sus documentos solo están disponibles para ti. No se muestran en el código QR ni en el tablón de mascotas perdidas.</p>
    </div>
  );
}

function DoseSection({ id, kind, petId, species, records }: {
  id: string; kind: HealthDoseKind; petId: string; species: PetSpecies; records: HealthRecordRow[];
}) {
  const orderedRecords = [...records].sort((first, second) => second.administered_on.localeCompare(first.administered_on));
  const today = useTodayDate();
  const status = today ? calculateDoseStatus(records.map((record) => ({ administeredOn: record.administered_on, nextDoseDate: record.next_dose_date })), today) : null;
  return (
    <section className="health-panel" id={id} aria-labelledby={`${id}-heading`}>
      <header className="health-panel__heading">
        <div><h2 id={`${id}-heading`}>{kind === 'vaccination' ? 'Vacunas' : 'Desparasitaciones'}</h2></div>
        <DoseStatusBadge status={status} />
      </header>
      <p className="health-panel__intro">Registra cada aplicación con su fecha. PawPass no calcula vencimientos si no confirmas una próxima fecha.</p>
      {orderedRecords.length ? (
        <ol className="health-record-list">
          {orderedRecords.map((record) => <li key={record.id}><DoseRecordCard petId={petId} species={species} kind={kind} record={record} /></li>)}
        </ol>
      ) : (
        <div className="health-empty"><p>Aún no hay registros de {kind === 'vaccination' ? 'vacunas' : 'desparasitaciones'}.</p><span>Cuando tengas la cartilla o un comprobante, agrégalo para conservarlo aquí.</span></div>
      )}
      <details className="health-add-panel">
        <summary className="button button--primary">Agregar {kind === 'vaccination' ? 'vacuna' : 'desparasitación'}</summary>
        <DoseForm petId={petId} species={species} kind={kind} />
      </details>
    </section>
  );
}

function DoseRecordCard({ petId, species, kind, record }: {
  petId: string; species: PetSpecies; kind: HealthDoseKind; record: HealthRecordRow;
}) {
  const today = useTodayDate();
  const status = today ? calculateDoseStatus([{ nextDoseDate: record.next_dose_date }], today) : null;
  return (
    <article className="health-record-entry">
      <div className="health-record-entry__top">
        <div><h3>{record.label}</h3><p>Aplicada el <time dateTime={record.administered_on}>{formatDate(record.administered_on)}</time></p></div>
        <DoseStatusBadge status={status} />
      </div>
      <dl className="health-record-details">
        <div><dt>Próxima fecha</dt><dd>{record.next_dose_date ? formatDate(record.next_dose_date) : 'Sin próxima fecha registrada'}</dd></div>
        {record.lot && <div><dt>Lote</dt><dd>{record.lot}</dd></div>}
        {record.veterinarian && <div><dt>Veterinario</dt><dd>{record.veterinarian}</dd></div>}
        {record.notes && <div className="health-record-details__notes"><dt>Notas</dt><dd>{record.notes}</dd></div>}
      </dl>
      <div className="health-record-actions">
        <details><summary className="text-button">Editar registro</summary><DoseForm petId={petId} species={species} kind={kind} record={record} /></details>
        <DeleteRecordControl petId={petId} record={record} />
      </div>
    </article>
  );
}

function DoseForm({ petId, species, kind, record }: {
  petId: string; species: PetSpecies; kind: HealthDoseKind; record?: HealthRecordRow;
}) {
  const [state, action, pending] = useActionState(saveHealthRecord, initialState);
  const formId = useId();
  const [catalogId, setCatalogId] = useState(record?.catalog_id || '');
  const [administeredOn, setAdministeredOn] = useState(record?.administered_on || '');
  const [nextDoseDate, setNextDoseDate] = useState(record?.next_dose_date || '');
  const [confirmed, setConfirmed] = useState(Boolean(record?.next_dose_date));
  const [label, setLabel] = useState(record?.catalog_id === 'other' ? record.label : '');
  const suggestion = suggestNextDoseDate(kind, catalogId, administeredOn);
  const options = HEALTH_CATALOGS[kind][species];

  return (
    <form action={action} className="health-form">
      <input type="hidden" name="petId" value={petId} />
      <input type="hidden" name="kind" value={kind} />
      {record && <input type="hidden" name="recordId" value={record.id} />}
      <div className="health-form__title"><h3>{record ? 'Editar registro' : `Nueva ${kindLabels[kind].toLowerCase()}`}</h3><p>Completa la aplicación y agrega los datos que tengas.</p></div>
      <div className="health-form-grid">
        <label className="field" htmlFor={`${formId}-catalog`}><span>{kind === 'vaccination' ? 'Vacuna (obligatorio)' : 'Tipo de desparasitación (obligatorio)'}</span>
          <select id={`${formId}-catalog`} name="catalogId" value={catalogId} required onChange={(event) => {
            setCatalogId(event.target.value);
            const option = options.find((item) => item.id === event.target.value);
            setLabel(event.target.value === 'other' ? label : option?.label || '');
          }}>
            <option value="">Elige una opción</option>
            {options.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
          </select>
        </label>
        {catalogId === 'other' && <label className="field" htmlFor={`${formId}-label`}><span>Nombre del producto o tratamiento (obligatorio)</span>
          <input id={`${formId}-label`} name="label" value={label} maxLength={120} onChange={(event) => setLabel(event.target.value)} required />
        </label>}
        <label className="field" htmlFor={`${formId}-administered`}><span>Fecha de aplicación (obligatorio)</span>
          <input id={`${formId}-administered`} name="administeredOn" type="date" value={administeredOn} onChange={(event) => setAdministeredOn(event.target.value)} required />
        </label>
        <label className="field" htmlFor={`${formId}-next`}><span>Próxima dosis <em>opcional</em></span>
          <input id={`${formId}-next`} name="nextDoseDate" type="date" value={nextDoseDate} onChange={(event) => { setNextDoseDate(event.target.value); setConfirmed(false); }} aria-describedby={`${formId}-next-help`} />
          <small id={`${formId}-next-help`}>{suggestion ? 'La sugerencia es una referencia; verifica el esquema indicado para tu mascota.' : 'Si tu veterinario indicó otra fecha, puedes escribirla aquí. Si no tienes una fecha, déjalo vacío.'}</small>
        </label>
        {suggestion && suggestion !== nextDoseDate && <div className="health-suggestion" role="note"><p><strong>Referencia disponible:</strong> {formatDate(suggestion)}.</p><p>{options.find((item) => item.id === catalogId)?.suggestionNote}</p>{options.find((item) => item.id === catalogId)?.sourceUrl && <a href={options.find((item) => item.id === catalogId)?.sourceUrl} rel="noreferrer">Consultar referencia de salud pública</a>}<button className="button button--outline" type="button" onClick={() => { setNextDoseDate(suggestion); setConfirmed(false); }}>Usar esta fecha</button></div>}
        <label className="field" htmlFor={`${formId}-lot`}><span>Lote <em>opcional</em></span><input id={`${formId}-lot`} name="lot" maxLength={80} defaultValue={record?.lot || ''} /></label>
        <label className="field" htmlFor={`${formId}-vet`}><span>Veterinario o clínica <em>opcional</em></span><input id={`${formId}-vet`} name="veterinarian" maxLength={120} defaultValue={record?.veterinarian || ''} /></label>
        <label className="field health-form__wide" htmlFor={`${formId}-notes`}><span>Notas <em>opcional</em></span><textarea id={`${formId}-notes`} name="notes" maxLength={1000} rows={3} defaultValue={record?.notes || ''} /></label>
      </div>
      {nextDoseDate && <label className="health-confirm-date" htmlFor={`${formId}-confirm`}><input id={`${formId}-confirm`} name="nextDoseConfirmed" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>Confirmo que la próxima fecha es correcta para esta mascota.</span></label>}
      {state.message && <p className={`health-form-message ${state.ok ? 'health-form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
      <div className="health-form__actions"><button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Guardando…' : record ? 'Guardar cambios' : 'Guardar registro'}</button>{record && <button className="button button--text" type="button" onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}>Cancelar edición</button>}</div>
    </form>
  );
}

function DeleteRecordControl({ petId, record }: { petId: string; record: HealthRecordRow }) {
  return (
    <details className="health-delete-control">
      <summary className="text-button">Eliminar</summary>
      <div><p>Se quitará este registro del carnet. Esta acción no se puede deshacer.</p><form action={deleteHealthRecord}><input type="hidden" name="petId" value={petId} /><input type="hidden" name="recordId" value={record.id} /><button className="button button--outline health-danger-action" type="submit">Confirmar eliminación</button></form></div>
    </details>
  );
}

function ProcedureSection({ petId, records }: { petId: string; records: HealthRecordRow[] }) {
  const orderedRecords = [...records].sort((first, second) => second.administered_on.localeCompare(first.administered_on));
  return (
    <section className="health-panel" id="intervenciones" aria-labelledby="procedures-heading">
      <header className="health-panel__heading"><div><h2 id="procedures-heading">Cirugías e intervenciones</h2></div><span className="section-count">{records.length} {records.length === 1 ? 'registro' : 'registros'}</span></header>
      <p className="health-panel__intro">Conserva el nombre, la fecha y notas importantes de cada procedimiento.</p>
      {orderedRecords.length ? <ol className="health-record-list">{orderedRecords.map((record) => <li key={record.id}><article className="health-record-entry"><div className="health-record-entry__top"><div><h3>{record.label}</h3><p>Realizada el <time dateTime={record.administered_on}>{formatDate(record.administered_on)}</time></p></div></div>{record.notes && <p className="health-procedure-notes">{record.notes}</p>}<div className="health-record-actions"><details><summary className="text-button">Editar intervención</summary><ProcedureForm petId={petId} record={record} /></details><DeleteRecordControl petId={petId} record={record} /></div></article></li>)}</ol> : <div className="health-empty"><p>Aún no hay cirugías o intervenciones registradas.</p><span>Puedes guardar aquí procedimientos pasados y actuales.</span></div>}
      <details className="health-add-panel"><summary className="button button--primary">Agregar cirugía o intervención</summary><ProcedureForm petId={petId} /></details>
    </section>
  );
}

function ProcedureForm({ petId, record }: { petId: string; record?: HealthRecordRow }) {
  const [state, action, pending] = useActionState(saveProcedure, initialState);
  const formId = useId();
  return (
    <form action={action} className="health-form">
      <input type="hidden" name="petId" value={petId} />
      {record && <input type="hidden" name="recordId" value={record.id} />}
      <div className="health-form__title"><h3>{record ? 'Editar intervención' : 'Nueva intervención'}</h3><p>Agrega la información disponible; las notas son opcionales.</p></div>
      <div className="health-form-grid">
        <label className="field" htmlFor={`${formId}-name`}><span>Cirugía o intervención (obligatorio)</span><input id={`${formId}-name`} name="name" defaultValue={record?.label || ''} maxLength={120} required /></label>
        <label className="field" htmlFor={`${formId}-date`}><span>Fecha (obligatorio)</span><input id={`${formId}-date`} name="performedOn" type="date" defaultValue={record?.administered_on || ''} required /></label>
        <label className="field health-form__wide" htmlFor={`${formId}-notes`}><span>Notas <em>opcional</em></span><textarea id={`${formId}-notes`} name="notes" rows={3} maxLength={1000} defaultValue={record?.notes || ''} /></label>
      </div>
      {state.message && <p className={`health-form-message ${state.ok ? 'health-form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
      <div className="health-form__actions"><button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Guardando…' : record ? 'Guardar cambios' : 'Guardar intervención'}</button></div>
    </form>
  );
}

function DocumentSection({ petId, documents }: { petId: string; documents: HealthDocumentRow[] }) {
  const orderedDocuments = [...documents].sort((first, second) => (second.document_date || second.original_filename).localeCompare(first.document_date || first.original_filename));
  return (
    <section className="health-panel" id="documentos" aria-labelledby="documents-heading">
      <header className="health-panel__heading"><div><h2 id="documents-heading">Documentos</h2></div><span className="section-count">{documents.length} {documents.length === 1 ? 'archivo' : 'archivos'}</span></header>
      <p className="health-panel__intro">Sube cartillas, recetas o estudios. Los archivos se conservan en un espacio privado y solo se entregan después de verificar tu sesión y permisos.</p>
      {orderedDocuments.length ? <ul className="health-document-list">{orderedDocuments.map((document) => <li key={document.id}><article className="health-document-entry"><p className="health-document-category">{document.label}</p><h3>{document.original_filename}</h3><p>{document.mime_type === 'application/pdf' ? 'PDF' : document.mime_type.slice(6).toUpperCase()} · {document.document_date ? `Fecha del documento: ${formatDate(document.document_date)} · ` : ''}{formatBytes(document.size_bytes)}</p><Link className="button button--outline" href={`/mascotas/${petId}/carnet/documentos/${document.id}`} target="_blank">Abrir documento <span className="sr-only">{document.original_filename} (en una pestaña nueva)</span></Link><details><summary className="text-button">Editar clasificación</summary><DocumentEditForm petId={petId} document={document} /></details><DeleteDocumentControl petId={petId} document={document} /></article></li>)}</ul> : <div className="health-empty"><p>Aún no hay documentos.</p><span>Los documentos que agregues solo estarán disponibles dentro de tu cuenta.</span></div>}
      <details className="health-add-panel"><summary className="button button--primary">Agregar documento</summary><DocumentUploadForm petId={petId} /></details>
    </section>
  );
}

function DocumentUploadForm({ petId }: { petId: string }) {
  const [state, action, pending] = useActionState(uploadHealthDocument, initialState);
  const formId = useId();
  const [category, setCategory] = useState('');
  return (
    <form action={action} className="health-form" encType="multipart/form-data">
      <input type="hidden" name="petId" value={petId} />
      <div className="health-form__title"><h3>Nuevo documento</h3><p>Formatos: PDF, JPEG, PNG o WebP · hasta 10 MB.</p></div>
      <div className="health-form-grid">
        <label className="field" htmlFor={`${formId}-category`}><span>Clasificación (obligatorio)</span><select id={`${formId}-category`} name="category" value={category} onChange={(event) => setCategory(event.target.value)} required><option value="">Elige una opción</option>{HEALTH_DOCUMENT_CATEGORIES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
        {category === 'other' && <label className="field" htmlFor={`${formId}-label`}><span>Tipo de documento (obligatorio)</span><input id={`${formId}-label`} name="label" maxLength={120} required /></label>}
        <label className="field" htmlFor={`${formId}-file`}><span>Archivo (obligatorio)</span><input id={`${formId}-file`} name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required /><small>Revisa que el documento no incluya información que no quieras conservar en tu cuenta.</small></label>
        <label className="field" htmlFor={`${formId}-date`}><span>Fecha del documento <em>opcional</em></span><input id={`${formId}-date`} name="documentDate" type="date" /></label>
        <label className="field health-form__wide" htmlFor={`${formId}-notes`}><span>Notas <em>opcional</em></span><textarea id={`${formId}-notes`} name="notes" rows={3} maxLength={1000} /></label>
      </div>
      {state.message && <p className={`health-form-message ${state.ok ? 'health-form-message--success' : ''}`} role="status" aria-live="polite">{state.message}</p>}
      <div className="health-form__actions"><button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Subiendo…' : 'Guardar documento privado'}</button></div>
    </form>
  );
}

function DocumentEditForm({ petId, document }: { petId: string; document: HealthDocumentRow }) {
  const [state, action, pending] = useActionState(updateHealthDocument, initialState);
  const formId = useId();
  const [category, setCategory] = useState(document.category);
  return (
    <form action={action} className="health-form health-form--compact">
      <input type="hidden" name="petId" value={petId} /><input type="hidden" name="documentId" value={document.id} /><input type="hidden" name="fileName" value={document.original_filename} />
      <label className="field" htmlFor={`${formId}-category`}><span>Clasificación</span><select id={`${formId}-category`} name="category" value={category} onChange={(event) => setCategory(event.target.value)}>{HEALTH_DOCUMENT_CATEGORIES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
      {category === 'other' && <label className="field" htmlFor={`${formId}-label`}><span>Tipo</span><input id={`${formId}-label`} name="label" defaultValue={document.category === 'other' ? document.label : ''} maxLength={120} required /></label>}
      <label className="field" htmlFor={`${formId}-date`}><span>Fecha del documento</span><input id={`${formId}-date`} name="documentDate" type="date" defaultValue={document.document_date || ''} /></label>
      <label className="field" htmlFor={`${formId}-notes`}><span>Notas</span><textarea id={`${formId}-notes`} name="notes" defaultValue={document.notes || ''} rows={2} maxLength={1000} /></label>
      {state.message && <p className="health-form-message" role="status">{state.message}</p>}
      <button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar clasificación'}</button>
    </form>
  );
}

function DeleteDocumentControl({ petId, document }: { petId: string; document: HealthDocumentRow }) {
  return (
    <details className="health-delete-control">
      <summary className="text-button">Eliminar documento</summary>
      <div><p>Se quitarán el archivo y su registro privado. Esta acción no se puede deshacer.</p><form action={deleteHealthDocument}><input type="hidden" name="petId" value={petId} /><input type="hidden" name="documentId" value={document.id} /><button className="button button--outline health-danger-action" type="submit">Confirmar eliminación</button></form></div>
    </details>
  );
}

function DoseStatusBadge({ status }: { status: DoseStatus | null }) {
  return (
    <span className={`health-status${status ? ` health-status--${status}` : ''}`}>
      {status && <span aria-hidden="true" />}{status ? statusLabels[status] : 'Estado local al cargar'}
    </span>
  );
}

function useTodayDate() {
  return useSyncExternalStore(
    subscribeToNoChanges,
    getLocalDate,
    () => '',
  );
}

function subscribeToNoChanges() {
  return () => {};
}

function getLocalDate() {
  return new Intl.DateTimeFormat('en-CA').format(new Date());
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatBytes(bytes: number) {
  return bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
