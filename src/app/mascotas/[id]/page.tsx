import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PetContactEditor } from '@/features/pets/pet-contact-editor';
import { CareAlertManager, type CareAlertRecord } from '@/features/care-alerts/care-alert-manager';
import { AppHeader } from '@/features/navigation/app-header';
import { BrandMark } from '@/features/auth/brand-mark';
import { createClient } from '@/lib/supabase/server';

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
    .select('id,name,species,contact_override_enabled,rescue_phone_override,whatsapp_phone_override')
    .eq('id', id).eq('owner_id', user.id).maybeSingle();
  if (!pet) notFound();

  const [{ data: codeRecord }, { data: alerts }] = await Promise.all([
    supabase.from('public_code_reservations').select('code').eq('pet_id', pet.id).maybeSingle(),
    supabase.from('care_alerts').select('id,category,catalog_id,label,severity,instructions,qr_visible')
      .eq('pet_id', pet.id).order('created_at', { ascending: true }),
  ]);
  const code = codeRecord?.code || '';

  return (
    <main className="account-shell">
      <AppHeader active="pets" />
      <div className="account-main pet-detail-main">
        <Link className="back-link" href="/cuenta">← Volver a mis mascotas</Link>
        <section className="pet-detail-hero" aria-labelledby="pet-name">
          <div className="pet-detail-photo" role="img" aria-label="Sin fotografía registrada"><Image src="/paw-mark.svg" width={72} height={72} alt="" aria-hidden="true" /><span>Sin foto registrada</span></div>
          <div className="pet-detail-identity">
            <p className="pet-detail-state"><span aria-hidden="true" />En casa</p>
            <h1 id="pet-name">{pet.name}</h1>
            <p>{pet.species === 'perro' ? 'Perro' : 'Gato'}{code && <> · Código <bdi>{code}</bdi></>}</p>
            {code && <a className="text-button" href={`/p/${code}`} target="_blank" rel="noreferrer">Abrir ficha QR</a>}
          </div>
          <button className="button button--danger pet-detail-report" type="button" disabled>Reportar perdida · Próximamente</button>
        </section>
        <CareAlertManager petId={pet.id} alerts={(alerts || []) as CareAlertRecord[]} />
        <section className="pet-detail-contact" aria-labelledby="contact-heading">
          <div><h2 id="contact-heading">Contacto de rescate</h2><p>El QR usa estos contactos vigentes, salvo que esta mascota tenga una excepción propia.</p></div>
          <PetContactEditor petId={pet.id} enabled={pet.contact_override_enabled} phone={pet.rescue_phone_override} whatsapp={pet.whatsapp_phone_override} />
        </section>
      </div>
    </main>
  );
}

function SetupRequired() {
  return <main className="setup-page"><BrandMark /><h1>Conecta Supabase para continuar</h1><p>La ficha privada de la mascota necesita conexión con el proyecto de datos.</p></main>;
}
