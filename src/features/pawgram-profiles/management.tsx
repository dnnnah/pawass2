'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ProfileEditor, type OwnedProfile } from './profile-editor';
import { PostManager, type OwnedPost } from '@/features/pawgram-posts/post-manager';
export function SocialManagement({petId,name,hasRescuePhoto,profile,available,posts}: {
  petId:string; name:string; hasRescuePhoto:boolean; profile:OwnedProfile|null; available:{breed:string|null;sex:string|null;size:string|null;age:string|null}; posts:OwnedPost[];
}) {
  const [section,setSection]=useState<'profile'|'posts'>('profile');
  const [publishedNotice,setPublishedNotice]=useState(false);
  const active=Boolean(profile?.published && !profile.restriction_reason);
  const notice=useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(publishedNotice && section==='posts' && active)notice.current?.focus();},[publishedNotice,section,active]);
  return <>
    <div className="social-management-status"><span>{profile?.restriction_reason ? 'Perfil restringido' : profile?.published ? 'Perfil publicado' : profile ? 'Perfil oculto' : 'Perfil sin publicar'}</span>{active && <Link href={`/pawgram/mascotas/${petId}`}>Ver perfil público</Link>}</div>
    <nav className="social-management-nav" aria-label="Gestionar Pawgram"><button type="button" aria-pressed={section==='profile'} onClick={()=>setSection('profile')}>Perfil</button><button type="button" aria-pressed={section==='posts'} onClick={()=>setSection('posts')}>Publicaciones ({posts.length})</button></nav>
    <div hidden={section!=='profile'}><ProfileEditor petId={petId} name={name} hasRescuePhoto={hasRescuePhoto} profile={profile} available={available} onPublished={()=>{setPublishedNotice(true);setSection('posts');}} /></div>
    <div hidden={section!=='posts'}>{publishedNotice && active && <p className="social-notice" role="status" ref={notice} tabIndex={-1}>Perfil publicado. Ahora comparte una foto para que {name} aparezca en el feed de Pawgram.</p>}{!active && <p className="social-notice">Primero publica su perfil para compartir fotos. <button className="text-button" type="button" onClick={()=>setSection('profile')}>Ir al perfil</button></p>}<PostManager petId={petId} active={active} posts={posts} /></div>
  </>;
}
