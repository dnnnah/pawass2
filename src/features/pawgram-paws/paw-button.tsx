'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { setPaw } from './actions';
import { ActionMessage, initialSocialState } from '@/features/pawgram-profiles/action-form';
import type { FeedPost } from '@/features/pawgram-feed/domain';
export function PawButton({ post, signedIn }: { post: FeedPost; signedIn: boolean }) {
  const [state, submit, pending] = useActionState(setPaw, initialSocialState);
  return <div><p>{post.paw_count} {post.paw_count === 1 ? 'patita' : 'patitas'}</p>{post.is_own ? <p>Una foto de tu mascota</p> : signedIn ? <form action={submit} aria-busy={pending}><input type="hidden" name="postId" value={post.id} /><input type="hidden" name="present" value={post.has_paw ? 'false' : 'true'} /><button className="button button--outline" aria-pressed={post.has_paw} disabled={pending}>{pending ? 'Guardando…' : post.has_paw ? 'Retirar mi patita' : 'Dar una patita'}</button></form> : <Link href="/acceso" className="button button--outline">Iniciar sesión para dar una patita</Link>}<ActionMessage state={state} /></div>;
}
