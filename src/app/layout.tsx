import { SiteFooter } from '@/features/brand/site-footer';
import { PwaRegistration } from '@/features/pwa/pwa-registration';
import type { Metadata } from 'next';
import type { Viewport } from 'next';
import '@fontsource-variable/nunito-sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'PawPass — su ficha de rescate',
  description: 'Una forma clara de identificar a tu mascota y ayudarte a volver a encontrarla.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#1b5d82' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX"><body>{children}<SiteFooter /><PwaRegistration /></body></html>;
}
