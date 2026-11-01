import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppHeader } from '@/features/navigation/app-header';
import { LostReportForm, RecoverPetForm } from '@/features/lost-pets/lost-report-form';
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
    supabase.from('pets').select('id,name,species').eq('id', id).eq('owner_id', identity.id).maybeSingle(),
    supabase.from('lost_pet_reports').select('id,pet_id,status,lost_at,recovered_at,last_seen_location,last_seen_at,wearing,message,reward,recent_photo_path').eq('pet_id', id).eq('status', 'active').maybeSingle(),
  ]);
  if (!pet) notFound();
  const activeReport = report as LostReportRow | null;

  return (
    <main className="account-shell">
      <AppHeader active="pets" />
      <div className="account-main lost-report-page">
        <Link className="back-link" href={`/mascotas/${pet.id}`}>← Volver a la ficha de {pet.name}</Link>
        <header className={`lost-report-page__state ${activeReport ? 'lost-report-page__state--lost' : 'lost-report-page__state--home'}`}>
          <span className="lost-report-page__state-dot" aria-hidden="true" />
          <div><p className="eyebrow">Estado actual</p><h1>{activeReport ? `${pet.name} está reportada como perdida` : `${pet.name} está en casa`}</h1><p>{activeReport ? 'La alerta está publicada y aparece en el tablón público. Cuando vuelva, confirma su regreso aquí.' : 'La alerta pública solo se activa cuando tú decides reportar que se perdió.'}</p></div>
        </header>
        {activeReport && <section className="lost-report-page__recovery" aria-labelledby="recovery-heading"><div><span className="eyebrow">¿Ya se reunió con su familia?</span><h2 id="recovery-heading">Confirma que ya está en casa</h2><p>Esto cerrará la alerta pública, retirará la foto reciente y mostrará el aviso de regreso en su QR durante 30 días.</p></div><RecoverPetForm report={activeReport} /></section>}
        <section className="lost-report-page__form" aria-labelledby="lost-form-heading"><header><span className="eyebrow">{activeReport ? 'Alerta pública activa' : 'Ayúdale a volver a casa'}</span><h2 id="lost-form-heading">{activeReport ? 'Editar datos del reporte' : 'Reportar que se perdió'}</h2><p>{activeReport ? 'Actualiza la última ubicación, el momento aproximado y los detalles visibles para quien pueda encontrarla.' : 'La publicación es pública. Revisa el aviso de privacidad y confirma antes de compartir los datos.'}</p></header><LostReportForm petId={pet.id} report={activeReport} /></section>
      </div>
    </main>
  );
}
