import '@/features/rescue/rescue-pages.css';
import { PageFrame, PawPlaceholder } from '@/components/ui/page-layout';
import { CareSeverityBadge } from '@/features/brand/status-badge';
import { PetNote } from '@/features/brand/pet-note';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrandMark } from '@/features/auth/brand-mark';
import { WhatsAppActions } from '@/features/rescue/whatsapp-actions';
import { isPublicPetCode } from '@/lib/domain';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import { isRecoveryNoticeVisible } from '@/features/lost-pets/domain';
import { createPhotoUrl } from '@/lib/supabase/photo-url';
import { getPublicRescueData } from '@/features/rescue/public-queries';
import Image from 'next/image';
import Link from 'next/link';

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: 'Ficha QR de rescate | PawPass',
    description: 'Ficha pública de rescate de PawPass.',
    alternates: { canonical: `${getSiteUrl()}/p/${encodeURIComponent(code)}` },
    robots: { index: false, follow: false, noarchive: true },
  };
}

export const dynamic = 'force-dynamic';

export default async function RescuePage({ params }: Props) {
  const { code } = await params;
  if (!isPublicPetCode(code)) notFound();
  const supabase = await createClient();
  if (!supabase) return <SetupNotice />;
  const result = await getPublicRescueData(supabase, code);
  if (result.status === 'unavailable') throw new Error('No se pudo cargar la ficha de rescate.');
  if (result.status === 'missing') notFound();
  const { pet, careAlerts: visibleCareAlerts, rescueStatus: status } = result;
  const photoUrl = await createPhotoUrl('pet-photos', result.photoPath);
  const showHomeNotice = Boolean(status?.recovered_at && isRecoveryNoticeVisible(status.recovered_at, new Date().toISOString()));

  return (
    <PageFrame className="rescue-page">
      <header className="rescue-header"><BrandMark /><span>Ficha de rescate</span></header>
      {status?.lost && <div className="rescue-state-banner rescue-state-banner--lost"><strong>Mascota perdida</strong><span>Su familia busca ayuda para encontrarla.</span><Link href={`/perdidas/${code}`}>Ver alerta y ubicación</Link></div>}
      {!status?.lost && showHomeNotice && <div className="rescue-state-banner rescue-state-banner--home"><strong>Ya está en casa</strong><span>Gracias por ayudar a reunir a {pet.pet_name} con su familia.</span></div>}
      <article className="rescue-card">
        <div className={`rescue-photo ${photoUrl ? 'rescue-photo--image' : 'rescue-photo--empty'}`}>{photoUrl ? <Image src={photoUrl} alt={`Foto de ${pet.pet_name}`} width={560} height={420} unoptimized /> : <PawPlaceholder />}</div>
        <div className="rescue-card__body">
          <h1>{pet.pet_name}</h1>
          <p className="species-label">{pet.species === 'perro' ? 'Perro' : 'Gato'} <span aria-hidden="true">·</span> Código {code}</p>
          <p className="rescue-instruction">{showHomeNotice && !status?.lost ? 'Esta mascota ya volvió a casa.' : 'Si me encontraste, comunícate con mi familia.'}</p>
          <div className="rescue-actions">
            <WhatsAppActions name={pet.pet_name} code={code} whatsapp={pet.whatsapp_phone} callPhone={pet.rescue_phone} urgent={Boolean(status?.lost)} />
          </div>
          {visibleCareAlerts.length > 0 && (
            <section className="rescue-care" aria-labelledby="rescue-care-heading">
              <h2 id="rescue-care-heading">Alertas de cuidado</h2>
              <ul>
                {visibleCareAlerts.map((alert, index) => (
                  <li className={`rescue-care__item rescue-care__item--${alert.severity}`} key={`${alert.category}-${index}`}>
                    <div className="rescue-care__heading"><strong>{alert.label}</strong><CareSeverityBadge severity={alert.severity} /></div>
                    {alert.instructions && <p>{alert.instructions}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="privacy-note">Esta ficha solo comparte los datos que el tutor autorizó para ayudar a su mascota a volver a casa.</p>
        </div>
      </article>
      <PetNote name={pet.pet_name} rescue={!showHomeNotice || Boolean(status?.lost)} recovered={showHomeNotice && !status?.lost} />
    </PageFrame>
  );
}

function SetupNotice() {
  return <main className="setup-page"><BrandMark /><h1>Ficha temporalmente no disponible</h1><p>La aplicación necesita conexión con el proyecto de datos.</p></main>;
}
