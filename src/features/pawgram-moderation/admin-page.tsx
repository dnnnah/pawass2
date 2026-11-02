import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/features/navigation/app-header';
import { PageFrame, PageContent, PageHeading } from '@/components/ui/page-layout';
import { ModerationForm } from '@/features/pawgram-moderation/moderation-form';
export default async function AdministrationPage({ searchParams }: { searchParams: Promise<{ perfiles?: string; publicaciones?: string }> }) {
  const db = await createClient(); if (!db) notFound();
  const { data: { user } } = await db.auth.getUser(); if (!user) redirect('/acceso');
  const { data: admin } = await db.rpc('pawgram_is_admin'); if (!admin) notFound();
  const params = await searchParams;
  let profilesQuery = db.from('pawgram_profiles').select('pet_id,name,published,restriction_reason,photo_id').order('pet_id').limit(21);
  let postsQuery = db.from('pawgram_posts').select('id,pet_id,photo_id,body,alt,restriction_reason').order('id').limit(21);
  if (params.perfiles) profilesQuery = profilesQuery.gt('pet_id', params.perfiles);
  if (params.publicaciones) postsQuery = postsQuery.gt('id', params.publicaciones);
  const [{ data: profiles, error: profileError }, { data: posts, error: postError }] = await Promise.all([profilesQuery, postsQuery]);
  return <PageFrame><AppHeader active="pawgram" /><PageContent className="social-main"><Link href="/pawgram">← Pawgram</Link><PageHeading title="Administrar Pawgram" description="Revisa el contenido y registra un motivo para el tutor. Restaurar respeta su elección de publicación y las restricciones restantes." />{profileError || postError ? <p role="status">No pudimos cargar el contenido. Revisa los parámetros e inténtalo de nuevo.</p> : <><h2>Perfiles</h2>{(profiles || []).slice(0,20).map(profile => <article key={profile.pet_id} className="social-section"><h3>{profile.name}</h3><p>{profile.published ? 'El tutor eligió publicar' : 'Oculto por el tutor'} · {profile.restriction_reason ? `Restringido: ${profile.restriction_reason}` : 'Sin restricción administrativa'}</p>{profile.photo_id && <Image className="social-profile-photo" src={`/pawgram/imagenes/${profile.photo_id}?privada=1`} alt={`Foto del perfil de ${profile.name}`} width={640} height={480} unoptimized />}<ModerationForm kind="profile" id={profile.pet_id} /></article>)}{profiles && profiles.length > 20 && <Link className="button button--outline" href={`/pawgram/administracion?perfiles=${profiles[19].pet_id}`}>Más perfiles</Link>}<h2>Publicaciones</h2><div className="social-grid">{(posts || []).slice(0,20).map(post => <article className="social-card" key={post.id}><Image src={`/pawgram/imagenes/${post.photo_id}?privada=1`} alt={post.alt} width={640} height={480} unoptimized /><div className="social-card-body"><p className="social-text">{post.body}</p><p>{post.restriction_reason ? `Restringida: ${post.restriction_reason}` : 'Sin restricción individual'}</p><ModerationForm kind="post" id={post.id} /></div></article>)}</div>{posts && posts.length > 20 && <Link className="button button--outline" href={`/pawgram/administracion?publicaciones=${posts[19].id}`}>Más publicaciones</Link>}</>}</PageContent></PageFrame>;
}
