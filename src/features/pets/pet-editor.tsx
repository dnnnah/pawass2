import { DoseRecordStatus } from '@/features/health-record/dose-status-badge';
import { EditorSectionNav } from './editor-section-nav';
import { PetNote } from '@/features/brand/pet-note';
import Image from 'next/image';
import Link from 'next/link';
import { AppHeader } from '@/features/navigation/app-header';
import { CareAlertManager, type CareAlertRecord } from '@/features/care-alerts/care-alert-manager';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';
import type { HealthDocumentRow, HealthRecordRow } from '@/features/health-record/health-record-manager';
import { PetContactEditor } from './pet-contact-editor';
import { PetDetailsForm, type PetDetailsValues } from './pet-details-form';
import { DeletePetForm } from './delete-pet-form';
import { PetPhotoUploadForm } from './photo-upload-form';
import { getRescueQrUrl } from '@/features/lost-pets/poster-domain';
import { getSiteUrl } from '@/lib/supabase/env';
import { getPublicPetViewHref } from './pet-card-domain';
import { RescueQrTools } from './rescue-qr-tools';
import { EditorIcon } from './editor-icon';
import './pet-editor.css';

type EditorPet = PetDetailsValues & {
  id: string; name: string; species: 'perro' | 'gato'; contact_override_enabled: boolean;
  rescue_phone_override: string | null; whatsapp_phone_override: string | null;
};
type HealthSummary = Pick<HealthRecordRow, 'id' | 'record_type' | 'label' | 'administered_on' | 'next_dose_date'>;
type DocumentSummary = Pick<HealthDocumentRow, 'id' | 'label' | 'original_filename' | 'document_date'>;

export function PetEditor({ pet, code, photoUrl, report, alerts, records, documents }: {
  pet: EditorPet; code: string; photoUrl: string | null; report: LostReportRow | null;
  alerts: CareAlertRecord[]; records: HealthSummary[]; documents: DocumentSummary[];
}) {
  const isLost = report?.status === 'active';
  const publicHref = getPublicPetViewHref(code, isLost);
  return <main className="account-shell">
    <AppHeader active="pets" />
    <div className="account-main pet-detail-main">
      <Link className="back-link" href="/mascotas">← Mis mascotas</Link>
      <header className="pet-editor-heading"><div><h1>Editar ficha de {pet.name}</h1><p>Su información y cuidados, con control sobre lo que compartes.</p></div><div className="editor-heading-actions"><span className={`pet-state ${isLost ? 'pet-state--lost' : ''}`}>{isLost ? 'Perdida' : 'En casa'}</span><Link className="button button--outline" href={publicHref}>Ver ficha pública</Link></div></header>
      {isLost && <div className="editor-loss-notice"><span>Hay una búsqueda activa.</span><Link className="button button--urgent-outline" href={`/mascotas/${pet.id}/perdida`}>Editar alerta y cartel</Link></div>}
      <EditorSectionNav />
      <section className="pet-details-editor" id="identidad" aria-labelledby="identity-heading"><header className="editor-heading"><h2 id="identity-heading"><EditorIcon kind="info" />Información de {pet.name}</h2><p>El nombre y la foto son públicos. Los datos de identificación y salud indicados como privados solo aparecen en tu cuenta.</p></header><PetDetailsForm petId={pet.id} species={pet.species} details={pet} continueLabel="Guardar detalles" /></section>
      <section id="fotografia" className="pet-photo-editor" aria-labelledby="pet-photo-heading"><h2 id="pet-photo-heading"><EditorIcon kind="photo" />Foto principal</h2><p>Visible en la ficha QR. Durante una pérdida, la búsqueda puede usar la foto reciente del reporte.</p><div className="editor-photo-current">{photoUrl ? <Image src={photoUrl} width={400} height={300} alt={`Foto principal de ${pet.name}`} unoptimized /> : <p>Aún no has agregado una foto.</p>}</div><PetPhotoUploadForm petId={pet.id} publicCode={code} /></section>
      <div id="cuidados"><CareAlertManager petId={pet.id} alerts={alerts} /></div>
      <section id="salud" className="editor-overview editor-overview--health" aria-labelledby="health-overview-heading"><header><h2 id="health-overview-heading"><EditorIcon kind="health" />Carnet de salud</h2><span className="editor-private">Privado · {records.length} registros</span></header><p>Vacunas, desparasitaciones e intervenciones. No aparecen en la ficha pública.</p><ul className="editor-summary-list">{records.slice(0, 3).map(r => <li key={r.id}><strong>{r.label}</strong><span>{r.record_type === 'vaccination' ? 'Vacuna' : r.record_type === 'deworming' ? 'Desparasitación' : 'Intervención'}</span><small>Aplicación: {r.administered_on}</small>{r.record_type !== 'procedure' && <DoseRecordStatus administeredOn={r.administered_on} nextDoseDate={r.next_dose_date} />}</li>)}</ul>{!records.length && <p>Aún no hay registros de salud. Puedes agregar el primero en el carnet.</p>}<Link className="button button--outline" href={`/mascotas/${pet.id}/carnet`}>Ver más y abrir carnet</Link></section>
      <section id="documentos" className="editor-overview editor-overview--documents" aria-labelledby="documents-overview-heading"><header><h2 id="documents-overview-heading"><EditorIcon kind="document" />Documentos</h2><span className="editor-private">Privados · {documents.length} archivos</span></header><p>Cartillas, recetas y estudios. Solo puedes abrirlos desde tu cuenta.</p><ul className="editor-summary-list">{documents.slice(0, 2).map(d => <li key={d.id}><strong>{d.label}</strong><Link href={`/mascotas/${pet.id}/carnet/documentos/${d.id}`} target="_blank">{d.original_filename}<span className="sr-only"> (abrir en otra pestaña)</span></Link></li>)}</ul>{!documents.length && <p>Aún no has agregado documentos.</p>}<Link className="button button--outline" href={`/mascotas/${pet.id}/carnet#documentos`}>Ver más y gestionar documentos</Link></section>
      <section id="contactos" className="pet-detail-contact" aria-labelledby="contact-heading"><h2 id="contact-heading"><EditorIcon kind="contact" />Contacto de rescate</h2><p>Los botones públicos de llamada y WhatsApp usan tu cuenta por defecto. Aquí puedes elegir otros números para esta mascota.</p><PetContactEditor petId={pet.id} enabled={pet.contact_override_enabled} phone={pet.rescue_phone_override} whatsapp={pet.whatsapp_phone_override} /></section>
      <DeletePetForm petId={pet.id} publicCode={code} /><RescueQrTools url={getRescueQrUrl(code, getSiteUrl())} code={code} name={pet.name} /><PetNote name={pet.name} />
    </div>
  </main>;
}
