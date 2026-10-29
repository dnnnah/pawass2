import Image from 'next/image';

export function PetNote({ name, rescue = false, recovered = false }: { name?: string; rescue?: boolean; recovered?: boolean }) {
  return (
    <div className={`pet-note ${rescue ? 'pet-note--rescue' : ''}`}>
      <PetDetail kind="sparkle" />
      <Image src="/paw-mark.svg" width={22} height={22} alt="" aria-hidden="true" />
      <p>{recovered ? <><strong>{name}</strong> ya está en casa. Gracias por cuidar sus pasos.</> : rescue ? <>Soy <strong>{name}</strong>. ¿Me ayudas a volver a casa?</> : name ? <>Todo listo para cuidar a <strong>{name}</strong>, huella a huella.</> : <>Pequeñas huellas. Un lugar enorme en tu vida.</>}</p>
      <PetDetail kind="collar" />
    </div>
  );
}

export function PetDetail({ kind = 'sparkle' }: { kind?: 'sparkle' | 'collar' | 'dog' | 'cat' | 'heart' }) {
  return <svg className={`pet-detail pet-detail--${kind}`} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'heart' ? <path d="M16 27S4 20 4 11a6 6 0 0 1 12-1 6 6 0 0 1 12 1c0 9-12 16-12 16Z" /> : kind === 'cat' ? <><path d="M6 13 5 4l9 5h4l9-5-1 9c5 15-25 15-20 0Z" /><path d="m14 18 2 2 2-2m-2 2v3M3 18l7 1m-7 5 7-2m12-3 7-1m-7 4 7 2" /><circle cx="11" cy="15" r=".6" /><circle cx="21" cy="15" r=".6" /></> : kind === 'sparkle' ? <><path d="m16 4 3.2 8.8L28 16l-8.8 3.2L16 28l-3.2-8.8L4 16l8.8-3.2L16 4Z" /><path d="M26 3v5M23.5 5.5h5" /></> : kind === 'collar' ? <><path d="M4 9c7 4 17 4 24 0v6c-7 4-17 4-24 0V9Z" /><path d="M14 17v4m4-4v4" /><path d="m11 24 5-4 5 4-5 5-5-5Z" /><circle cx="16" cy="24" r=".6" /></> : <><path d="M10 11 8 4 3 7l2 14 5-3m12-7 2-7 5 3-2 14-5-3M10 9c4-2 8-2 12 0v12c0 5-12 5-12 0V9Z" /><path d="m14 18 2 2 2-2m-2 2v3" /><circle cx="13" cy="14" r=".6" /><circle cx="19" cy="14" r=".6" /></>}
  </svg>;
}

export function PetTrail() {
  return <div className="pet-trail" aria-hidden="true"><PetDetail kind="sparkle" /><PetDetail kind="dog" /><Image src="/paw-mark.svg" width={26} height={26} alt="" /><PetDetail kind="heart" /><PetDetail kind="cat" /><PetDetail kind="collar" /><PetDetail kind="sparkle" /></div>;
}
