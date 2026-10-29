import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrandMark } from '@/features/auth/brand-mark';
import { WhatsAppActions } from '@/features/rescue/whatsapp-actions';
import { isPublicPetCode } from '@/lib/domain';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import { isRecoveryNoticeVisible } from '@/features/lost-pets/domain';
import { createPhotoUrl } from '@/lib/supabase/photo-url';
import Image from 'next/image';

type Props = { params: Promise<{ code: string }> };
type PublicCareAlert = { category: string; label: string; severity: 'critical' | 'precaution' | 'informative'; instructions: string };

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
  const [{ data, error }, { data: careAlerts }, { data: statuses }, { data: photoRecords }] = await Promise.all([
    supabase.rpc('get_public_rescue_card', { p_code: code }),
    supabase.rpc('get_public_care_alerts', { p_code: code }),
    supabase.rpc('get_public_pet_rescue_status', { p_code: code }),
    supabase.rpc('get_public_pet_photo', { p_code: code }),
  ]);
  const pet = data?.[0];
  const visibleCareAlerts = (careAlerts || []) as PublicCareAlert[];
  const status = statuses?.[0] as { lost: boolean; recovered_at: string | null } | undefined;
  const photoUrl = await createPhotoUrl('pet-photos', (photoRecords?.[0] as { photo_path?: string | null } | undefined)?.photo_path);
  const showHomeNotice = Boolean(status?.recovered_at && isRecoveryNoticeVisible(status.recovered_at, new Date().toISOString()));
  if (error || !pet?.rescue_phone || !pet.whatsapp_phone) notFound();

  return (
    <main className="rescue-page">
      <header className="rescue-header"><BrandMark /><span>Ficha de rescate</span></header>
      {status?.lost && <div className="rescue-state-banner rescue-state-banner--lost"><strong>Mascota perdida</strong><span>Su familia busca ayuda para encontrarla.</span><a href={`/perdidas/${code}`}>Ver alerta y ubicación</a></div>}
      {!status?.lost && showHomeNotice && <div className="rescue-state-banner rescue-state-banner--home"><strong>Ya está en casa</strong><span>Gracias por ayudar a reunir a {pet.pet_name} con su familia.</span></div>}
      <article className="rescue-card">
        <div className={`rescue-photo ${photoUrl ? 'rescue-photo--image' : 'rescue-photo--empty'}`}>{photoUrl ? <Image src={photoUrl} alt={`Foto de ${pet.pet_name}`} width={560} height={420} unoptimized /> : <PawIllustration />}</div>
        <div className="rescue-card__body">
          <p className="section-label">Alguien está buscando ayudarte</p>
          <h1>{pet.pet_name}</h1>
          <p className="species-label">{pet.species === 'perro' ? 'Perro' : 'Gato'} <span aria-hidden="true">·</span> Código {code}</p>
          <p className="rescue-instruction">{showHomeNotice && !status?.lost ? 'Esta mascota ya volvió a casa.' : 'Si me encontraste, comunícate con mi familia.'}</p>
          <div className="rescue-actions">
            <a className={`button ${status?.lost ? 'button--urgent-outline' : 'button--primary'} button--wide rescue-call`} href={`tel:${pet.rescue_phone}`}>Llamar a mi familia</a>
            <WhatsAppActions name={pet.pet_name} code={code} whatsapp={pet.whatsapp_phone} urgent={Boolean(status?.lost)} />
          </div>
          {visibleCareAlerts.length > 0 && (
            <section className="rescue-care" aria-labelledby="rescue-care-heading">
              <h2 id="rescue-care-heading">Alertas de cuidado</h2>
              <ul>
                {visibleCareAlerts.map((alert, index) => (
                  <li className={`rescue-care__item rescue-care__item--${alert.severity}`} key={`${alert.category}-${index}`}>
                    <div className="rescue-care__heading"><strong>{alert.label}</strong><span>{severityLabel(alert.severity)}</span></div>
                    {alert.instructions && <p>{alert.instructions}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="privacy-note">Esta ficha solo comparte los datos que el tutor autorizó para ayudar a su mascota a volver a casa.</p>
        </div>
      </article>
      <footer className="rescue-footer"><BrandMark /><span>Una forma sencilla de volver a casa.</span></footer>
    </main>
  );
}

function severityLabel(severity: string) {
  if (severity === 'critical') return 'Alerta crítica';
  if (severity === 'precaution') return 'Precaución';
  return 'Información';
}

function SetupNotice() {
  return <main className="setup-page"><BrandMark /><h1>Ficha temporalmente no disponible</h1><p>La aplicación necesita conexión con el proyecto de datos.</p></main>;
}

function PawIllustration() {
  return <svg viewBox="0 0 180 180"><ellipse cx="45" cy="48" rx="18" ry="25" transform="rotate(-24 45 48)"/><ellipse cx="91" cy="31" rx="18" ry="25"/><ellipse cx="137" cy="48" rx="18" ry="25" transform="rotate(24 137 48)"/><ellipse cx="158" cy="91" rx="15" ry="21" transform="rotate(45 158 91)"/><path d="M90 77c-26 0-61 41-50 64 9 19 34 2 50 2s41 17 50-2c11-23-24-64-50-64Z"/></svg>;
}
