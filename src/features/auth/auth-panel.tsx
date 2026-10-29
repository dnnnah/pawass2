'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Mode = 'entrar' | 'crear' | 'recuperar';

export function AuthPanel({ configured }: { configured: boolean }) {
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
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/cuenta` },
        });
        if (error) throw error;
        setMessage('Revisa tu correo para confirmar la cuenta y continuar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/cuenta');
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
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/cuenta` },
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
        <p className="section-label">Tu hogar para su cuidado</p>
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
          <GoogleMark />
          Continuar con Google
        </button>
      )}

      {mode !== 'recuperar' && <div className="divider"><span>o con correo</span></div>}

      <form className="form-stack" method="post" onSubmit={handleSubmit}>
        <label className="field">
          <span>Correo electrónico</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} disabled={!configured || pending} />
        </label>
        {mode !== 'recuperar' && (
          <label className="field">
            <span>Contraseña</span>
            <input name="password" type="password" autoComplete={mode === 'crear' ? 'new-password' : 'current-password'} required minLength={8} maxLength={72} disabled={!configured || pending} />
            {mode === 'crear' && <small>Usa al menos 8 caracteres.</small>}
          </label>
        )}
        <button className="button button--primary button--wide" type="submit" disabled={!configured || pending}>
          {pending ? 'Un momento…' : mode === 'crear' ? 'Crear cuenta' : mode === 'recuperar' ? 'Enviar enlace' : 'Iniciar sesión'}
        </button>
      </form>

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

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="google-mark"><path fill="#4285F4" d="M19.6 10.2c0-.6-.1-1.2-.2-1.8H10v3.4h5.4a4.7 4.7 0 0 1-2 3.1v2.2h3.2c1.9-1.8 3-4.3 3-7Z"/><path fill="#34A853" d="M10 20c2.7 0 4.9-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1a6 6 0 0 1-5.6-4H1.1v2.5A10 10 0 0 0 10 20Z"/><path fill="#FBBC05" d="M4.4 12a6 6 0 0 1 0-3.9V5.6H1.1a10 10 0 0 0 0 8.8L4.4 12Z"/><path fill="#EA4335" d="M10 4a5.4 5.4 0 0 1 3.8 1.5l2.8-2.8A9.3 9.3 0 0 0 10 0a10 10 0 0 0-8.9 5.6l3.3 2.5A6 6 0 0 1 10 4Z"/></svg>;
}
