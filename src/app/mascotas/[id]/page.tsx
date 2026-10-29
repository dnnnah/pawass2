import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PetContactEditor } from '@/features/pets/pet-contact-editor';
import { PetDetailsForm } from '@/features/pets/pet-details-form';
import { DeletePetForm } from '@/features/pets/delete-pet-form';
import { CareAlertManager, type CareAlertRecord } from '@/features/care-alerts/care-alert-manager';
import { AppHeader } from '@/features/navigation/app-header';
import { BrandMark } from '@/features/auth/brand-mark';
import { LostReportForm } from '@/features/lost-pets/lost-report-form';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';
import { createClient } from '@/lib/supabase/server';
import { createPhotoUrl } from '@/lib/supabase/photo-url';
import { PetPhotoUploadForm } from '@/features/pets/photo-upload-form';

export const metadata: Metadata = { title: 'Ficha de mascota | PawPass', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function PetPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: pet } = await supabase.from('pets')
    .select('id,name,species,breed,mixed_breed,sex,size,color,birth_date,approximate_age_years,approximate_age_months,weight_kg,microchip,ruac,sterilized,primary_photo_path,contact_override_enabled,rescue_phone_override,whatsapp_phone_override')
    .eq('id', id).eq('owner_id', user.id).maybeSingle();
  if (!pet) notFound();

  const [{ data: codeRecord }, { data: alerts }, { data: report }] = await Promise.all([
    supabase.from('public_code_reservations').select('code').eq('pet_id', pet.id).maybeSingle(),
    supabase.from('care_alerts').select('id,category,catalog_id,label,severity,instructions,qr_visible')
      .eq('pet_id', pet.id).order('created_at', { ascending: true }),
    supabase.from('lost_pet_reports').select('id,pet_id,status,lost_at,recovered_at,last_seen_location,last_seen_at,wearing,message,reward,recent_photo_path').eq('pet_id', pet.id).eq('status', 'active').maybeSingle(),
  ]);
  const code = codeRecord?.code || '';
  const photoUrl = await createPhotoUrl('pet-photos', pet.primary_photo_path);

  return (
    <main className="account-shell">
      <AppHeader active="pets" />
      <div className="account-main pet-detail-main">
        <Link className="back-link" href="/mascotas">← Volver a mis mascotas</Link>
        <section className="pet-detail-hero" aria-labelledby="pet-name">
          <div className="pet-detail-photo" role={photoUrl ? undefined : 'img'} aria-label={photoUrl ? undefined : 'Sin fotografía registrada'}>{photoUrl ? <Image src={photoUrl} width={400} height={300} alt={`Foto de ${pet.name}`} unoptimized /> : <><Image src="/paw-mark.svg" width={72} height={72} alt="" aria-hidden="true" /><span>Sin foto registrada</span></>}</div>
          <div className="pet-detail-identity">
            <p className={`pet-detail-state ${report ? 'pet-detail-state--lost' : ''}`}><span aria-hidden="true" />{report ? 'Perdida' : 'En casa'}</p>
            <h1 id="pet-name">{pet.name}</h1>
            <p>{pet.species === 'perro' ? 'Perro' : 'Gato'}{code && <> · Código <bdi>{code}</bdi></>}</p>
            {code && <a className="text-button" href={`/p/${code}`} target="_blank" rel="noreferrer">Abrir ficha QR</a>}
          </div>
          <LostReportForm petId={pet.id} report={report as LostReportRow | null} />
        </section>
        <details className="pet-details-editor" open>
          <summary><span><strong>Identidad y detalles</strong><small>Raza, edad, aspecto y datos privados de cuidado</small></span><span aria-hidden="true">Editar</span></summary>
          <PetDetailsForm petId={pet.id} species={pet.species} details={pet} continueLabel="Guardar detalles" />
        </details>
        <section className="pet-photo-editor" aria-labelledby="pet-photo-heading"><h2 id="pet-photo-heading">Fotografía</h2><PetPhotoUploadForm petId={pet.id} publicCode={code} /></section>
        <CareAlertManager petId={pet.id} alerts={(alerts || []) as CareAlertRecord[]} />
        <section className="pet-detail-contact" aria-labelledby="contact-heading">
          <div><h2 id="contact-heading">Contacto de rescate</h2><p>El QR usa estos contactos vigentes, salvo que esta mascota tenga una excepción propia.</p></div>
          <PetContactEditor petId={pet.id} enabled={pet.contact_override_enabled} phone={pet.rescue_phone_override} whatsapp={pet.whatsapp_phone_override} />
        </section>
        <DeletePetForm petId={pet.id} publicCode={code} />
      </div>
    </main>
  );
}

function SetupRequired() {
  return <main className="setup-page"><BrandMark /><h1>Conecta Supabase para continuar</h1><p>La ficha privada de la mascota necesita conexión con el proyecto de datos.</p></main>;
}
