'use client';

import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';

import { useActionState, useState, useTransition } from 'react';
import { discardPrimaryPhotoUpload, preparePrimaryPhotoUpload, uploadPrimaryPhoto } from './actions';
import { convertImageToWebp } from '@/lib/image';
import { createClient } from '@/lib/supabase/client';
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
    let stagedPath = '';
    try {
      const photo = await convertImageToWebp(source);
      const prepared = await preparePrimaryPhotoUpload(petId);
      if (!prepared.ok) throw new Error(prepared.message);
      stagedPath = prepared.path;
      const { error: uploadError } = await createClient().storage.from('pet-photos').uploadToSignedUrl(prepared.path, prepared.token, photo, { contentType: 'image/webp', upsert: false });
      if (uploadError) throw uploadError;
      data.delete('photo');
      data.set('stagedPhotoPath', prepared.path);
      startTransition(() => dispatch(data));
      form.reset();
    } catch (cause) {
      if (stagedPath) await discardPrimaryPhotoUpload(petId, stagedPath);
      setError(cause instanceof Error ? cause.message : 'No pudimos preparar la fotografía.');
    }
  }

  return (
    <form className="form-stack photo-upload-form" onSubmit={submit}>
      <input type="hidden" name="petId" value={petId} />
      <input type="hidden" name="publicCode" value={publicCode} />
      <label className="field"><span>Foto principal <em>opcional</em></span><input type="file" name="photo" accept="image/*" /></label>
      <p className="form-description">Elige una foto clara donde se vea su cara. Aparecerá en su ficha de rescate para ayudar a reconocerla.</p>
      <FormMessage>{error || state.message}</FormMessage>
      <Button type="submit" disabled={pending}>{pending ? 'Preparando foto…' : 'Guardar foto'}</Button>
    </form>
  );
}
