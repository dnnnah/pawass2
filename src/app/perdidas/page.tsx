import { LostBoardMessages } from '@/features/lost-pets/lost-board-messages';
import { LostSpeciesFilter } from '@/features/lost-pets/lost-species-filter';
import { PetTrail } from '@/features/brand/pet-note';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AppHeader } from '@/features/navigation/app-header';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import type { PublicLostPet } from '@/features/lost-pets/lost-report-state';
import { LostPetCard } from '@/features/lost-pets/lost-pet-card';
import { createPhotoUrls } from '@/lib/supabase/photo-url';
import { getIdentityFromClaims } from '@/lib/supabase/identity';

export const metadata: Metadata = {
  title: 'Mascotas perdidas | PawPass',
  description: 'Ayuda a reunir a una mascota perdida con su familia.',
  alternates: { canonical: `${getSiteUrl()}/perdidas` },
  robots: { index: true, follow: true },
};
export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ especie?: string }> };

export default async function LostPetsPage({ searchParams }: Props) {
  const filters = await searchParams;
  const species = filters.especie === 'perro' || filters.especie === 'gato' ? filters.especie : '';
  const supabase = await createClient();
  const { data: authData } = supabase ? await supabase.auth.getClaims() : { data: null };
  const identity = getIdentityFromClaims(authData?.claims);
  const { data } = supabase ? await supabase.rpc('get_public_lost_pets', { p_species: species || null, p_query: null }) : { data: [] };
  const pets = (data || []) as PublicLostPet[];
  const photoUrls = await createPhotoUrls('lost-pet-photos', pets.map((pet) => pet.photo_path));
  const petsWithUrls = pets.map((pet) => ({
    ...pet,
    photo_url: pet.photo_path ? photoUrls.get(pet.photo_path) || null : null,
  }));
  return (
    <main className="account-shell public-lost-shell">
        <AppHeader active="lost" signedIn={Boolean(identity)} />
      <div className="account-main lost-board">
        <header className="lost-board__heading"><div><h1>Mascotas perdidas</h1><p>Ayúdanos a compartir estas alertas activas y a reunir a cada mascota con su familia.</p></div></header>
        <PetTrail />
        <LostBoardMessages />
        <LostSpeciesFilter species={species} />
        <div className="lost-results-heading"><h2>Alertas de búsqueda</h2><p role="status">{pets.length} {pets.length === 1 ? 'alerta activa' : 'alertas activas'}{species ? ' con estos filtros' : ''}</p>{species && <Link href="/perdidas">Limpiar filtros</Link>}</div>
        {petsWithUrls.length ? <div className="lost-pet-list">{petsWithUrls.map((pet) => <LostPetCard key={pet.public_code} pet={pet} />)}</div> : <section className="lost-board__empty"><h2>{species ? 'No encontramos alertas con esos filtros' : 'No hay búsquedas activas por ahora'}</h2><p>{species ? 'Prueba otra especie o consulta todas las alertas.' : 'Aquí aparecen las mascotas con una alerta de pérdida activa. Cuando vuelven a casa, dejan el tablón.'}</p>{species && <Link href="/perdidas" className="button button--outline">Ver todas las alertas</Link>}</section>}
        <p className="lost-board__privacy">Las fichas muestran solo datos de rescate y los detalles que el tutor decidió publicar.</p>
      </div>
    </main>
  );
}
