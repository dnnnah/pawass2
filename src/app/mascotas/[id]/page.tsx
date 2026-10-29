import { PetEditor } from '@/features/pets/pet-editor';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { type CareAlertRecord } from '@/features/care-alerts/care-alert-manager';
import { BrandMark } from '@/features/auth/brand-mark';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';
import { createClient } from '@/lib/supabase/server';
import { createPhotoUrl } from '@/lib/supabase/photo-url';
import { getIdentityFromClaims } from '@/lib/supabase/identity';

export const metadata: Metadata = { title: 'Ficha de mascota | PawPass', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function PetPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;
  const { data } = await supabase.auth.getClaims();
  const identity = getIdentityFromClaims(data?.claims);
  if (!identity) redirect('/');

  const { data: pet } = await supabase.from('pets')
    .select('id,name,species,breed,mixed_breed,sex,size,color,birth_date,approximate_age_years,approximate_age_months,weight_kg,microchip,ruac,sterilized,primary_photo_path,contact_override_enabled,rescue_phone_override,whatsapp_phone_override')
    .eq('id', id).eq('owner_id', identity.id).maybeSingle();
  if (!pet) notFound();

  const [{ data: codeRecord }, { data: alerts }, { data: report }] = await Promise.all([
    supabase.from('public_code_reservations').select('code').eq('pet_id', pet.id).maybeSingle(),
    supabase.from('care_alerts').select('id,category,catalog_id,label,severity,instructions,qr_visible')
      .eq('pet_id', pet.id).order('created_at', { ascending: true }),
    supabase.from('lost_pet_reports').select('id,pet_id,status,lost_at,recovered_at,last_seen_location,last_seen_at,wearing,message,reward,recent_photo_path').eq('pet_id', pet.id).eq('status', 'active').maybeSingle(),
  ]);
  const code = codeRecord?.code || '';
  const photoUrl = await createPhotoUrl('pet-photos', pet.primary_photo_path);

  return <PetEditor pet={pet} code={code} photoUrl={photoUrl} report={report as LostReportRow | null} alerts={(alerts || []) as CareAlertRecord[]} />;
}

function SetupRequired() {
  return <main className="setup-page"><BrandMark /><h1>Conecta Supabase para continuar</h1><p>La ficha privada de la mascota necesita conexión con el proyecto de datos.</p></main>;
}
