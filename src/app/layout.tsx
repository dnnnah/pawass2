import { SiteFooter } from '@/features/brand/site-footer';
import { PwaRegistration } from '@/features/pwa/pwa-registration';
import { getSiteUrl } from '@/lib/supabase/env';
import type { Metadata } from 'next';
import type { Viewport } from 'next';
import '@fontsource-variable/nunito-sans';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'PawPass — su ficha de rescate',
  description: 'Una forma clara de identificar a tu mascota y ayudarte a volver a encontrarla.',
  appleWebApp: { capable: true, title: 'PawPass', statusBarStyle: 'default' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#176986' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX" data-scroll-behavior="smooth"><body>{children}<SiteFooter /><PwaRegistration /></body></html>;
}
