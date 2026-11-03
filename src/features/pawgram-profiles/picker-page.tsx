import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/features/navigation/app-header';
import { PageFrame, PageContent, PageHeading } from '@/components/ui/page-layout';
import { SocialPetPicker } from './pet-picker';
export default async function SocialPetsPage() {
  const db = await createClient();
  if (!db) return <main><h1>No pudimos conectar con Pawgram</h1></main>;
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/acceso');
  const [{ data: pets, error }, { data: profiles, error: profileError }] = await Promise.all([
    db.from('pets').select('id,name,species').eq('owner_id',user.id).order('created_at'),
    db.from('pawgram_profiles').select('pet_id,published,restriction_reason').eq('owner_id',user.id),
  ]);
  return <PageFrame><AppHeader active="pawgram" /><PageContent className="social-main"><Link className="back-link" href="/pawgram">← Pawgram</Link><PageHeading title="Mis mascotas en Pawgram" description="Elige a quién quieres presentar. Primero publica su perfil y después comparte su primera foto." />{error || profileError ? <p role="status">No pudimos cargar tus mascotas. Recarga la página para intentarlo de nuevo.</p> : <SocialPetPicker pets={(pets || []).map(pet=>({...pet,published:Boolean(profiles?.find(p=>p.pet_id===pet.id && p.published && !p.restriction_reason))}))} />}</PageContent></PageFrame>;
}
