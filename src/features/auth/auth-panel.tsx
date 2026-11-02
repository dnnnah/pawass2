'use client';

import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';

import Image from 'next/image';
import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validateRegistrationPassword, getRegistrationPasswordChecks, REGISTRATION_PASSWORD_MIN_LENGTH, REGISTRATION_PASSWORD_MAX_LENGTH } from './domain';
import { PasswordField } from './password-field';
import { signInAsDevTestAccount } from './actions';

type Mode = 'entrar' | 'crear' | 'recuperar';

export function AuthPanel({ configured, showDevTestAccount = false }: { configured: boolean; showDevTestAccount?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('entrar');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const requirementsId = useId();
  const matchId = useId();
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmationFocused, setConfirmationFocused] = useState(false);
  const passwordChecks = getRegistrationPasswordChecks(registrationPassword);
  const passwordValid = passwordChecks.every(check => check.met) && registrationPassword.length <= REGISTRATION_PASSWORD_MAX_LENGTH;
  const passwordsMatch = Boolean(registrationPassword && confirmation && registrationPassword === confirmation);
  function changeMode(next: Mode) {
    setMode(next); setMessage(''); setRegistrationPassword(''); setConfirmation('');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const confirmation = String(form.get('passwordConfirmation') || '');

    if (mode === 'crear') {
      const match = validateRegistrationPassword(password, confirmation);
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
        <Button variant="outline" className="google-button" disabled={!configured || pending} onClick={handleGoogle}>
          <Image src="/google-g.svg" width={20} height={20} alt="" aria-hidden="true" />Continuar con Google
        </Button>
      )}

      {mode !== 'recuperar' && <div className="divider"><span>o con correo</span></div>}

      <form className="form-stack" method="post" onSubmit={handleSubmit}>
        <label className="field">
          <span>Correo electrónico</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} disabled={!configured || pending} />
        </label>
        {mode !== 'recuperar' && <>
          <PasswordField key={`password-${mode}`} name="password" label="Contraseña" autoComplete={mode === 'crear' ? 'new-password' : 'current-password'} minLength={mode === 'crear' ? REGISTRATION_PASSWORD_MIN_LENGTH : undefined} maxLength={REGISTRATION_PASSWORD_MAX_LENGTH} disabled={!configured || pending} onChange={setRegistrationPassword} onFocusChange={setPasswordFocused} describedBy={mode === 'crear' ? requirementsId : undefined} />
          {mode === 'crear' && <>
            <div hidden={!passwordFocused} id={requirementsId} className="password-requirements" role="status" aria-live="polite"><p>Tu contraseña debe incluir:</p><ul>{passwordChecks.map(check => <li key={check.id} className={`password-feedback ${check.met ? 'password-feedback--met' : ''}`}><PasswordRuleIcon state={check.met ? 'met' : 'pending'} /><span>{check.label}<span className="sr-only">: {check.met ? 'cumplido' : 'pendiente'}.</span></span></li>)}</ul>{passwordValid && <p className="password-feedback password-feedback--met"><PasswordRuleIcon state="met" /><span>La contraseña cumple los requisitos.</span></p>}</div>
            <PasswordField name="passwordConfirmation" label="Confirma tu contraseña" autoComplete="new-password" minLength={REGISTRATION_PASSWORD_MIN_LENGTH} maxLength={REGISTRATION_PASSWORD_MAX_LENGTH} disabled={!configured || pending} onChange={setConfirmation} onFocusChange={setConfirmationFocused} describedBy={matchId} invalid={Boolean(confirmation) && !passwordsMatch} />
            <p hidden={!confirmationFocused} id={matchId} className={`password-feedback ${passwordsMatch ? 'password-feedback--met' : confirmation ? 'password-feedback--error' : ''}`} role="status" aria-live="polite"><PasswordRuleIcon state={passwordsMatch ? 'met' : confirmation ? 'error' : 'pending'} /><span>{!confirmation ? 'Repite la misma contraseña.' : passwordsMatch ? 'Las contraseñas coinciden.' : 'Las contraseñas aún no coinciden.'}</span></p>
          </>}
        </>}
        <Button fullWidth type="submit" disabled={!configured || pending || (mode === 'crear' && (!passwordValid || !passwordsMatch))}>
          {pending ? 'Un momento…' : mode === 'crear' ? 'Crear cuenta' : mode === 'recuperar' ? 'Enviar enlace' : 'Iniciar sesión'}
        </Button>
      </form>

      {showDevTestAccount && mode === 'entrar' && (
        <form action={signInAsDevTestAccount} className="dev-test-access">
          <Button variant="text" type="submit">Entrar a la cuenta de prueba</Button>
          <small>Solo disponible en Supabase local durante desarrollo.</small>
        </form>
      )}

      <FormMessage>{message}</FormMessage>

      <div className="auth-panel__links">
        {mode === 'entrar' && <button type="button" className="text-button" onClick={() => { changeMode('recuperar'); }}>¿Olvidaste tu contraseña?</button>}
        {mode === 'recuperar' && <button type="button" className="text-button" onClick={() => { changeMode('entrar'); }}>Volver a iniciar sesión</button>}
        {mode !== 'recuperar' && (
          <p>{mode === 'crear' ? '¿Ya tienes cuenta?' : '¿Primera vez en PawPass?'}{' '}
            <button type="button" className="text-button" onClick={() => { changeMode(mode === 'crear' ? 'entrar' : 'crear'); }}>
              {mode === 'crear' ? 'Inicia sesión' : 'Crea una cuenta'}
            </button>
          </p>
        )}
      </div>
    </section>
  );
}


function PasswordRuleIcon({ state }: { state: 'met' | 'error' | 'pending' }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" />{state === 'met' ? <path d="m7 12 3 3 7-7" /> : state === 'error' ? <path d="m8 8 8 8m0-8-8 8" /> : <path d="M8 12h8" />}</svg>;
}
