import type { Metadata } from 'next';
import { AppHeader } from '@/features/navigation/app-header';
import { HomeContent } from '@/features/home/home-content';
import styles from '@/features/home/home.module.css';
import { createClient } from '@/lib/supabase/server';
import { getIdentityFromClaims } from '@/lib/supabase/identity';
import { getSiteUrl } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: 'PawPass — ficha de rescate QR y carnet privado para tu mascota',
  description: 'Identifica a tu perro o gato con su ficha QR, comparte una alerta si se pierde y organiza sus cuidados en un carnet privado.',
  alternates: { canonical: `${getSiteUrl()}/` },
  robots: { index: true, follow: true },
};
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getClaims() : { data: null };
  const signedIn = Boolean(getIdentityFromClaims(data?.claims));
  return <><a className={styles.skip} href="#contenido">Saltar al contenido</a><AppHeader active="home" signedIn={signedIn} /><HomeContent signedIn={signedIn} /></>;
}
