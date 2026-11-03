import Link from 'next/link';
type Choice = { id: string; name: string; species: string; published: boolean };
export function SocialPetPicker({ pets }: { pets: Choice[] }) {
  if (!pets.length) return <div className="social-notice"><h2>Primero agrega una mascota</h2><p>Su ficha de rescate y su perfil social se gestionan por separado.</p><Link className="button button--primary" href="/mascotas">Ir a Mis mascotas</Link></div>;
  return <ul className="social-pet-list">{pets.map(pet => <li key={pet.id}><div><h2>{pet.name}</h2><p>{pet.species === 'gato' ? 'Gato' : 'Perro'} · {pet.published ? 'Perfil publicado' : 'Todavía no está en Pawgram'}</p></div><Link className="button button--primary" href={`/mascotas/${pet.id}/pawgram`}>{pet.published ? `Gestionar a ${pet.name}` : `Crear perfil de ${pet.name}`}</Link></li>)}</ul>;
}
