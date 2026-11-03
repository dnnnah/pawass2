import { getOwnedReports } from '@/features/lost-pets/owned-reports';
import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLostPetDetail, type PublicLostPetDetailData } from '@/features/lost-pets/public-lost-pet';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import { isPublicPetCode } from '@/lib/domain';
import { createPhotoUrl } from '@/lib/supabase/photo-url';
import { getPublicLostPet } from '@/features/lost-pets/public-queries';

type Props = { params: Promise<{ code: string }> };
type LostPet = PublicLostPetDetailData & { photo_path: string | null };

const getLostPet = cache(async (code: string): Promise<{ status: 'found'; pet: LostPet; supabase: NonNullable<Awaited<ReturnType<typeof createClient>>> } | { status: 'missing' | 'unavailable' }> => {
  if (!isPublicPetCode(code)) return { status: 'missing' };
  const supabase = await createClient();
  if (!supabase) return { status: 'unavailable' };
  const result = await getPublicLostPet(supabase, code);
  if (result.status !== 'found') return result;
  return { status: 'found', pet: result.pet as LostPet, supabase };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const result = await getLostPet(code);
  if (result.status !== 'found') return { title: 'Alerta de mascota | PawPass', robots: { index: false, follow: false, noarchive: true } };
  const pet = result.pet;
  const location = pet.last_seen_location || 'Ubicación pendiente';
  return {
    title: `${pet.pet_name} está perdida | PawPass`,
    description: `${pet.species === 'perro' ? 'Perro' : 'Gato'} perdido: ${pet.pet_name}. Última ubicación: ${location}. Ayuda a contactar a su familia.`,
    alternates: { canonical: `${getSiteUrl()}/perdidas/${encodeURIComponent(code)}` },
    robots: { index: true, follow: true },
  };
}

export const dynamic = 'force-dynamic';

export default async function LostPetPage({ params }: Props) {
  const { code } = await params;
  if (!isPublicPetCode(code)) notFound();
  const result = await getLostPet(code);
  if (result.status !== 'found') {
    if (result.status === 'missing') notFound();
    throw new Error('No se pudo cargar la alerta pública.');
  }
  const { pet, supabase } = result;
  const [{ data: authData }, photos] = await Promise.all([
    supabase.auth.getClaims(),
    pet.photo_path ? Promise.resolve({ data: null, error: null }) : supabase.rpc('get_public_pet_photo', { p_code: code }),
  ]);
  if (photos.error) throw new Error('No se pudo cargar la alerta pública.');
  const signedIn = Boolean(authData?.claims?.sub);
  const ownedReportsPromise = typeof authData?.claims?.sub === 'string' ? getOwnedReports(supabase, authData.claims.sub) : Promise.resolve(new Map());
  const photoUrlPromise = pet.photo_path
    ? createPhotoUrl('lost-pet-photos', pet.photo_path, supabase)
    : createPhotoUrl('pet-photos', (photos.data as { photo_path?: string | null }[] | null)?.[0]?.photo_path, supabase);
  const [ownedReports, photoUrl] = await Promise.all([ownedReportsPromise, photoUrlPromise]);
  return <PublicLostPetDetail pet={pet} photoUrl={photoUrl} signedIn={signedIn} ownedReport={ownedReports.get(code)} />;
}
