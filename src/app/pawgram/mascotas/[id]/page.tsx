import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/features/navigation/app-header';
import { PageFrame, PageContent, PageHeading } from '@/components/ui/page-layout';
import { Feed } from '@/features/pawgram-feed/feed';
import { readFeed } from '@/features/pawgram-feed/queries';
import type { publicProfile } from '@/features/pawgram-profiles/domain';
export const dynamic = 'force-dynamic';
export default async function SocialProfilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ antes?: string }> }) {
  const { id } = await params; const { antes } = await searchParams;
  const db = await createClient();
  const response = db ? await db.rpc('pawgram_public_profile', { p_pet: id }) : null;
  const profile = response?.data as (ReturnType<typeof publicProfile> & { pet_id: string; photo_id: string | null }) | null;
  if (!profile) notFound();
  const feed = await readFeed({ petId: id, before: antes });
  return <PageFrame><AppHeader active="pawgram" signedIn={feed.signedIn} /><PageContent className="social-main"><Link href="/pawgram" className="back-link">← Pawgram</Link><PageHeading title={profile.name} description={profile.species} />{profile.photo_id && <Image className="social-profile-photo" src={`/pawgram/imagenes/${profile.photo_id}`} alt={`Foto de ${profile.name}`} width={800} height={600} unoptimized />}{profile.presentation && <p className="social-text">{profile.presentation}</p>}<dl className="social-facts">{([['Raza',profile.breed],['Sexo',profile.sex],['Talla',profile.size],['Edad',profile.age]]).map(([label,value]) => value ? <div key={label}><dt>{label}</dt><dd>{value}</dd></div> : null)}</dl><h2>Sus momentos</h2>{antes && <Link href={`/pawgram/mascotas/${id}`}>Fotos más recientes</Link>}{feed.unavailable ? <p role="status">No pudimos cargar las publicaciones.</p> : <Feed {...feed} base={`/pawgram/mascotas/${id}`} />}</PageContent></PageFrame>;
}
