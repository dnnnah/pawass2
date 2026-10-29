import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppHeader } from '@/features/navigation/app-header';
import { HealthRecordManager, type HealthDocumentRow, type HealthRecordRow } from '@/features/health-record/health-record-manager';
import type { PetSpecies } from '@/features/health-record/domain';
import { createClient } from '@/lib/supabase/server';
import { getIdentityFromClaims } from '@/lib/supabase/identity';

export const metadata: Metadata = {
  title: 'Carnet de salud | PawPass',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function HealthRecordPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  if (!supabase) return <main className="setup-page"><h1>Conecta Supabase para continuar</h1><p>El carnet privado necesita una sesión segura con el proyecto de datos.</p></main>;
  const { data } = await supabase.auth.getClaims();
  const identity = getIdentityFromClaims(data?.claims);
  if (!identity) redirect('/');

  const { data: pet } = await supabase.from('pets').select('id,name,species')
    .eq('id', id).eq('owner_id', identity.id).maybeSingle();
  if (!pet) notFound();

  const [{ data: records }, { data: documents }] = await Promise.all([
    supabase.from('pet_health_records')
      .select('id,record_type,catalog_id,label,administered_on,next_dose_date,lot,veterinarian,notes')
      .eq('pet_id', pet.id).order('administered_on', { ascending: false }),
    supabase.from('pet_health_documents')
      .select('id,category,label,storage_path,original_filename,mime_type,size_bytes,document_date,notes')
      .eq('pet_id', pet.id).order('created_at', { ascending: false }),
  ]);

  return (
    <main className="account-shell">
      <AppHeader active="pets" />
      <div className="account-main health-record-main">
        <Link className="back-link" href={`/mascotas/${pet.id}`}>← Volver a la ficha de {pet.name}</Link>
        <header className="health-record-hero">
          <div><h1>Carnet de salud de {pet.name}</h1><p className="health-record-hero__species">{pet.species === 'perro' ? 'Perro' : 'Gato'} · Carnet privado</p><p>Guarda y consulta vacunas, desparasitaciones, intervenciones y documentos en un solo lugar.</p></div>
        </header>
        <HealthRecordManager
          petId={pet.id}
          species={pet.species as PetSpecies}
          records={(records || []) as HealthRecordRow[]}
          documents={(documents || []) as HealthDocumentRow[]}
        />
      </div>
    </main>
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
