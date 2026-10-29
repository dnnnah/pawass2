'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BrandMark } from '@/features/auth/brand-mark';
import { PasswordField } from '@/features/auth/password-field';

export default function ResetPasswordPage() {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    const password = String(new FormData(event.currentTarget).get('password') || '');
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) throw error;
      setMessage('Tu contraseña quedó actualizada. Ya puedes iniciar sesión.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible cambiar la contraseña.');
    } finally {
      setPending(false);
    }
  }

  return <main className="auth-layout auth-layout--centered"><div className="auth-layout__brand"><BrandMark /></div><section className="auth-panel"><h1>Crea una contraseña nueva</h1><p>Elige una contraseña de al menos 8 caracteres.</p><form className="form-stack" method="post" onSubmit={submit}><PasswordField name="password" label="Nueva contraseña" autoComplete="new-password" minLength={8} disabled={pending} /><button className="button button--primary button--wide" disabled={pending}>{pending ? 'Guardando…' : 'Actualizar contraseña'}</button></form>{message && <p role="status" aria-live="polite" className="form-message">{message}</p>}</section></main>;
}
