import { PetStatusBadge } from '@/features/pets/pet-status';
import { PageFrame, PageContent, PageHeading } from '@/components/ui/page-layout';
import { RescueQrTools } from '@/features/pets/rescue-qr-tools';
import { getRescueQrUrl } from '@/features/lost-pets/poster-domain';
import { getPublicPetViewHref } from '@/features/pets/pet-card-domain';
import { getSiteUrl } from '@/lib/supabase/env';
import { LostPosterDisclosure } from '@/features/lost-pets/lost-poster-disclosure';
import { LostPosterPanel } from '@/features/lost-pets/lost-poster-panel';
import { createPhotoUrl } from '@/lib/supabase/photo-url';
import type { CareAlertRecord } from '@/features/care-alerts/care-alert-manager';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppHeader } from '@/features/navigation/app-header';
import { LostReportForm } from '@/features/lost-pets/lost-report-form';
import { RecoverPetForm } from '@/features/lost-pets/recovery-forms';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';
import { createClient } from '@/lib/supabase/server';
import { getIdentityFromClaims } from '@/lib/supabase/identity';

export const metadata: Metadata = { title: 'Estado de pérdida | PawPass', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function LostReportPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return <main className="setup-page"><h1>Conecta Supabase para continuar</h1><p>El reporte de pérdida necesita una sesión segura con el proyecto de datos.</p></main>;
  const { data } = await supabase.auth.getClaims();
  const identity = getIdentityFromClaims(data?.claims);
  if (!identity) redirect('/');
  const [{ data: pet }, { data: report }] = await Promise.all([
    supabase.from('pets').select('id,name,species,primary_photo_path,contact_override_enabled,rescue_phone_override,whatsapp_phone_override').eq('id', id).eq('owner_id', identity.id).maybeSingle(),
    supabase.from('lost_pet_reports').select('id,pet_id,status,lost_at,recovered_at,last_seen_location,last_seen_at,wearing,message,reward,recent_photo_path').eq('pet_id', id).eq('status', 'active').maybeSingle(),
  ]);
  if (!pet) notFound();
  const activeReport = report as LostReportRow | null;
  const [{ data: code }, { data: alerts }, { data: profile }] = await Promise.all([
    supabase.from('public_code_reservations').select('code').eq('pet_id', id).maybeSingle(),
    supabase.from('care_alerts').select('id,category,catalog_id,label,severity,instructions,qr_visible').eq('pet_id', id),
    supabase.from('profiles').select('rescue_phone,whatsapp_phone').eq('id', identity.id).maybeSingle(),
  ]);
  const photoUrl = activeReport?.recent_photo_path
    ? await createPhotoUrl('lost-pet-photos', activeReport.recent_photo_path, supabase)
    : await createPhotoUrl('pet-photos', pet.primary_photo_path, supabase);
  const phone = pet.contact_override_enabled ? pet.rescue_phone_override : profile?.rescue_phone;
  const whatsapp = pet.contact_override_enabled ? pet.whatsapp_phone_override : profile?.whatsapp_phone;

  return (
    <PageFrame className="account-shell">
      <AppHeader active="pets" />
      <PageContent className="lost-report-page">
        <Link className="back-link" href={`/mascotas/${pet.id}`}>← Volver a la ficha de {pet.name}</Link>
        <PageHeading className={`lost-report-page__state ${activeReport ? 'lost-report-page__state--lost' : 'lost-report-page__state--home'}`} eyebrow="Estado actual" title={activeReport ? `${pet.name} está reportada como perdida` : `${pet.name} está en casa`} description={activeReport ? 'La alerta está publicada y aparece en el tablón público. Cuando vuelva, confirma su regreso aquí.' : 'La alerta pública solo se activa cuando tú decides reportar que se perdió.'} aside={<PetStatusBadge status={activeReport ? 'lost' : 'home'} />} />
        {code?.code && <Link className="button button--outline lost-page-view-link" href={getPublicPetViewHref(code.code, Boolean(activeReport))}>Ver ficha pública</Link>}
        <section className="lost-report-page__form" aria-labelledby="lost-form-heading"><header><span className="eyebrow">{activeReport ? 'Alerta pública activa' : 'Ayúdale a volver a casa'}</span><h2 id="lost-form-heading">{activeReport ? 'Editar datos del reporte' : 'Reportar que se perdió'}</h2><p>{activeReport ? 'Actualiza la última ubicación, el momento aproximado y los detalles visibles para quien pueda encontrarla.' : 'La publicación es pública. Revisa el aviso de privacidad y confirma antes de compartir los datos.'}</p></header><LostReportForm petId={pet.id} report={activeReport} /></section>
        {activeReport && <LostPosterDisclosure><LostPosterPanel pet={pet} code={code?.code || ''} photoUrl={photoUrl} phone={phone || null} whatsapp={whatsapp || null} report={activeReport} alerts={(alerts || []) as CareAlertRecord[]} /></LostPosterDisclosure>}
        {activeReport && <section className="lost-report-page__recovery" id="confirmar-regreso" aria-labelledby="recovery-heading"><div><span className="eyebrow">¿Ya se reunió con su familia?</span><h2 id="recovery-heading">Confirma que ya está en casa</h2><p>Esto cerrará la alerta pública, retirará la foto reciente y mostrará el aviso de regreso en su QR durante 30 días.</p></div><RecoverPetForm report={activeReport} /></section>}
        {code?.code && <RescueQrTools url={getRescueQrUrl(code.code, getSiteUrl())} code={code.code} name={pet.name} />}

      </PageContent>
    </PageFrame>
  );
}
