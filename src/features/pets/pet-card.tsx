import { EditorIcon } from './editor-icon';
import { PetStatusBadge } from './pet-status';
import { PawPlaceholder } from '@/components/ui/page-layout';
import { QuickRecovery } from '@/features/lost-pets/lost-report-form';
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
        {photoUrl ? <Image src={photoUrl} width={360} height={240} alt={`Foto de ${pet.name}`} unoptimized /> : <><PawPlaceholder /><span>Sin foto registrada</span></>}
      </div>
      <div className="pet-card__body">
        <div className="pet-card__heading">
          <div><h2>{pet.name}</h2><p>{pet.species === 'perro' ? 'Perro' : 'Gato'} <span aria-hidden="true">·</span> <span className="code-pill">{code}</span></p></div>
          <PetStatusBadge status={isLost ? 'lost' : 'home'} />
        </div>
        <div className="pet-card__navigation">
          <Link className="button button--primary" href={currentPublicView}>Ver ficha pública</Link>
          <nav aria-label={`Gestionar a ${pet.name}`}>
            <Link className="button button--outline" href={`/mascotas/${pet.id}`}><EditorIcon kind="info" />Editar ficha</Link>
            <Link className={`button button--outline ${isLost ? 'pet-card__loss-link' : ''}`} href={`/mascotas/${pet.id}/perdida`}><EditorIcon kind="care" />{isLost ? 'Editar alerta' : 'Reportar pérdida'}</Link>
          </nav>
          {isLost && report && <QuickRecovery reportId={report.id} />}
        </div>
      </div>
    </article>
  );
}
