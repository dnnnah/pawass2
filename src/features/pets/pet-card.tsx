import Link from 'next/link';
import Image from 'next/image';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';
import { getPublicPetViewHref } from './pet-card-domain';
import './pet-card.css';

type Pet = {
  id: string;
  name: string;
  species: 'perro' | 'gato';
};

export function PetCard({ pet, code, report, photoUrl }: { pet: Pet; code: string; report?: LostReportRow | null; photoUrl?: string | null }) {
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
        <div className="pet-card__navigation">
          <Link className="button button--primary" href={currentPublicView}>Ver ficha pública</Link>
          <nav aria-label={`Gestionar a ${pet.name}`}>
            <Link href={`/mascotas/${pet.id}`}>Editar mascota</Link>
            <Link href={`/mascotas/${pet.id}/perdida`}>{isLost ? 'Gestionar pérdida' : 'Reportar pérdida'}</Link>
          </nav>
        </div>
      </div>
    </article>
  );
}
