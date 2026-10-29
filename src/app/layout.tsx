import { SiteFooter } from '@/features/brand/site-footer';
import type { Metadata } from 'next';
import '@fontsource-variable/nunito-sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'PawPass — su ficha de rescate',
  description: 'Una forma clara de identificar a tu mascota y ayudarte a volver a encontrarla.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX"><body>{children}<SiteFooter /></body></html>;
}
