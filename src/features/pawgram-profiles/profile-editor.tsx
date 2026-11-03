'use client';
import { useActionState, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { prepareProfile, publishProfile, hideProfile, type SocialState } from './actions';
import { socialWarning, type Snapshot } from './domain';
import { SocialForm, ActionMessage, initialSocialState } from './action-form';
export type OwnedProfile = Snapshot & { pet_id: string; photo_id: string | null; published: boolean; restriction_reason: string | null; updated_at: string };
type Available = { breed: string | null; sex: string | null; size: string | null; age: string | null };
export function ProfileEditor({ petId, name = 'tu mascota', hasRescuePhoto, profile, available, onPublished }: {
  petId: string; name?: string; hasRescuePhoto: boolean; profile: OwnedProfile | null; available?: Available; onPublished?: () => void;
}) {
  const [state, prepare, pending] = useActionState(prepareProfile, initialSocialState);
  const [dismissed, setDismissed] = useState<string | undefined>();
  const [presentation, setPresentation] = useState(profile?.presentation || '');
  const [photo, setPhoto] = useState(profile?.photo_id ? 'keep' : 'none');
  const [choices, setChoices] = useState({ breed: Boolean(profile?.breed), sex: Boolean(profile?.sex), size: Boolean(profile?.size), age: Boolean(profile && profile.age_months !== null) });
  const reviewing = Boolean(state.preview && state.token && state.token !== dismissed);
  return <section className="social-section" aria-labelledby="social-profile-title">
    <h2 id="social-profile-title">{reviewing ? 'Revisa antes de publicar' : `El perfil de ${name}`}</h2>
    <ol className="social-steps" aria-label="Pasos para publicar el perfil"><li aria-current={!reviewing ? 'step' : undefined}>Datos del perfil</li><li aria-current={reviewing ? 'step' : undefined}>Vista previa y publicación</li></ol>
    {profile?.restriction_reason && <p className="social-notice"><strong>Perfil restringido:</strong> {profile.restriction_reason} Solo un administrador puede retirar esta restricción.</p>}
    <div hidden={reviewing}>
      <p>El nombre y la especie aparecerán en su perfil. Tú eliges los demás datos. Su teléfono, ubicación y carnet no se comparten en Pawgram.</p>
      <form action={prepare} className="social-form" aria-busy={pending}>
        <input type="hidden" name="petId" value={petId} />
        <label>Presentación opcional<textarea name="presentation" maxLength={300} value={presentation} onChange={e=>setPresentation(e.target.value)} rows={3} placeholder="Cuéntanos algo de su personalidad…" /><small>Hasta 300 caracteres.</small></label>
        <fieldset><legend>Qué quieres mostrar</legend>
          {(['breed','sex','size','age'] as const).map((field,index)=><label className="social-check" key={field}><input type="checkbox" name={field} checked={choices[field]} onChange={e=>setChoices({...choices,[field]:e.target.checked})} disabled={Boolean(available && !available[field])} /><span><strong>{['Raza','Sexo','Talla','Edad'][index]}</strong><small>{available ? available[field] || 'Sin registrar en su ficha' : 'Solo si está registrado'}{field === 'age' && available?.age ? ' · Nunca se muestra su fecha de nacimiento' : ''}</small></span></label>)}
        </fieldset>
        <label>Foto del perfil<select name="photo" value={photo} onChange={e=>setPhoto(e.target.value)}><option value="none">No publicar foto de perfil</option>{profile?.photo_id && <option value="keep">Conservar su foto social</option>}{hasRescuePhoto && <option value="rescue">Compartir una copia de su foto principal</option>}</select><small>{hasRescuePhoto ? 'La copia social no modifica su foto de rescate.' : 'Puedes agregar una foto principal desde su ficha. Después podrás autorizar una copia aquí.'}</small></label>
        <p><a href={`/mascotas/${petId}`}>Completar los datos de su ficha</a>. Los cambios no se publican hasta que los revises aquí.</p>
        <button className="button button--primary" disabled={pending}>{pending ? 'Preparando vista previa…' : 'Revisar vista previa'}</button><ActionMessage state={state} />
      </form>
      {profile?.published && <details className="social-visibility"><summary>Visibilidad del perfil</summary><p>Ocultarlo retira también sus publicaciones e imágenes del acceso público. Su contenido se conserva y el QR sigue funcionando.</p><SocialForm action={hideProfile} label="Ocultar perfil y sus fotos" secondary><input type="hidden" name="petId" value={petId} /></SocialForm></details>}
    </div>
    {reviewing && <ConfirmProfile key={state.token} prepared={state} onBack={()=>setDismissed(state.token)} onPublished={()=>{setDismissed(state.token);onPublished?.();}} />}
  </section>;
}
function ConfirmProfile({ prepared, onBack, onPublished }: { prepared: SocialState; onBack: () => void; onPublished?: () => void }) {
  const [state, submit, pending] = useActionState(async (previous: SocialState, form: FormData) => {
    const next = await publishProfile(previous,form);
    if(next.ok) onPublished?.();
    return next;
  }, initialSocialState);
  const preview = prepared.preview!;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className="social-review" aria-labelledby="preview-title"><h3 id="preview-title" ref={heading} tabIndex={-1}>Así se verá su perfil</h3>
    <div className="social-preview">
      {prepared.photoUrl ? <Image src={prepared.photoUrl} alt={`Foto de ${preview.name}`} width={640} height={480} unoptimized /> : <p className="social-photo-empty">Perfil sin fotografía</p>}
      <h4>{preview.name}</h4><p>{preview.species === 'gato' ? 'Gato' : 'Perro'}</p>{preview.presentation && <p className="social-text">{preview.presentation}</p>}
      <dl>{(['breed', 'sex', 'size', 'age'] as const).map((field, index) => preview[field] ? <div key={field}><dt>{['Raza', 'Sexo', 'Talla', 'Edad'][index]}</dt><dd>{preview[field]}</dd></div> : null)}</dl>
    </div>
    <p>{socialWarning}</p>
    {!state.ok && <form action={submit} className="social-form" aria-busy={pending}><input type="hidden" name="token" value={prepared.token} /><label className="social-check"><input type="checkbox" name="consent" required /><span>Autorizo publicar esta versión y su foto en Pawgram, independientemente del consentimiento del QR.</span></label><div className="social-actions"><button className="button button--primary" disabled={pending}>{pending ? 'Publicando…' : 'Publicar perfil'}</button><button type="button" className="button button--outline" disabled={pending} onClick={onBack}>Volver a editar</button></div></form>}
    <ActionMessage state={state} />
    {state.ok && <button className="button button--outline" onClick={onBack}>Volver al perfil</button>}
  </section>;
}
