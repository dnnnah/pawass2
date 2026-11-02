import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/features/navigation/app-header';
import { PageFrame, PageContent, PageHeading } from '@/components/ui/page-layout';
import { ProfileEditor, type OwnedProfile } from '@/features/pawgram-profiles/profile-editor';
import { PostManager, type OwnedPost } from '@/features/pawgram-posts/post-manager';
import '@/features/pawgram-feed/pawgram.css';
export const metadata: Metadata = { title: 'Gestionar Pawgram | PawPass', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function ManageSocialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const db = await createClient();
  if (!db) return <main className="social-main"><h1>Pawgram necesita conexión con Supabase</h1></main>;
  const { data: { user } } = await db.auth.getUser(); if (!user) redirect('/acceso');
  const { data: pet } = await db.from('pets').select('name,primary_photo_path').eq('id', id).eq('owner_id', user.id).maybeSingle(); if (!pet) notFound();
  const [{ data: profile, error }, { data: posts }] = await Promise.all([
    db.from('pawgram_profiles').select('pet_id,name,species,presentation,breed,sex,size,age_months,age_as_of,photo_id,published,restriction_reason,updated_at').eq('pet_id', id).eq('owner_id', user.id).maybeSingle(),
    db.from('pawgram_posts').select('id,body,alt,photo_id,restriction_reason').eq('pet_id', id).eq('owner_id', user.id).order('created_at', { ascending: false }).order('id', { ascending: false }),
  ]);
  return <PageFrame><AppHeader active="pets" /><PageContent className="social-main"><Link className="back-link" href={`/mascotas/${id}`}>← Ficha de {pet.name}</Link><PageHeading title={`${pet.name} en Pawgram`} description="Tú eliges qué compartir. Su rescate y su carnet conservan sus propios permisos." />{error ? <p role="status">La gestión social aún no está disponible. Comprueba la configuración y las migraciones.</p> : <><ProfileEditor petId={id} hasRescuePhoto={Boolean(pet.primary_photo_path)} profile={profile as OwnedProfile | null} />{profile?.published && !profile.restriction_reason && <p><Link href={`/pawgram/mascotas/${id}`}>Ver perfil social público</Link></p>}<PostManager petId={id} active={Boolean(profile?.published && !profile.restriction_reason)} posts={(posts || []) as OwnedPost[]} /></>}</PageContent></PageFrame>;
}
