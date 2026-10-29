import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BrandMark } from '@/features/auth/brand-mark';
import { AppHeader } from '@/features/navigation/app-header';
import { ProfileForm } from '@/features/profile/profile-form';
import { QuickPetForm } from '@/features/pets/quick-pet-form';
import { PetCard } from '@/features/pets/pet-card';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Mis mascotas | PawPass', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const [{ data: profile }, { data: pets }] = await Promise.all([
    supabase.from('profiles').select('first_name,surname1,surname2,rescue_phone,whatsapp_phone').eq('id', user.id).maybeSingle(),
    supabase.from('pets').select('id,name,species,created_at').eq('owner_id', user.id).order('created_at', { ascending: false }),
  ]);
  const petIds = (pets || []).map((pet) => pet.id);
  const { data: codes } = petIds.length
    ? await supabase.from('public_code_reservations').select('pet_id,code').in('pet_id', petIds)
    : { data: [] as { pet_id: string; code: string }[] };

  const profileData = profile || { first_name: null, surname1: null, surname2: null, rescue_phone: null, whatsapp_phone: null };
  const profileComplete = Boolean(profileData.first_name && profileData.rescue_phone && profileData.whatsapp_phone);
  const codeByPet = new Map((codes || []).map((item) => [item.pet_id, item.code]));

  return (
    <main className="account-shell">
      <AppHeader active="pets" />
      <div className="account-main">
        <div className="welcome"><h1>Mis mascotas</h1><p>Sus fichas y cuidados, en un lugar.</p></div>
        <section className="pets-section" id="mascotas" aria-labelledby="pets-heading">
          <h2 className="sr-only" id="pets-heading">Tus mascotas</h2>
          {!profileComplete && <div className="profile-needed"><strong>Completa tus contactos para crear una ficha QR.</strong><p>Guarda tu nombre, teléfono y WhatsApp para que puedan contactarte si encuentran a tu mascota.</p><a href="#cuenta">Ir a Cuenta</a></div>}
          {(pets || []).length > 0 && <div className="pet-list">{(pets || []).map((pet) => {
            const code = codeByPet.get(pet.id);
            return code ? <PetCard key={pet.id} pet={pet} code={code} /> : null;
          })}</div>}
          {profileComplete ? (
            <div className="add-pet-panel"><div className="add-pet-panel__heading"><div className="add-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14"/></svg></div><div><h2>{(pets || []).length ? 'Agregar mascota' : 'Registra a tu primera mascota'}</h2><p>Solo necesitas su nombre y especie. La ficha QR queda activa al guardar.</p></div></div><QuickPetForm phone={profileData.rescue_phone!} whatsapp={profileData.whatsapp_phone!} /></div>
          ) : (pets || []).length === 0 ? <p className="empty-pets">Cuando completes tus datos de contacto, podrás crear la primera ficha.</p> : null}
        </section>
        <section className="section-panel account-profile" id="cuenta" aria-labelledby="profile-heading"><h2 className="sr-only" id="profile-heading">Perfil de cuenta</h2><ProfileForm profile={profileData} email={user.email || ''} /></section>
        <footer className="account-footer">Las alertas de cuidado se editan desde la ficha de cada mascota. Solo se muestran en el QR cuando las autorizas.</footer>
      </div>
    </main>
  );
}

function SetupRequired() {
  return <main className="setup-page"><BrandMark /><h1>Conecta Supabase para continuar</h1><p>Copia <code>.env.example</code> como <code>.env.local</code>, agrega la URL y la clave pública de tu proyecto y aplica la migración.</p></main>;
}
