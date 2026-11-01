import { CareSeverityBadge } from '@/features/brand/status-badge';
import { QuickRecovery } from './lost-report-form';
import type { OwnedReport } from './owned-reports';
import Image from 'next/image';
import Link from 'next/link';
import { AppHeader } from '@/features/navigation/app-header';
import { WhatsAppActions } from '@/features/rescue/whatsapp-actions';
import './public-lost-pet.css';

export type PublicLostPetDetailData = {
  public_code: string;
  pet_name: string;
  species: 'perro' | 'gato';
  lost_at: string;
  last_seen_location: string | null;
  last_seen_at: string | null;
  wearing: string | null;
  message: string | null;
  reward: string | null;
  care_alerts: { category: string; label: string; severity: 'critical' | 'precaution' | 'informative'; instructions: string }[];
  rescue_phone: string;
  whatsapp_phone: string;
};

export function PublicLostPetDetail({ pet, photoUrl, signedIn, ownedReport }: { pet: PublicLostPetDetailData; photoUrl: string | null; signedIn: boolean; ownedReport?: OwnedReport }) {
  return (
    <main className="lost-detail-page">
      <AppHeader active="lost" signedIn={signedIn} />
      <div className="lost-detail-wrap">
        <div className="lost-detail-banner">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2L12 3Z"/><path d="M12 9v5m0 3h.01"/></svg>
          <div><strong>Alerta de búsqueda activa</strong><p>Comparte esta ficha para ayudar a {pet.pet_name} a volver a casa.</p></div>
        </div>
        <article className="lost-detail-card">
          <div className="lost-detail-photo">{photoUrl ? <Image src={photoUrl} alt={`Foto reciente de ${pet.pet_name}`} width={900} height={900} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} unoptimized /> : <PawIcon />}</div>
          <div className="lost-detail-body">
            <h1>{pet.pet_name}</h1>
            {ownedReport && <div className="lost-card-owner"><span>Esta es tu mascota</span><Link href={`/mascotas/${ownedReport.petId}/perdida`}>Editar alerta y cartel</Link><QuickRecovery reportId={ownedReport.reportId} /></div>}
            <p className="lost-detail-meta">{pet.species === 'perro' ? 'Perro' : 'Gato'} · Código {pet.public_code}</p>
            <section className="lost-detail-location"><h2>Última ubicación vista</h2><p>{pet.last_seen_location || 'Ubicación pendiente'}</p>{pet.last_seen_at && <time dateTime={pet.last_seen_at}>{new Date(pet.last_seen_at).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}</time>}</section>
            <div className="lost-detail-contact"><h2>Contacta a su familia</h2><WhatsAppActions name={pet.pet_name} code={pet.public_code} whatsapp={pet.whatsapp_phone} callPhone={pet.rescue_phone} urgent /></div>
            {pet.wearing && <section className="lost-detail-section"><h2>Señas o ropa</h2><p>{pet.wearing}</p></section>}
            {pet.message && <section className="lost-detail-section"><h2>Mensaje de su familia</h2><p>{pet.message}</p></section>}
            {pet.reward && <section className="lost-detail-section"><h2>Recompensa informativa</h2><p>{pet.reward}</p></section>}
            {pet.care_alerts?.length > 0 && <section className="lost-detail-care"><h2>Alertas de cuidado autorizadas</h2><ul>{pet.care_alerts.map((alert, index) => <li key={`${alert.category}-${index}`}><strong>{alert.label}</strong><CareSeverityBadge severity={alert.severity} />{alert.instructions && <p>{alert.instructions}</p>}</li>)}</ul></section>}
            <Link className="button button--outline lost-detail-qr-link" href={`/p/${pet.public_code}`}>Abrir ficha QR de {pet.pet_name}</Link>
            <p className="privacy-note">Esta página solo contiene información elegida por su tutor para ayudar durante la búsqueda.</p>
          </div>
        </article>
      </div>
    </main>
  );
}

function PawIcon() {
  return <svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="22" cy="24" rx="8" ry="12" transform="rotate(-22 22 24)"/><ellipse cx="42" cy="16" rx="8" ry="12"/><ellipse cx="63" cy="20" rx="8" ry="12" transform="rotate(18 63 20)"/><ellipse cx="79" cy="36" rx="7" ry="10" transform="rotate(32 79 36)"/><path d="M49 39c-14 0-34 22-28 36 4 10 18 2 28 2s24 8 28-2c6-14-14-36-28-36Z"/></svg>;
}
