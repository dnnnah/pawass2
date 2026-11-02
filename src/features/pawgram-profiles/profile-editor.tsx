'use client';
import { useActionState } from 'react';
import Image from 'next/image';
import { prepareProfile, publishProfile, hideProfile, type SocialState } from './actions';
import { socialWarning, type Snapshot } from './domain';
import { SocialForm, ActionMessage, initialSocialState } from './action-form';
export type OwnedProfile = Snapshot & { pet_id: string; photo_id: string | null; published: boolean; restriction_reason: string | null; updated_at: string };
export function ProfileEditor({ petId, hasRescuePhoto, profile }: { petId: string; hasRescuePhoto: boolean; profile: OwnedProfile | null }) {
  const [state, prepare, pending] = useActionState(prepareProfile, initialSocialState);
  return <section className="social-section" aria-labelledby="social-profile-title">
    <h2 id="social-profile-title">Su perfil en Pawgram</h2>
    <p>{profile ? profile.published ? 'Elegiste publicar el perfil.' : 'Mantienes el perfil oculto.' : 'Esta mascota todavía no tiene un perfil social.'} El QR funciona de forma independiente.</p>
    {profile?.restriction_reason && <p className="social-notice"><strong>Restricción administrativa:</strong> {profile.restriction_reason} Puedes gestionar o eliminar tus publicaciones. Solo un administrador puede retirar esta restricción.</p>}
    {profile?.published && <SocialForm action={hideProfile} label="Ocultar perfil y sus fotos" secondary><input type="hidden" name="petId" value={petId} /></SocialForm>}
    <p>La ficha privada no actualiza este perfil automáticamente. Elige los datos que quieres compartir y revisa una nueva versión.</p>
    <form action={prepare} className="social-form" aria-busy={pending}>
      <input type="hidden" name="petId" value={petId} />
      <label>Presentación opcional<textarea name="presentation" maxLength={300} defaultValue={profile?.presentation || ''} rows={3} /><small>Hasta 300 caracteres. Déjala vacía para no publicarla.</small></label>
      <fieldset><legend>Datos opcionales de la ficha privada</legend>
        <label className="social-check"><input type="checkbox" name="breed" defaultChecked={Boolean(profile?.breed)} />Publicar raza</label>
        <label className="social-check"><input type="checkbox" name="sex" defaultChecked={Boolean(profile?.sex)} />Publicar sexo</label>
        <label className="social-check"><input type="checkbox" name="size" defaultChecked={Boolean(profile?.size)} />Publicar talla</label>
        <label className="social-check"><input type="checkbox" name="age" defaultChecked={profile?.age_months !== null && Boolean(profile)} />Publicar edad, sin fecha de nacimiento</label>
      </fieldset>
      <label>Foto del perfil<select name="photo" defaultValue={profile?.photo_id ? 'keep' : 'none'}><option value="none">Sin foto</option>{profile?.photo_id && <option value="keep">Conservar foto social autorizada</option>}{hasRescuePhoto && <option value="rescue">Autorizar una copia de la foto principal</option>}</select></label>
      <p>Nombre y especie siempre aparecen. Teléfonos, ubicación, cuidados, identificación y carnet permanecen fuera de Pawgram.</p>
      <button className="button button--outline" disabled={pending}>{pending ? 'Preparando…' : 'Revisar vista previa'}</button><ActionMessage state={state} />
    </form>
    {state.preview && state.token && <ConfirmProfile key={state.token} prepared={state} />}
  </section>;
}
function ConfirmProfile({ prepared }: { prepared: SocialState }) {
  const [state, submit, pending] = useActionState(publishProfile, initialSocialState);
  const preview = prepared.preview!;
  return <section className="social-preview" aria-labelledby="preview-title"><h3 id="preview-title">Vista previa pública</h3>
    {prepared.photoUrl && <Image src={prepared.photoUrl} alt={`Foto de ${preview.name}`} width={640} height={480} unoptimized />}
    <h4>{preview.name}</h4><p>{preview.species}</p>{preview.presentation && <p>{preview.presentation}</p>}
    <dl>{(['breed', 'sex', 'size', 'age'] as const).map((field, index) => preview[field] ? <div key={field}><dt>{['Raza', 'Sexo', 'Talla', 'Edad'][index]}</dt><dd>{preview[field]}</dd></div> : null)}</dl>
    <p>{socialWarning}</p>
    {!state.ok && <form action={submit} className="social-form" aria-busy={pending}><input type="hidden" name="token" value={prepared.token} /><label className="social-check"><input type="checkbox" name="consent" required />Autorizo publicar esta versión y su foto en Pawgram, independientemente del consentimiento del QR.</label><button className="button button--primary" disabled={pending}>{pending ? 'Publicando…' : 'Confirmar y publicar perfil'}</button></form>}
    <ActionMessage state={state} />
  </section>;
}
