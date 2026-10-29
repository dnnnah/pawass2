import { QRCodeSVG } from 'qrcode.react';
import { getSiteUrl } from '@/lib/supabase/env';
import Link from 'next/link';
import Image from 'next/image';

type Pet = {
  id: string;
  name: string;
  species: 'perro' | 'gato';
};

export function PetCard({ pet, code }: { pet: Pet; code: string }) {
  const publicUrl = `${getSiteUrl()}/p/${code}`;
  return (
    <article className="pet-card">
      <div className="pet-card__photo" role="img" aria-label={`Aún no hay una foto registrada de ${pet.name}`}>
        <Image src="/paw-mark.svg" width={64} height={64} alt="" aria-hidden="true" />
        <span>Sin foto registrada todavía</span>
      </div>
      <div className="pet-card__body">
        <div className="pet-card__heading">
          <div><h3>{pet.name}</h3><p>{pet.species === 'perro' ? 'Perro' : 'Gato'} <span aria-hidden="true">·</span> <span className="code-pill">{code}</span></p></div>
          <span className="pet-state"><span aria-hidden="true" />En casa</span>
        </div>
        <button className="button button--danger button--wide" type="button" disabled aria-describedby={`lost-note-${pet.id}`}>Reportar perdida</button>
        <p className="pet-card__pending" id={`lost-note-${pet.id}`}>La alerta de pérdida llegará en una fase posterior.</p>
        <Link className="button button--outline button--wide" href={`/mascotas/${pet.id}`}>Ver ficha de {pet.name}</Link>
        <details className="pet-card__qr">
          <summary>Mostrar código QR</summary>
          <div className="pet-card__qr-preview"><QRCodeSVG value={publicUrl} size={144} level="M" title={`Código QR público de ${pet.name}`} /><a href={`/p/${code}`} target="_blank" rel="noreferrer">Abrir ficha pública</a></div>
        </details>
      </div>
    </article>
  );
}
