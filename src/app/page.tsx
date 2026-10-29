import { redirect } from 'next/navigation';
import { AuthPanel } from '@/features/auth/auth-panel';
import { BrandMark } from '@/features/auth/brand-mark';
import { hasSupabaseEnvironment, isLocalTestLoginEnabled } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect('/mascotas');
  }

  return (
    <main className="auth-layout">
      <div className="auth-layout__brand"><BrandMark /></div>
      <div className="auth-layout__content">
        <div className="auth-story" aria-hidden="true">
          <div className="story-orbit story-orbit--outer" />
          <div className="story-orbit story-orbit--inner" />
          <svg className="story-paw" viewBox="0 0 180 180"><ellipse cx="45" cy="48" rx="18" ry="25" transform="rotate(-24 45 48)"/><ellipse cx="91" cy="31" rx="18" ry="25"/><ellipse cx="137" cy="48" rx="18" ry="25" transform="rotate(24 137 48)"/><ellipse cx="158" cy="91" rx="15" ry="21" transform="rotate(45 158 91)"/><path d="M90 77c-26 0-61 41-50 64 9 19 34 2 50 2s41 17 50-2c11-23-24-64-50-64Z"/></svg>
          <div className="story-note"><span className="story-note__dot"/><span>Una ficha lista cuando importa.</span></div>
          <p>Su nombre.<br/>Una forma de volver a casa.</p>
        </div>
        <AuthPanel configured={hasSupabaseEnvironment()} showDevTestAccount={isLocalTestLoginEnabled()} />
      </div>
      <footer className="auth-footer">PawPass · Cuidado que acompaña</footer>
    </main>
  );
}
