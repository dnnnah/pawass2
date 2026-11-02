import { QuickRecovery } from './lost-report-form';
import type { OwnedReport } from './owned-reports';
import Link from 'next/link';
import Image from 'next/image';
import type { PublicLostPet } from './lost-report-state';
import { PawPlaceholder } from '@/components/ui/page-layout';

export function LostPetCard({ pet, ownedReport }: { pet: PublicLostPet; ownedReport?: OwnedReport }) {
  return (
    <article className="lost-pet-card">
      <div className="lost-pet-card__photo" role={pet.photo_url ? undefined : 'img'} aria-label={pet.photo_url ? undefined : `Sin fotografía de ${pet.pet_name}`}>{pet.photo_url ? <Image src={pet.photo_url} alt={`Foto reciente de ${pet.pet_name}`} width={360} height={240} unoptimized /> : <PawPlaceholder />}</div>
      <div className="lost-pet-card__body">
        <div className="lost-pet-card__meta"><span className="lost-status"><span aria-hidden="true" />Alerta activa</span><span>{pet.species === 'perro' ? 'Perro' : 'Gato'} · Código {pet.public_code}</span></div>
        <h2>{pet.pet_name}</h2>
        <p className="lost-pet-card__location"><strong>Última ubicación</strong><span>{pet.last_seen_location || 'Ubicación pendiente'}</span></p>
        {pet.last_seen_at && <p className="lost-pet-card__date">Vista por última vez: {new Date(pet.last_seen_at).toLocaleString('es-MX')}</p>}
        <div className="lost-pet-card__actions">
          <Link className="button button--primary button--wide" href={`/perdidas/${pet.public_code}`}>Ver ficha y contactar</Link>
        </div>
        {ownedReport && <div className="lost-card-owner"><span>Tu mascota</span><Link href={`/mascotas/${ownedReport.petId}/perdida`}>Editar alerta y cartel</Link><QuickRecovery reportId={ownedReport.reportId} /></div>}
      </div>
    </article>
  );
}
