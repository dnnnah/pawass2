'use client';
import { useActionState, useEffect, useRef, type ReactNode } from 'react';
import type { SocialState } from './actions';
export const initialSocialState: SocialState = { ok: false, message: '' };
export function ActionMessage({ state }: { state: SocialState }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (state.message) ref.current?.focus(); }, [state]);
  return <p ref={ref} tabIndex={-1} role="status" className="social-message">{state.message}</p>;
}
export function SocialForm({ action, children, label, secondary = false }: { action: (state: SocialState, form: FormData) => Promise<SocialState>; children: ReactNode; label: string; secondary?: boolean }) {
  const [state, submit, pending] = useActionState(action, initialSocialState);
  return <form action={submit} className="social-form" aria-busy={pending}>{children}<button className={`button button--${secondary ? 'outline' : 'primary'}`} disabled={pending}>{pending ? 'Guardando…' : label}</button><ActionMessage state={state} /></form>;
}
