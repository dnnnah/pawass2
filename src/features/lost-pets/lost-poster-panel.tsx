import './lost-poster-panel.css';
import { LostPetPoster } from './lost-pet-poster';
import { getRescueQrUrl, isPosterReady } from './poster-domain';
import { getSiteUrl } from '@/lib/supabase/env';
import type { LostReportRow } from './lost-report-state';
import type { CareAlertRecord } from '@/features/care-alerts/care-alert-manager';

export function LostPosterPanel({ pet, code, photoUrl, phone, whatsapp, report, alerts }: {
  pet: { name: string; species: 'perro' | 'gato' }; code: string; photoUrl: string | null;
  phone: string | null; whatsapp: string | null; report: LostReportRow; alerts: CareAlertRecord[];
}) {
  if (!code || !phone || !isPosterReady({ active: report.status === 'active', photoUrl, lastSeenLocation: report.last_seen_location })) {
    return <section className="poster-unavailable" id="cartel-se-busca"><h2>Cartel de búsqueda</h2><p>Para generar el PNG, completa la foto, la última zona vista y el teléfono de rescate.</p></section>;
  }
  return <div id="cartel-se-busca"><LostPetPoster pet={{ name: pet.name, species: pet.species, code, photoUrl: photoUrl!, phone, whatsappPhone: whatsapp || phone, qrUrl: getRescueQrUrl(code, getSiteUrl()), lastSeenLocation: report.last_seen_location!, lastSeenAt: report.last_seen_at, wearing: report.wearing, message: report.message, reward: report.reward, alerts: alerts.filter(a => a.qr_visible).map(({ category, label, severity, instructions }) => ({ category, label, severity, instructions })) }} /></div>;
}
