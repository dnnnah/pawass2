import { PetNote, PetDetail } from '@/features/brand/pet-note';
import Image from 'next/image';
import Link from 'next/link';
import { AppHeader } from '@/features/navigation/app-header';
import { CareAlertManager, type CareAlertRecord } from '@/features/care-alerts/care-alert-manager';
import { LostReportForm } from '@/features/lost-pets/lost-report-form';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';
import { PetContactEditor } from './pet-contact-editor';
import { PetDetailsForm, type PetDetailsValues } from './pet-details-form';
import { DeletePetForm } from './delete-pet-form';
import { PetPhotoUploadForm } from './photo-upload-form';

type EditorPet = PetDetailsValues & {
  id: string; name: string; species: 'perro' | 'gato';
  contact_override_enabled: boolean;
  rescue_phone_override: string | null; whatsapp_phone_override: string | null;
};

export function PetEditor({ pet, code, photoUrl, report, alerts }: {
  pet: EditorPet; code: string; photoUrl: string | null;
  report: LostReportRow | null; alerts: CareAlertRecord[];
}) {
  return (
    <main className="account-shell">
      <AppHeader active="pets" />
      <div className="account-main pet-detail-main">
        <Link className="back-link" href="/mascotas">← Volver a mis mascotas</Link>
        <section className="pet-detail-hero" aria-labelledby="pet-name">
          <div className="pet-detail-photo" role={photoUrl ? undefined : 'img'} aria-label={photoUrl ? undefined : 'Sin fotografía registrada'}>{photoUrl ? <Image src={photoUrl} width={400} height={300} alt={`Foto de ${pet.name}`} unoptimized /> : <><Image src="/paw-mark.svg" width={72} height={72} alt="" aria-hidden="true" /><span>Sin foto registrada</span></>}</div>
          <div className="pet-detail-identity">
            <p className={`pet-detail-state ${report ? 'pet-detail-state--lost' : ''}`}><span aria-hidden="true" />{report ? 'Perdida' : 'En casa'}</p>
            <h1 id="pet-name">{pet.name}</h1>
            <p>{pet.species === 'perro' ? 'Perro' : 'Gato'}{code && <> · Código <bdi>{code}</bdi></>}</p>
            {code && <a className="text-button" href={`/p/${code}`} target="_blank" rel="noreferrer">Abrir ficha QR</a>}
          </div>
          <LostReportForm petId={pet.id} report={report} />
        </section>
        <nav className="editor-nav" aria-label="Secciones de la ficha">
          <a href="#identidad">Identidad y detalles</a><a href="#fotografia">Fotografía</a><a href="#cuidados">Alertas de cuidado</a><a href="#contactos">Contacto de rescate</a>
        </nav>
        <div className="pet-editor-layout"><div className="pet-editor-content">
        <section className="pet-details-editor" id="identidad" aria-labelledby="identity-heading">
          <header className="editor-heading"><h2 id="identity-heading">Identidad y detalles</h2><p>Guarda cada sección cuando termines de editarla.</p></header>
          <PetDetailsForm petId={pet.id} species={pet.species} details={pet} continueLabel="Guardar detalles" />
        </section>
        <section id="fotografia" className="pet-photo-editor" aria-labelledby="pet-photo-heading"><h2 id="pet-photo-heading">Fotografía</h2><PetPhotoUploadForm petId={pet.id} publicCode={code} /></section>
        <div id="cuidados"><CareAlertManager petId={pet.id} alerts={alerts} /></div>
        <section id="contactos" className="pet-detail-contact" aria-labelledby="contact-heading">
          <div><h2 id="contact-heading">Contacto de rescate</h2><p>Por defecto, llamadas y WhatsApp usan los teléfonos de Mi cuenta. Aquí puedes elegir un contacto distinto para esta mascota.</p></div>
          <PetContactEditor petId={pet.id} enabled={pet.contact_override_enabled} phone={pet.rescue_phone_override} whatsapp={pet.whatsapp_phone_override} />
        </section>
        <DeletePetForm petId={pet.id} publicCode={code} />
        </div><aside className="editor-help"><PetDetail kind="dog" /><h2>Su ficha, lista para ayudar</h2><p>Una fotografía clara y un contacto actualizado ayudan a que quien encuentre a {pet.name} sepa qué hacer.</p><h3>Tú decides qué se comparte</h3><p>Los datos privados de cuidado permanecen en tu cuenta. Solo las alertas que autorices aparecerán en el QR.</p>{code && <a className="button button--outline button--wide" href={`/p/${code}`} target="_blank" rel="noreferrer">Revisar ficha pública <span className="sr-only">(abre en otra pestaña)</span></a>}</aside></div>
        <PetNote name={pet.name} />
      </div>
    </main>
  );
}
