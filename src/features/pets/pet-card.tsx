import { QRCodeSVG } from 'qrcode.react';
import { PetContactEditor } from './pet-contact-editor';
import { getSiteUrl } from '@/lib/supabase/env';

type Pet = {
  id: string;
  name: string;
  species: 'perro' | 'gato';
  contact_override_enabled: boolean;
  rescue_phone_override: string | null;
  whatsapp_phone_override: string | null;
};

export function PetCard({ pet, code }: { pet: Pet; code: string }) {
  const publicUrl = `${getSiteUrl()}/p/${code}`;
  return (
    <article className="pet-row">
      <div className="pet-row__identity">
        <div className="pet-avatar" aria-hidden="true">{pet.species === 'perro' ? <DogIcon /> : <CatIcon />}</div>
        <div><h3>{pet.name}</h3><p>{pet.species === 'perro' ? 'Perro' : 'Gato'} <span className="code-pill">{code}</span></p></div>
      </div>
      <div className="pet-row__qr">
        <QRCodeSVG value={publicUrl} size={104} level="M" title={`Código QR público de ${pet.name}`} />
        <a href={`/p/${code}`} target="_blank" rel="noreferrer">Abrir ficha QR</a>
      </div>
      <PetContactEditor
        petId={pet.id}
        enabled={pet.contact_override_enabled}
        phone={pet.rescue_phone_override}
        whatsapp={pet.whatsapp_phone_override}
      />
    </article>
  );
}

function DogIcon() {
  return <svg viewBox="0 0 32 32"><path d="m8 10-4-3-1 7 5 3m16-7 4-3 1 7-5 3M9 9c1-3 4-5 7-5s6 2 7 5l2 13c0 4-4 7-9 7s-9-3-9-7L9 9Z"/><circle cx="12" cy="16" r="1"/><circle cx="20" cy="16" r="1"/><path d="M14 20h4l-2 3-2-3Z"/></svg>;
}

function CatIcon() {
  return <svg viewBox="0 0 32 32"><path d="M6 13 5 4l8 5a11 11 0 0 1 6 0l8-5-1 9a11 11 0 1 1-20 0Z"/><circle cx="12" cy="16" r="1"/><circle cx="20" cy="16" r="1"/><path d="M15 20h2l-1 2-1-2Zm-8 1-4-1m7 2-4 1m16-2 4-1m-7 2 4 1"/></svg>;
}
