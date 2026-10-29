import { PetDetail } from '@/features/brand/pet-note';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteUrl } from '@/lib/supabase/env';
import { LostReportForm, RecoverPetForm } from '@/features/lost-pets/lost-report-form';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';

type Pet = {
  id: string;
  name: string;
  species: 'perro' | 'gato';
};

export function PetCard({ pet, code, report, photoUrl }: { pet: Pet; code: string; report?: LostReportRow | null; photoUrl?: string | null }) {
  const publicUrl = `${getSiteUrl()}/p/${code}`;
  const isLost = report?.status === 'active';
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
        <p className="pet-card__note"><PetDetail kind="collar" /> {pet.name}, sus pequeños detalles a la mano.</p>
        <LostReportForm petId={pet.id} report={report} />
        {isLost && report && <>
          <p className="pet-card__lost-summary">{report.last_seen_location || 'Ubicación pendiente'} · Alerta activa desde {new Date(report.lost_at).toLocaleDateString('es-MX')}</p>
          <Link className="button button--outline button--wide" href={`/perdidas/${code}`}>Ver ficha pública de pérdida</Link>
          <RecoverPetForm report={report} />
        </>}
        <Link className="button button--outline button--wide" href={`/mascotas/${pet.id}`}>Editar ficha de {pet.name}</Link>
        <details className="pet-card__qr">
          <summary>Mostrar código QR</summary>
          <div className="pet-card__qr-preview"><QRCodeSVG value={publicUrl} size={144} level="M" title={`Código QR público de ${pet.name}`} /><a href={`/p/${code}`} target="_blank" rel="noreferrer">Abrir ficha habitual</a></div>
        </details>
      </div>
    </article>
  );
}
