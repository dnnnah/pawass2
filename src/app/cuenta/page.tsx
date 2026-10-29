import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BrandMark } from '@/features/auth/brand-mark';
import { signOut } from '@/features/auth/actions';
import { ProfileForm } from '@/features/profile/profile-form';
import { QuickPetForm } from '@/features/pets/quick-pet-form';
import { PetCard } from '@/features/pets/pet-card';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Mi cuenta | PawPass', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const [{ data: profile }, { data: pets }] = await Promise.all([
    supabase.from('profiles').select('first_name,surname1,surname2,rescue_phone,whatsapp_phone').eq('id', user.id).maybeSingle(),
    supabase.from('pets').select('id,name,species,contact_override_enabled,rescue_phone_override,whatsapp_phone_override,created_at').eq('owner_id', user.id).order('created_at', { ascending: false }),
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
      <header className="app-header"><BrandMark /><nav aria-label="Navegación principal"><a className="nav-link nav-link--active" href="#mascotas" aria-current="page">Mis mascotas</a><a className="nav-link" href="#cuenta">Cuenta</a></nav><form action={signOut}><button className="text-button" type="submit">Cerrar sesión</button></form></header>
      <div className="account-main">
        <div className="welcome"><div><p className="section-label">Tu cuenta PawPass</p><h1>Hola{profileData.first_name ? `, ${profileData.first_name}` : ''}.</h1><p>Gestiona los datos de contacto que ayudan a que tus mascotas vuelvan a casa.</p></div><div className="welcome__seal" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 3 4 8v8c0 7 4.8 11.6 12 14 7.2-2.4 12-7 12-14V8L16 3Z"/><path d="m11 16 3.2 3.2L21 12"/></svg></div></div>

        <section className="section-panel" id="cuenta" aria-labelledby="profile-heading"><h2 className="sr-only" id="profile-heading">Perfil de cuenta</h2><ProfileForm profile={profileData} email={user.email || ''} /></section>

        <section className="pets-section" id="mascotas" aria-labelledby="pets-heading">
          <div className="section-title"><div><p className="section-label">Su ficha siempre disponible</p><h2 id="pets-heading">Mis mascotas</h2></div><span className="section-count">{(pets || []).length} registradas</span></div>
          {profileComplete ? (
            <>
              {(pets || []).length > 0 && <div className="pet-list">{(pets || []).map((pet) => {
                const code = codeByPet.get(pet.id);
                return code ? <PetCard key={pet.id} pet={pet} code={code} /> : null;
              })}</div>}
              <div className="add-pet-panel"><div className="add-pet-panel__heading"><div className="add-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14"/></svg></div><div><h3>{(pets || []).length ? 'Agregar mascota' : 'Registra a tu primera mascota'}</h3><p>Solo necesitas su nombre y especie. La ficha QR queda activa al guardar.</p></div></div><QuickPetForm phone={profileData.rescue_phone!} whatsapp={profileData.whatsapp_phone!} /></div>
            </>
          ) : (
            <div className="profile-needed"><strong>Completa tus contactos para crear su ficha QR.</strong><p>Guarda nombre, teléfono y WhatsApp. Los códigos se mantienen reservados aunque más adelante elimines una mascota.</p><a href="#cuenta">Ir a contacto de rescate</a></div>
          )}
        </section>
        <footer className="account-footer">Tus fichas QR muestran solo la información que aceptaste publicar. El expediente privado llegará en una fase posterior.</footer>
      </div>
    </main>
  );
}

function SetupRequired() {
  return <main className="setup-page"><BrandMark /><h1>Conecta Supabase para continuar</h1><p>Copia <code>.env.example</code> como <code>.env.local</code>, agrega la URL y la clave pública de tu proyecto y aplica la migración de la fase 1.</p></main>;
}
