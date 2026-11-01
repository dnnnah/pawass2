import { getOwnedReports } from '@/features/lost-pets/owned-reports';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLostPetDetail, type PublicLostPetDetailData } from '@/features/lost-pets/public-lost-pet';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import { isPublicPetCode } from '@/lib/domain';
import { createPhotoUrl } from '@/lib/supabase/photo-url';

type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ vista?: string }> };
type LostPet = PublicLostPetDetailData & { photo_path: string | null };

async function getLostPet(code: string): Promise<LostPet | null> {
  const supabase = await createClient();
  if (!supabase || !isPublicPetCode(code)) return null;
  const { data, error } = await supabase.rpc('get_public_lost_pet', { p_code: code });
  if (error) return null;
  return (data?.[0] as LostPet | undefined) || null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { code } = await params;
  const pet = await getLostPet(code);
  if (!pet) return { title: 'Alerta de mascota | PawPass', robots: { index: false, follow: false, noarchive: true } };
  const location = pet.last_seen_location || 'Ubicación pendiente';
  return {
    title: `${pet.pet_name} está perdida | PawPass`,
    description: `${pet.species === 'perro' ? 'Perro' : 'Gato'} perdido: ${pet.pet_name}. Última ubicación: ${location}. Ayuda a contactar a su familia.`,
    alternates: { canonical: `${getSiteUrl()}/perdidas/${encodeURIComponent(code)}` },
    robots: (await searchParams).vista === 'previa' ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const dynamic = 'force-dynamic';

export default async function LostPetPage({ params, searchParams }: Props) {
  const { code } = await params;
  const supabase = await createClient();
  if (!supabase || !isPublicPetCode(code)) notFound();
  const [{ data }, { data: authData }] = await Promise.all([
    supabase.rpc('get_public_lost_pet', { p_code: code }),
    supabase.auth.getClaims(),
  ]);
  const pet = (data?.[0] as LostPet | undefined) || null;
  if (!pet) notFound();
  const isPreview = (await searchParams).vista === 'previa';
  const signedIn = Boolean(authData?.claims?.sub);
  const ownedReports = typeof authData?.claims?.sub === 'string' ? await getOwnedReports(supabase, authData.claims.sub) : new Map();
  const { data: photos } = pet.photo_path ? { data: null } : await supabase.rpc('get_public_pet_photo', { p_code: code });
  const photoUrl = pet.photo_path
    ? await createPhotoUrl('lost-pet-photos', pet.photo_path, supabase)
    : await createPhotoUrl('pet-photos', photos?.[0]?.photo_path, supabase);
  return <PublicLostPetDetail pet={pet} photoUrl={photoUrl} signedIn={!isPreview && signedIn} ownedReport={isPreview ? undefined : ownedReports.get(code)} />;
}
