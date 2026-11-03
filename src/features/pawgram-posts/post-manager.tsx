'use client';
import Image from 'next/image';
import { useActionState, useState, useTransition } from 'react';
import { SocialForm } from '@/features/pawgram-profiles/action-form';
import { ActionMessage, initialSocialState } from '@/features/pawgram-profiles/action-form';
import { createPost, deletePost, discardPostPhotoUpload, editPost, preparePostPhotoUpload } from './actions';
import { convertImageToWebp } from '@/lib/image';
import { createClient } from '@/lib/supabase/client';

export type OwnedPost = { id: string; body: string; alt: string; photo_id: string; restriction_reason: string | null };

export function PostManager({ petId, active, posts }: { petId: string; active: boolean; posts: OwnedPost[] }) {
  const [creating, setCreating] = useState(posts.length === 0);
  return <section className="social-section" aria-labelledby="posts-title"><h2 id="posts-title">Publicaciones</h2>
    {active ? <details open={creating} onToggle={event => setCreating(event.currentTarget.open)}><summary>Publicar foto</summary><PostUploadForm petId={petId} /></details> : <p>Para publicar una foto, el perfil debe estar publicado y sin restricciones.</p>}
    {!posts.length && <p>Aún no hay publicaciones. Cuando publiques una foto, podrás gestionar aquí su texto y descripción.</p>}
    <div className="social-grid">{posts.map(post => <article className="social-card" key={post.id}>
      <Image src={`/pawgram/imagenes/${post.photo_id}?privada=1`} alt={post.alt} width={640} height={480} unoptimized />
      <div className="social-card-body">{post.restriction_reason && <p className="social-notice"><strong>Restricción administrativa:</strong> {post.restriction_reason}</p>}
      <p>{post.body || 'Foto sin texto.'}</p>
      <details><summary>Editar texto y descripción</summary><SocialForm action={editPost} label="Guardar textos"><input type="hidden" name="postId" value={post.id} /><PostFields post={post} /></SocialForm></details>
      <details><summary>Eliminar publicación</summary><p>Se eliminarán esta foto social y sus patitas. La ficha de rescate no cambia.</p><SocialForm action={deletePost} label="Eliminar definitivamente" secondary><input type="hidden" name="postId" value={post.id} /><label className="social-check"><input name="confirmDelete" type="checkbox" required />Confirmo que quiero eliminar esta publicación.</label></SocialForm></details>
      </div></article>)}</div>
  </section>;
}

function PostUploadForm({ petId }: { petId: string }) {
  const [state, action, pendingAction] = useActionState(createPost, initialSocialState);
  const [pendingUpload, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const source = data.get('photo');
    if (!(source instanceof File) || !source.size) { setMessage('Elige una fotografía.'); return; }
    let stagedPath = '';
    try {
      const photo = await convertImageToWebp(source, 10 * 1024 * 1024);
      const prepared = await preparePostPhotoUpload(petId);
      if (!prepared.ok) throw new Error(prepared.message);
      stagedPath = prepared.path;
      const { error } = await createClient().storage.from('pawgram-photos').uploadToSignedUrl(prepared.path, prepared.token, photo, { contentType: 'image/webp', upsert: false });
      if (error) throw error;
      data.delete('photo');
      data.set('photoUploadPath', prepared.path);
      startTransition(() => action(data));
      form.reset();
    } catch (error) {
      if (stagedPath) await discardPostPhotoUpload(petId, stagedPath);
      setMessage(error instanceof Error ? error.message : 'No pudimos preparar la fotografía.');
    }
  }
  return <form onSubmit={submit} className="social-form" aria-busy={pendingAction || pendingUpload}>
    <input type="hidden" name="petId" value={petId} />
    <label>Una fotografía<input type="file" name="photo" accept="image/jpeg,image/png,image/webp,image/avif" required /><small>Hasta 10 MB. Se convierte a WebP en tu dispositivo y el servidor vuelve a validarla.</small></label>
    <PostFields />
    <p>La foto quedará fija. Para sustituirla tendrás que eliminar la publicación y crear otra, sin trasladar sus patitas.</p>
    <button className="button button--primary" disabled={pendingAction || pendingUpload}>{pendingAction || pendingUpload ? 'Subiendo…' : 'Publicar foto'}</button>
    <p role="status" className="social-message">{message}</p><ActionMessage state={state} />
  </form>;
}

function PostFields({ post }: { post?: OwnedPost }) {
  return <><label>Texto opcional<textarea name="body" maxLength={1000} rows={3} defaultValue={post?.body || ''} /><small>Hasta 1.000 caracteres.</small></label><label>Descripción accesible de la foto<textarea name="alt" required maxLength={500} rows={3} defaultValue={post?.alt || ''} /><small>Describe lo que se ve para quienes no pueden ver la foto. Hasta 500 caracteres.</small></label></>;
}
