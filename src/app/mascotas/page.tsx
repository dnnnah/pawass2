import { PetNote, PetTrail } from '@/features/brand/pet-note';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BrandMark } from '@/features/auth/brand-mark';
import { AppHeader } from '@/features/navigation/app-header';
import { PetCreateControl } from '@/features/pets/quick-pet-form';
import { PetCard } from '@/features/pets/pet-card';
import type { LostReportRow } from '@/features/lost-pets/lost-report-state';
import { createClient } from '@/lib/supabase/server';
import { createPhotoUrl } from '@/lib/supabase/photo-url';

export const metadata: Metadata = { title: 'Mis mascotas | PawPass', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PetsPage() {
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const [{ data: profile }, { data: pets }] = await Promise.all([
    supabase.from('profiles').select('first_name,rescue_phone,whatsapp_phone').eq('id', user.id).maybeSingle(),
    supabase.from('pets').select('id,name,species,created_at,primary_photo_path').eq('owner_id', user.id).order('created_at', { ascending: false }),
  ]);
  const petIds = (pets || []).map((pet) => pet.id);
  const [{ data: codes }, { data: reports }] = await Promise.all([
    petIds.length ? supabase.from('public_code_reservations').select('pet_id,code').in('pet_id', petIds) : Promise.resolve({ data: [] as { pet_id: string; code: string }[] }),
    petIds.length ? supabase.from('lost_pet_reports').select('id,pet_id,status,lost_at,recovered_at,last_seen_location,last_seen_at,wearing,message,reward,recent_photo_path').in('pet_id', petIds).eq('status', 'active') : Promise.resolve({ data: [] as LostReportRow[] }),
  ]);

  const profileComplete = Boolean(profile?.first_name && profile?.rescue_phone && profile?.whatsapp_phone);
  const codeByPet = new Map((codes || []).map((item) => [item.pet_id, item.code]));
  const reportByPet = new Map((reports || []).map((report) => [report.pet_id, report as LostReportRow]));
  const photoUrlByPet = new Map(await Promise.all((pets || []).map(async (pet) => [pet.id, await createPhotoUrl('pet-photos', pet.primary_photo_path)] as const)));
  return (
    <main className="account-shell">
      <AppHeader active="pets" />
      <div className="account-main pets-dashboard">
        <header className="welcome"><div><h1 id="pets-heading">Mis mascotas</h1><p>{profile?.first_name && <>Hola, <strong>{profile.first_name}</strong>. </>}Sus fichas, contactos y cuidados, siempre a la mano.</p></div><span className="section-count">{(pets || []).length} {(pets || []).length === 1 ? 'mascota' : 'mascotas'}</span></header>
        <PetTrail />
        <section className="pets-section" aria-labelledby="pets-heading">
          {!profileComplete && <div className="profile-needed"><strong>Completa tus contactos para activar una ficha QR.</strong><p>Guarda tu nombre y teléfono de rescate antes de registrar una mascota.</p><a href="/cuenta">Ir a Mi cuenta</a></div>}
          {(pets || []).length > 0 && <div className="pet-list">{(pets || []).map((pet) => {
            const code = codeByPet.get(pet.id);
            return code ? <PetCard key={pet.id} pet={pet} code={code} report={reportByPet.get(pet.id)} photoUrl={photoUrlByPet.get(pet.id)} /> : null;
          })}</div>}
          {profileComplete ? <PetCreateControl phone={profile!.rescue_phone!} whatsapp={profile!.whatsapp_phone!} hasPets={Boolean((pets || []).length)} /> : (pets || []).length === 0 ? <p className="empty-pets">Cuando completes tus contactos, podrás crear una ficha de rescate.</p> : null}
        </section>
        <PetNote /><p className="account-footer">Las alertas de cuidado se editan desde la ficha privada de cada mascota. Solo aparecen en el QR cuando las autorizas.</p>
      </div>
    </main>
  );
}

function SetupRequired() {
  return <main className="setup-page"><BrandMark /><h1>Conecta Supabase para continuar</h1><p>Copia <code>.env.example</code> como <code>.env.local</code>, agrega la URL y la clave pública y aplica las migraciones.</p></main>;
}
