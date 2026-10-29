import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/features/navigation/app-header';
import { ProfileForm } from '@/features/profile/profile-form';
import { DeleteAccountForm } from '@/features/profile/delete-account-form';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Mi cuenta | PawPass', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) redirect('/');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');
  const { data: profile } = await supabase.from('profiles').select('first_name,surname1,surname2,rescue_phone,whatsapp_phone').eq('id', user.id).maybeSingle();
  const profileData = profile || { first_name: null, surname1: null, surname2: null, rescue_phone: null, whatsapp_phone: null };
  return (
    <main className="account-shell">
      <AppHeader active="account" />
      <div className="account-main account-settings">
        <div className="account-page-heading"><p className="section-label">Configuración privada</p><h1>Mi cuenta</h1><p>Administra tu identidad y los contactos que reciben las alertas de rescate.</p></div>
        <section className="section-panel account-contact-panel" aria-labelledby="contact-heading">
          <ProfileForm profile={profileData} email={user.email || ''} />
        </section>
        <section className="account-privacy-note" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading">Tu privacidad</h2>
          <p>Tu nombre y apellidos permanecen privados. En las fichas públicas solo aparecen los contactos de rescate y los datos que autorizas.</p>
        </section>
        <DeleteAccountForm />
      </div>
    </main>
  );
}
