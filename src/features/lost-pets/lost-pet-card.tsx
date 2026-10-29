import { PetDetail } from '@/features/brand/pet-note';
import Link from 'next/link';
import Image from 'next/image';
import type { PublicLostPet } from './lost-report-state';
import { WhatsAppActions } from '@/features/rescue/whatsapp-actions';

export function LostPetCard({ pet }: { pet: PublicLostPet }) {
  return (
    <article className="lost-pet-card">
      <div className="lost-pet-card__photo" role={pet.photo_url ? undefined : 'img'} aria-label={pet.photo_url ? undefined : `Sin fotografía de ${pet.pet_name}`}>{pet.photo_url ? <Image src={pet.photo_url} alt={`Foto reciente de ${pet.pet_name}`} width={360} height={240} unoptimized /> : <PawIcon />}</div>
      <div className="lost-pet-card__body">
        <div className="lost-pet-card__meta"><span className="lost-status"><span aria-hidden="true" />Alerta activa</span><span>{pet.species === 'perro' ? 'Perro' : 'Gato'} · Código {pet.public_code}</span></div>
        <h2>{pet.pet_name}</h2><p className="lost-pet-card__wish"><PetDetail kind="sparkle" /> Soy {pet.pet_name}. ¿Me ayudas a volver a casa?</p>
        <p className="lost-pet-card__location"><strong>Última ubicación</strong><span>{pet.last_seen_location || 'Ubicación pendiente'}</span></p>
        {pet.last_seen_at && <p className="lost-pet-card__date">Vista por última vez: {new Date(pet.last_seen_at).toLocaleString('es-MX')}</p>}
        {pet.wearing && <p><strong>Señas o ropa:</strong> {pet.wearing}</p>}
        {pet.message && <p>{pet.message}</p>}
        {pet.reward && <p><strong>Recompensa:</strong> {pet.reward}</p>}
        <div className="lost-pet-card__actions">
          <WhatsAppActions name={pet.pet_name} code={pet.public_code} whatsapp={pet.whatsapp_phone} urgent />
          <Link className="button button--urgent-outline button--wide" href={`/perdidas/${pet.public_code}`}>Ver ficha completa</Link>
        </div>
      </div>
    </article>
  );
}

function PawIcon() {
  return <svg aria-hidden="true" viewBox="0 0 100 100"><ellipse cx="22" cy="24" rx="8" ry="12" transform="rotate(-22 22 24)"/><ellipse cx="42" cy="16" rx="8" ry="12"/><ellipse cx="63" cy="20" rx="8" ry="12" transform="rotate(18 63 20)"/><ellipse cx="79" cy="36" rx="7" ry="10" transform="rotate(32 79 36)"/><path d="M49 39c-14 0-34 22-28 36 4 10 18 2 28 2s24 8 28-2c6-14-14-36-28-36Z"/></svg>;
}
