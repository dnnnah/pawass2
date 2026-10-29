'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validatePasswordConfirmation } from './domain';
import { PasswordField } from './password-field';
import { signInAsDevTestAccount } from './actions';

type Mode = 'entrar' | 'crear' | 'recuperar';

export function AuthPanel({ configured, showDevTestAccount = false }: { configured: boolean; showDevTestAccount?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('entrar');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const confirmation = String(form.get('passwordConfirmation') || '');

    if (mode === 'crear') {
      const match = validatePasswordConfirmation(password, confirmation);
      if (!match.ok) {
        setMessage(match.error);
        setPending(false);
        return;
      }
    }

    try {
      const supabase = createClient();
      if (mode === 'recuperar') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setMessage('Si existe una cuenta con ese correo, enviaremos un enlace para cambiar la contraseña.');
      } else if (mode === 'crear') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/mascotas` },
        });
        if (error) throw error;
        setMessage('Revisa tu correo para confirmar la cuenta y continuar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/mascotas');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible completar la solicitud. Intenta de nuevo.');
    } finally {
      setPending(false);
    }
  }

  async function handleGoogle() {
    setMessage('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/mascotas` },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible iniciar con Google.');
    }
  }

  const heading = mode === 'crear' ? 'Crea tu cuenta' : mode === 'recuperar' ? 'Recupera tu acceso' : 'Bienvenido de vuelta';

  return (
    <section className="auth-panel" aria-labelledby="auth-heading">
      <div className="auth-panel__intro">
        <h1 id="auth-heading">{heading}</h1>
        <p>Registra a tus mascotas y deja a la mano una forma segura de contactarte.</p>
      </div>

      {!configured && (
        <div className="notice" role="status">
          <strong>Falta conectar Supabase</strong>
          <span>Copia <code>.env.example</code> como <code>.env.local</code> y agrega la URL y la clave pública de tu proyecto.</span>
        </div>
      )}

      {mode !== 'recuperar' && (
        <button className="button button--outline google-button" type="button" disabled={!configured || pending} onClick={handleGoogle}>
          <Image src="/google-g.svg" width={20} height={20} alt="" aria-hidden="true" />Continuar con Google
        </button>
      )}

      {mode !== 'recuperar' && <div className="divider"><span>o con correo</span></div>}

      <form className="form-stack" method="post" onSubmit={handleSubmit}>
        <label className="field">
          <span>Correo electrónico</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} disabled={!configured || pending} />
        </label>
        {mode !== 'recuperar' && <>
          <PasswordField name="password" label="Contraseña" autoComplete={mode === 'crear' ? 'new-password' : 'current-password'} minLength={mode === 'crear' ? 8 : undefined} disabled={!configured || pending} />
          {mode === 'crear' && <PasswordField name="passwordConfirmation" label="Confirma tu contraseña" autoComplete="new-password" minLength={8} disabled={!configured || pending} />}
        </>}
        <button className="button button--primary button--wide" type="submit" disabled={!configured || pending}>
          {pending ? 'Un momento…' : mode === 'crear' ? 'Crear cuenta' : mode === 'recuperar' ? 'Enviar enlace' : 'Iniciar sesión'}
        </button>
      </form>

      {showDevTestAccount && mode === 'entrar' && (
        <form action={signInAsDevTestAccount} className="dev-test-access">
          <button className="button button--text" type="submit">Entrar a la cuenta de prueba</button>
          <small>Solo disponible en Supabase local durante desarrollo.</small>
        </form>
      )}

      {message && <p className="form-message" role="status" aria-live="polite">{message}</p>}

      <div className="auth-panel__links">
        {mode === 'entrar' && <button type="button" className="text-button" onClick={() => { setMode('recuperar'); setMessage(''); }}>¿Olvidaste tu contraseña?</button>}
        {mode === 'recuperar' && <button type="button" className="text-button" onClick={() => { setMode('entrar'); setMessage(''); }}>Volver a iniciar sesión</button>}
        {mode !== 'recuperar' && (
          <p>{mode === 'crear' ? '¿Ya tienes cuenta?' : '¿Primera vez en PawPass?'}{' '}
            <button type="button" className="text-button" onClick={() => { setMode(mode === 'crear' ? 'entrar' : 'crear'); setMessage(''); }}>
              {mode === 'crear' ? 'Inicia sesión' : 'Crea una cuenta'}
            </button>
          </p>
        )}
      </div>
    </section>
  );
}

