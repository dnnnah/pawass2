'use client';

import { useActionState, useState, useTransition } from 'react';
import { uploadPrimaryPhoto } from './actions';
import { convertImageToWebp } from '@/lib/image';
import type { FormState } from '@/features/profile/actions';

const initialState: FormState = { ok: false, message: '' };

export function PetPhotoUploadForm({ petId, publicCode }: { petId: string; publicCode: string }) {
  const [state, dispatch, pendingAction] = useActionState(uploadPrimaryPhoto, initialState);
  const [pendingConversion, startTransition] = useTransition();
  const [error, setError] = useState('');
  const pending = pendingAction || pendingConversion;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const source = data.get('photo');
    if (!(source instanceof File) || !source.size) { setError('Elige una fotografía.'); return; }
    try {
      data.set('photo', await convertImageToWebp(source));
      startTransition(() => dispatch(data));
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos preparar la fotografía.');
    }
  }

  return (
    <form className="form-stack photo-upload-form" onSubmit={submit}>
      <input type="hidden" name="petId" value={petId} />
      <input type="hidden" name="publicCode" value={publicCode} />
      <label className="field"><span>Foto principal <em>opcional</em></span><input type="file" name="photo" accept="image/*" /></label>
      <p className="form-description">La foto se convierte a WebP, se reduce a 2000 px como máximo y se guarda en un bucket privado. La ficha pública recibe una URL temporal para mostrarla.</p>
      {(error || state.message) && <p className="form-message" role="status" aria-live="polite">{error || state.message}</p>}
      <button className="button button--outline" type="submit" disabled={pending}>{pending ? 'Preparando foto…' : 'Guardar foto'}</button>
    </form>
  );
}
