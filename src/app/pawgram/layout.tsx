import type { Metadata } from 'next';
import '@/features/pawgram-feed/pawgram.css';
export const metadata: Metadata = { title: 'Pawgram | PawPass', description: 'Fotos y momentos de las mascotas que sus tutores deciden compartir.', robots: { index: false, follow: false, noarchive: true }, openGraph: { title: 'Pawgram | PawPass', description: 'Momentos compartidos con autorización de sus tutores.', images: [] } };
export default function PawgramLayout({ children }: { children: React.ReactNode }) { return children; }
