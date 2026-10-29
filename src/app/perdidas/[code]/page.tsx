import { PetNote } from '@/features/brand/pet-note';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrandMark } from '@/features/auth/brand-mark';
import { WhatsAppActions } from '@/features/rescue/whatsapp-actions';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/supabase/env';
import { isPublicPetCode } from '@/lib/domain';
import { createPhotoUrl } from '@/lib/supabase/photo-url';
import Image from 'next/image';

type Props = { params: Promise<{ code: string }> };
type CareAlert = { category: string; label: string; severity: 'critical' | 'precaution' | 'informative'; instructions: string };
type LostPet = {
  public_code: string;
  pet_name: string;
  species: 'perro' | 'gato';
  photo_path: string | null;
  rescue_phone: string;
  whatsapp_phone: string;
  lost_at: string;
  last_seen_location: string | null;
  last_seen_at: string | null;
  wearing: string | null;
  message: string | null;
  reward: string | null;
  care_alerts: CareAlert[];
};

async function getLostPet(code: string): Promise<LostPet | null> {
  const supabase = await createClient();
  if (!supabase || !isPublicPetCode(code)) return null;
  const { data, error } = await supabase.rpc('get_public_lost_pet', { p_code: code });
  if (error) return null;
  return (data?.[0] as LostPet | undefined) || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const pet = await getLostPet(code);
  if (!pet) return { title: 'Alerta de mascota | PawPass', robots: { index: false, follow: false, noarchive: true } };
  const location = pet.last_seen_location || 'Ubicación pendiente';
  return {
    title: `${pet.pet_name} está perdida | PawPass`,
    description: `${pet.species === 'perro' ? 'Perro' : 'Gato'} perdido: ${pet.pet_name}. Última ubicación: ${location}. Ayuda a contactar a su familia.`,
    alternates: { canonical: `${getSiteUrl()}/perdidas/${encodeURIComponent(code)}` },
    robots: { index: true, follow: true },
  };
}

export const dynamic = 'force-dynamic';

export default async function LostPetPage({ params }: Props) {
  const { code } = await params;
  const pet = await getLostPet(code);
  if (!pet) notFound();
  const photoUrl = await createPhotoUrl('lost-pet-photos', pet.photo_path);
  return (
    <main className="lost-detail-page">
      <header className="rescue-header"><BrandMark /><span>Alerta activa</span></header>
      <div className="lost-detail-wrap">
        <div className="lost-detail-banner"><span className="lost-status"><span aria-hidden="true" />Mascota perdida</span><span>Comparte esta ficha para ayudar a encontrarla.</span></div>
        <article className="lost-detail-card">
          <div className="lost-detail-photo">{photoUrl ? <Image src={photoUrl} alt={`Foto reciente de ${pet.pet_name}`} width={720} height={480} unoptimized /> : <PawIcon />}</div>
          <div className="lost-detail-body">
            <h1>{pet.pet_name}</h1>
            <p className="lost-detail-meta">{pet.species === 'perro' ? 'Perro' : 'Gato'} · Código {pet.public_code}</p>
            <section className="lost-detail-location"><h2>Última ubicación vista</h2><p>{pet.last_seen_location || 'Ubicación pendiente'}</p>{pet.last_seen_at && <time dateTime={pet.last_seen_at}>{new Date(pet.last_seen_at).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}</time>}</section>
            {pet.wearing && <section className="lost-detail-section"><h2>Señas o ropa</h2><p>{pet.wearing}</p></section>}
            {pet.message && <section className="lost-detail-section"><h2>Mensaje de su familia</h2><p>{pet.message}</p></section>}
            {pet.reward && <section className="lost-detail-section"><h2>Recompensa informativa</h2><p>{pet.reward}</p></section>}
            {pet.care_alerts?.length > 0 && <section className="lost-detail-care"><h2>Alertas de cuidado autorizadas</h2><ul>{pet.care_alerts.map((alert, index) => <li key={`${alert.category}-${index}`}><strong>{alert.label}</strong><span>{alert.severity === 'critical' ? 'Alerta crítica' : alert.severity === 'precaution' ? 'Precaución' : 'Información'}</span>{alert.instructions && <p>{alert.instructions}</p>}</li>)}</ul></section>}
            <div className="lost-detail-contact"><h2>Contacta a su familia</h2><WhatsAppActions name={pet.pet_name} code={pet.public_code} whatsapp={pet.whatsapp_phone} callPhone={pet.rescue_phone} urgent /></div>
            <p className="privacy-note">Esta página solo contiene información elegida por su tutor para ayudar durante la búsqueda.</p>
          </div>
        </article>
      </div>
      <div className="rescue-footer"><PetNote name={pet.pet_name} rescue /><a className="button button--outline" href={`/p/${pet.public_code}`}>Abrir ficha QR</a></div>
    </main>
  );
}

function PawIcon() {
  return <svg viewBox="0 0 100 100"><ellipse cx="22" cy="24" rx="8" ry="12" transform="rotate(-22 22 24)"/><ellipse cx="42" cy="16" rx="8" ry="12"/><ellipse cx="63" cy="20" rx="8" ry="12" transform="rotate(18 63 20)"/><ellipse cx="79" cy="36" rx="7" ry="10" transform="rotate(32 79 36)"/><path d="M49 39c-14 0-34 22-28 36 4 10 18 2 28 2s24 8 28-2c6-14-14-36-28-36Z"/></svg>;
}
