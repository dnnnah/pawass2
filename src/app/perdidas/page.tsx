import type { Metadata } from 'next';
import Link from 'next/link';
import { AppHeader } from '@/features/navigation/app-header';
import { BrandMark } from '@/features/auth/brand-mark';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import type { PublicLostPet } from '@/features/lost-pets/lost-report-state';
import { LostPetCard } from '@/features/lost-pets/lost-pet-card';
import { createPhotoUrl } from '@/lib/supabase/photo-url';

export const metadata: Metadata = {
  title: 'Mascotas perdidas | PawPass',
  description: 'Ayuda a reunir a una mascota perdida con su familia.',
  alternates: { canonical: `${getSiteUrl()}/perdidas` },
  robots: { index: true, follow: true },
};
export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ especie?: string; ubicacion?: string }> };

export default async function LostPetsPage({ searchParams }: Props) {
  const filters = await searchParams;
  const species = filters.especie === 'perro' || filters.especie === 'gato' ? filters.especie : '';
  const location = (filters.ubicacion || '').trim().slice(0, 80);
  const supabase = await createClient();
  const { data } = supabase ? await supabase.rpc('get_public_lost_pets', { p_species: species || null, p_query: location || null }) : { data: [] };
  const pets = await Promise.all(((data || []) as PublicLostPet[]).map(async (pet) => ({
    ...pet,
    photo_url: await createPhotoUrl('lost-pet-photos', pet.photo_path),
  })));
  return (
    <main className="account-shell public-lost-shell">
      <AppHeader active="lost" />
      <div className="account-main lost-board">
        <header className="lost-board__heading"><div><p className="section-label">Tablón público</p><h1>Mascotas perdidas</h1><p>Ayúdanos a compartir estas alertas activas y a reunir a cada mascota con su familia.</p></div><Link className="button button--outline" href="/">Entrar a PawPass</Link></header>
        <form className="lost-filters" method="get" action="/perdidas">
          <label className="field"><span>Especie</span><select name="especie" defaultValue={species}><option value="">Perros y gatos</option><option value="perro">Perros</option><option value="gato">Gatos</option></select></label>
          <label className="field"><span>Buscar por ubicación</span><input name="ubicacion" defaultValue={location} maxLength={80} placeholder="Ciudad, colonia o zona" /></label>
          <button className="button button--primary" type="submit">Buscar alertas</button>
        </form>
        {pets.length ? <div className="lost-pet-list">{pets.map((pet) => <LostPetCard key={pet.public_code} pet={pet} />)}</div> : <section className="lost-board__empty"><h2>No hay alertas con esos filtros</h2><p>Prueba otra especie o ubicación. Las mascotas aparecen aquí mientras su alerta siga activa.</p><Link href="/perdidas" className="button button--outline">Ver todas las alertas</Link></section>}
        <p className="lost-board__privacy">Las fichas muestran solo datos de rescate y los detalles que el tutor decidió publicar.</p>
      </div>
      <footer className="rescue-footer"><BrandMark /><span>PawPass · Cuidado que acompaña</span></footer>
    </main>
  );
}
