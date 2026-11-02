import { PageFrame, PageContent, PageHeading } from '@/components/ui/page-layout';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/features/navigation/app-header';
import { ProfileForm } from '@/features/profile/profile-form';
import { DeleteAccountForm } from '@/features/profile/delete-account-form';
import { createClient } from '@/lib/supabase/server';
import { getIdentityFromClaims } from '@/lib/supabase/identity';

export const metadata: Metadata = { title: 'Mi cuenta | PawPass', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) redirect('/');
  const { data } = await supabase.auth.getClaims();
  const identity = getIdentityFromClaims(data?.claims);
  if (!identity) redirect('/');
  const { data: profile } = await supabase.from('profiles').select('first_name,surname1,surname2,rescue_phone,whatsapp_phone').eq('id', identity.id).maybeSingle();
  const profileData = profile || { first_name: null, surname1: null, surname2: null, rescue_phone: null, whatsapp_phone: null };
  return (
    <PageFrame className="account-shell">
      <AppHeader active="account" />
      <PageContent className="account-settings">
        <PageHeading eyebrow="Configuración privada" title="Mi cuenta" description="Administra tu identidad y los contactos que reciben las alertas de rescate." />
        <section className="section-panel account-contact-panel" aria-labelledby="contact-heading">
          <ProfileForm profile={profileData} email={identity.email || ''} />
        </section>
        <section className="account-privacy-note" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading">Tu privacidad</h2>
          <p>Tu nombre y apellidos permanecen privados. En las fichas públicas solo aparecen los contactos de rescate y los datos que autorizas.</p>
        </section>
        <DeleteAccountForm />
      </PageContent>
    </PageFrame>
  );
}
