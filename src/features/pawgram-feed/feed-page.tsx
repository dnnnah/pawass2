import Link from 'next/link';
import { AppHeader } from '@/features/navigation/app-header';
import { PageFrame, PageContent, PageHeading } from '@/components/ui/page-layout';
import { Feed } from '@/features/pawgram-feed/feed';
import { readFeed } from '@/features/pawgram-feed/queries';
export default async function PawgramPage({ searchParams }: { searchParams: Promise<{ antes?: string }> }) {
  const { antes } = await searchParams; const result = await readFeed({ before: antes });
  return <PageFrame><AppHeader active="pawgram" signedIn={result.signedIn} /><PageContent className="social-main"><PageHeading title="Pawgram" description="Pequeños momentos, grandes compañeros. Fotos compartidas por sus tutores, de la más reciente a la más antigua." /><p><Link className="button button--primary" href="/pawgram/mis-mascotas">Mis mascotas en Pawgram</Link></p>{antes && <p><Link href="/pawgram">Volver a las fotos más recientes</Link></p>}{result.unavailable ? <p role="status">Pawgram no está disponible en este momento. Inténtalo de nuevo más tarde.</p> : <Feed {...result} base="/pawgram" />}</PageContent></PageFrame>;
}
