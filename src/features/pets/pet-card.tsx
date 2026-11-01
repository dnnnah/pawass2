import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteUrl } from '@/lib/supabase/env';
import { getPosterEditorHref } from '@/features/lost-pets/poster-domain';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';
import { getPublicPetViewHref } from './pet-card-domain';
import './pet-card.css';

type Pet = {
  id: string;
  name: string;
  species: 'perro' | 'gato';
};

export function PetCard({ pet, code, report, photoUrl }: { pet: Pet; code: string; report?: LostReportRow | null; photoUrl?: string | null }) {
  const publicUrl = `${getSiteUrl()}/p/${code}`;
  const isLost = report?.status === 'active';
  const currentPublicView = getPublicPetViewHref(code, isLost);
  return (
    <article className="pet-card">
      <div className="pet-card__photo" role={photoUrl ? undefined : 'img'} aria-label={photoUrl ? undefined : `Aún no hay una foto registrada de ${pet.name}`}>
        {photoUrl ? <Image src={photoUrl} width={360} height={240} alt={`Foto de ${pet.name}`} unoptimized /> : <><Image src="/paw-mark.svg" width={64} height={64} alt="" aria-hidden="true" /><span>Sin foto registrada</span></>}
      </div>
      <div className="pet-card__body">
        <div className="pet-card__heading">
          <div><h2>{pet.name}</h2><p>{pet.species === 'perro' ? 'Perro' : 'Gato'} <span aria-hidden="true">·</span> <span className="code-pill">{code}</span></p></div>
          <span className={`pet-state ${isLost ? 'pet-state--lost' : ''}`}><span aria-hidden="true" />{isLost ? 'Perdida' : 'En casa'}</span>
        </div>
        <div className="pet-card__areas">
          <section className="pet-card__area pet-card__area--public" aria-labelledby={`public-heading-${pet.id}`}>
            <header className="pet-card__area-heading"><div><p className="pet-card__eyebrow">Lo que otras personas pueden ver</p><h3 id={`public-heading-${pet.id}`}>Ficha pública</h3></div><span className={`pet-card__area-badge ${isLost ? 'pet-card__area-badge--lost' : ''}`}>{isLost ? 'Búsqueda activa' : 'QR de rescate'}</span></header>
            <p>{isLost ? 'La vista pública abre directamente la ficha de búsqueda mientras la alerta esté activa.' : 'La ficha QR muestra los contactos de rescate y solo las alertas que autorizaste.'}</p>
            <Link className={`button ${isLost ? 'button--danger' : 'button--primary'} button--wide`} href={currentPublicView}>{isLost ? 'Ver ficha de búsqueda' : 'Ver ficha QR'}</Link>
            <details className="pet-card__qr">
              <summary>Ver código QR permanente</summary>
              <div className="pet-card__qr-preview"><p>El QR impreso conserva la dirección de rescate. {isLost ? 'Durante una pérdida, su ficha avisa el estado y enlaza con esta búsqueda.' : 'Sigue funcionando aunque cambie el estado de la mascota.'}</p><QRCodeSVG value={publicUrl} size={160} level="M" title={`Código QR público de ${pet.name}`} /><a href={`/p/${code}`} target="_blank" rel="noreferrer">Probar la dirección del QR <span className="sr-only">(abre en otra pestaña)</span></a></div>
            </details>
          </section>

          <section className="pet-card__area" aria-labelledby={`editor-heading-${pet.id}`}>
            <header className="pet-card__area-heading"><div><p className="pet-card__eyebrow">Solo para ti</p><h3 id={`editor-heading-${pet.id}`}>Editor de mascota</h3></div><span className="pet-card__area-badge">Privado</span></header>
            <p>Actualiza su información, foto, contactos y carnet de salud.</p>
            <div className="pet-card__area-actions"><Link className="button button--primary button--wide" href={`/mascotas/${pet.id}`}>Editar información</Link><Link className="button button--outline button--wide" href={`/mascotas/${pet.id}/carnet`}>Carnet de salud</Link></div>
          </section>

          <section className={`pet-card__area pet-card__area--loss ${isLost ? 'pet-card__area--loss-active' : ''}`} aria-labelledby={`loss-heading-${pet.id}`}>
            <header className="pet-card__area-heading"><div><p className="pet-card__eyebrow">Estado de búsqueda</p><h3 id={`loss-heading-${pet.id}`}>Pérdida</h3></div><span className={`pet-card__area-badge ${isLost ? 'pet-card__area-badge--lost' : ''}`}>{isLost ? 'Perdida' : 'En casa'}</span></header>
            {isLost && report ? <p>{report.last_seen_location || 'Ubicación pendiente'} · Alerta activa desde {new Date(report.lost_at).toLocaleDateString('es-MX')}</p> : <p>Si se pierde, desde aquí puedes crear una alerta pública.</p>}
            <div className="pet-card__area-actions">{isLost ? <><Link className="button button--danger button--wide" href={`/mascotas/${pet.id}/perdida`}>Editar alerta</Link><Link className="button button--outline button--wide" href={`/mascotas/${pet.id}/perdida#confirmar-regreso`}>Confirmar que ya está en casa</Link><Link className="button button--primary button--wide pet-card__poster-link" href={getPosterEditorHref(pet.id)}><PosterDownloadIcon />Crear cartel</Link></> : <Link className="button button--outline button--wide" href={`/mascotas/${pet.id}/perdida`}>Reportar pérdida</Link>}</div>
          </section>
        </div>
      </div>
    </article>
  );
}

function PosterDownloadIcon() {
  return <svg className="pet-card__poster-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 16v4h14v-4" /></svg>;
}
