import { QRCodeSVG } from 'qrcode.react';
import { PetNote, PetDetail } from '@/features/brand/pet-note';
import Image from 'next/image';
import Link from 'next/link';
import { AppHeader } from '@/features/navigation/app-header';
import { CareAlertManager, type CareAlertRecord } from '@/features/care-alerts/care-alert-manager';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';
import { PetContactEditor } from './pet-contact-editor';
import { PetDetailsForm, type PetDetailsValues } from './pet-details-form';
import { DeletePetForm } from './delete-pet-form';
import { PetPhotoUploadForm } from './photo-upload-form';
import { LostPetPoster, type PosterAlert } from '@/features/lost-pets/lost-pet-poster';
import { isPosterReady, getRescueQrUrl } from '@/features/lost-pets/poster-domain';
import { getSiteUrl } from '@/lib/supabase/env';
import { getPublicPetViewHref } from './pet-card-domain';
import './pet-editor.css';

type EditorPet = PetDetailsValues & {
  id: string; name: string; species: 'perro' | 'gato';
  contact_override_enabled: boolean;
  rescue_phone_override: string | null; whatsapp_phone_override: string | null;
};

export function PetEditor({ pet, code, photoUrl, recentLostPhotoUrl, rescuePhone, whatsappPhone, report, alerts }: {
  pet: EditorPet; code: string; photoUrl: string | null; recentLostPhotoUrl: string | null; rescuePhone: string | null; whatsappPhone?: string | null;
  report: LostReportRow | null; alerts: CareAlertRecord[];
}) {
  const posterPhotoUrl = recentLostPhotoUrl || photoUrl;
  const posterReady = isPosterReady({ active: Boolean(report), photoUrl: posterPhotoUrl, lastSeenLocation: report?.last_seen_location || null });
  const posterAlerts: PosterAlert[] = alerts
    .filter((alert) => alert.qr_visible)
    .map(({ category, label, severity, instructions }) => ({ category, label, severity, instructions }));
  const publicViewHref = code ? getPublicPetViewHref(code, report?.status === 'active') : '';
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
            {publicViewHref && <Link className="text-button" href={publicViewHref}>Ver ficha pública actual</Link>}
            {report && <Link className="button button--primary pet-detail-poster-link" href="#cartel-se-busca"><PosterDownloadIcon />Crear cartel y descargar imagen</Link>}
          </div>
          <div className={`pet-detail-loss-state ${report ? 'pet-detail-loss-state--lost' : 'pet-detail-loss-state--home'}`}><p><strong>{report ? 'Alerta pública activa' : 'No hay una pérdida activa'}</strong><span>{report ? 'Edita el aviso o confirma por separado que volvió a casa.' : 'Puedes crear un reporte si tu mascota se pierde.'}</span></p><div className="pet-detail-loss-state__actions"><Link className={`button ${report ? 'button--danger' : 'button--outline'}`} href={`/mascotas/${pet.id}/perdida`}>{report ? 'Editar alerta' : 'Reportar pérdida'}</Link>{report && <Link className="button button--outline" href={`/mascotas/${pet.id}/perdida#confirmar-regreso`}>Confirmar regreso</Link>}</div></div>
        </section>
        {report && <div id="cartel-se-busca" className="pet-poster-section">
          {posterReady && code && rescuePhone ? <LostPetPoster pet={{
            name: pet.name,
            species: pet.species,
            code,
            photoUrl: posterPhotoUrl!,
            phone: rescuePhone,
            whatsappPhone: whatsappPhone || rescuePhone,
            qrUrl: getRescueQrUrl(code, getSiteUrl()),
            lastSeenLocation: report.last_seen_location!,
            lastSeenAt: report.last_seen_at,
            wearing: report.wearing,
            message: report.message,
            reward: report.reward,
            alerts: posterAlerts,
          }} /> : <div className="poster-unavailable">
            <h2 id="poster-heading">Cartel de búsqueda</h2>
            <p>Completa estos datos para habilitar la descarga del cartel:</p>
            <ul>
              {!posterPhotoUrl && <li>Agrega una foto de {pet.name}.</li>}
              {!report.last_seen_location?.trim() && <li>Indica la última zona vista.</li>}
              {!rescuePhone && <li>Actualiza el teléfono de llamadas en Mi cuenta o en Contacto de rescate.</li>}
            </ul>
          </div>}
        </div>}
        <nav className="editor-nav" aria-label="Secciones del editor de mascota">
          <Link className="editor-nav__item" href="#identidad"><span>01</span><span><strong>Información</strong><small>Identidad y datos privados</small></span></Link>
          <Link className="editor-nav__item" href="#fotografia"><span>02</span><span><strong>Fotografía</strong><small>Imagen de la ficha</small></span></Link>
          <Link className="editor-nav__item" href="#cuidados"><span>03</span><span><strong>Alertas de cuidado</strong><small>Prioridad y visibilidad QR</small></span></Link>
          <Link className="editor-nav__item" href={`/mascotas/${pet.id}/carnet`}><span>04</span><span><strong>Carnet de salud</strong><small>Vacunas y documentos privados</small></span></Link>
          <Link className="editor-nav__item" href="#contactos"><span>05</span><span><strong>Contacto de rescate</strong><small>Llamadas y WhatsApp</small></span></Link>
          {report && <Link className="editor-nav__item editor-nav__item--urgent" href="#cartel-se-busca"><span>06</span><span><strong>Cartel de búsqueda</strong><small>Compartir la alerta activa</small></span></Link>}
        </nav>
        <div className="pet-editor-layout"><div className="pet-editor-content">
        <section className="pet-details-editor" id="identidad" aria-labelledby="identity-heading">
          <header className="editor-heading"><p className="pet-editor-kicker">01 · Editor privado</p><h2 id="identity-heading">Información de {pet.name}</h2><p>Organiza sus datos por grupo. Guarda los cambios antes de pasar a otra sección.</p></header>
          <PetDetailsForm petId={pet.id} species={pet.species} details={pet} continueLabel="Guardar detalles" />
        </section>
        <section id="fotografia" className="pet-photo-editor" aria-labelledby="pet-photo-heading"><p className="pet-editor-kicker">02 · Apariencia pública</p><h2 id="pet-photo-heading">Fotografía</h2><p>Esta imagen se usa en la ficha pública de rescate.</p><PetPhotoUploadForm petId={pet.id} publicCode={code} /></section>
        <div id="cuidados"><CareAlertManager petId={pet.id} alerts={alerts} /></div>
        <section id="contactos" className="pet-detail-contact" aria-labelledby="contact-heading">
          <div><h2 id="contact-heading">Contacto de rescate</h2><p>Por defecto, llamadas y WhatsApp usan los teléfonos de Mi cuenta. Aquí puedes elegir un contacto distinto para esta mascota.</p></div>
          <PetContactEditor petId={pet.id} enabled={pet.contact_override_enabled} phone={pet.rescue_phone_override} whatsapp={pet.whatsapp_phone_override} />
        </section>
        <DeletePetForm petId={pet.id} publicCode={code} />
        </div><aside className="editor-help"><PetDetail kind="dog" /><h2>Su ficha, lista para ayudar</h2><p>Una fotografía clara y un contacto actualizado ayudan a que quien encuentre a {pet.name} sepa qué hacer.</p><details className="editor-qr"><summary>Ver código QR permanente</summary><QRCodeSVG value={getRescueQrUrl(code, getSiteUrl())} size={160} title={`Código QR de ${pet.name}`} /><p>La dirección se conserva aunque cambie su estado.</p></details><h3>Tú decides qué se comparte</h3><p>Los datos privados de cuidado permanecen en tu cuenta. Solo las alertas que autorices aparecerán en el QR.</p>{publicViewHref && <Link className="button button--outline button--wide" href={publicViewHref}>Revisar ficha pública actual</Link>}</aside></div>
        <PetNote name={pet.name} />
      </div>
    </main>
  );
}

function PosterDownloadIcon() {
  return <svg className="pet-detail-poster-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v4h14v-4" /></svg>;
}
