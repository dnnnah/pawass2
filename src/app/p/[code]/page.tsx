import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrandMark } from '@/features/auth/brand-mark';
import { WhatsAppActions } from '@/features/rescue/whatsapp-actions';
import { isPublicPetCode } from '@/lib/domain';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';

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
  const { data, error } = await supabase.rpc('get_public_rescue_card', { p_code: code });
  const pet = data?.[0];
  if (error || !pet?.rescue_phone || !pet.whatsapp_phone) notFound();

  return (
    <main className="rescue-page">
      <header className="rescue-header"><BrandMark /><span>Ficha de rescate</span></header>
      <article className="rescue-card">
        <div className="rescue-photo rescue-photo--empty" aria-hidden="true"><PawIllustration /></div>
        <div className="rescue-card__body">
          <p className="section-label">Alguien está buscando ayudarte</p>
          <h1>{pet.pet_name}</h1>
          <p className="species-label">{pet.species === 'perro' ? 'Perro' : 'Gato'} <span aria-hidden="true">·</span> Código {code}</p>
          <p className="rescue-instruction">Si me encontraste, comunícate con mi familia.</p>
          <div className="rescue-actions">
            <a className="button button--primary button--wide rescue-call" href={`tel:${pet.rescue_phone}`}>Llamar a mi familia</a>
            <WhatsAppActions name={pet.pet_name} code={code} whatsapp={pet.whatsapp_phone} />
          </div>
          <p className="privacy-note">Esta ficha solo comparte los datos que el tutor autorizó para ayudar a su mascota a volver a casa.</p>
        </div>
      </article>
      <footer className="rescue-footer"><BrandMark /><span>Una forma sencilla de volver a casa.</span></footer>
    </main>
  );
}

function SetupNotice() {
  return <main className="setup-page"><BrandMark /><h1>Ficha temporalmente no disponible</h1><p>La aplicación necesita conexión con el proyecto de datos.</p></main>;
}

function PawIllustration() {
  return <svg viewBox="0 0 180 180"><ellipse cx="45" cy="48" rx="18" ry="25" transform="rotate(-24 45 48)"/><ellipse cx="91" cy="31" rx="18" ry="25"/><ellipse cx="137" cy="48" rx="18" ry="25" transform="rotate(24 137 48)"/><ellipse cx="158" cy="91" rx="15" ry="21" transform="rotate(45 158 91)"/><path d="M90 77c-26 0-61 41-50 64 9 19 34 2 50 2s41 17 50-2c11-23-24-64-50-64Z"/></svg>;
}
