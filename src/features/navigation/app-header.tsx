'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrandMark } from '@/features/auth/brand-mark';
import { signOut } from '@/features/auth/actions';

type ActiveDestination = 'pets' | 'account';

export function AppHeader({ active }: { active: ActiveDestination }) {
  const [current, setCurrent] = useState(active);
  useEffect(() => {
    const updateCurrent = () => setCurrent(window.location.hash === '#cuenta' ? 'account' : active);
    updateCurrent();
    window.addEventListener('hashchange', updateCurrent);
    return () => window.removeEventListener('hashchange', updateCurrent);
  }, [active]);

  return (
    <header className="app-header">
      <BrandMark />
      <nav aria-label="Navegación principal">
        <Link className={`nav-link ${current === 'pets' ? 'nav-link--active' : ''}`} href="/cuenta" aria-current={current === 'pets' ? 'page' : undefined}><NavIcon name="pets" /><span>Mis mascotas</span></Link>
        <span className="nav-link nav-link--pending" aria-label="Mascotas perdidas, disponible en una fase posterior"><NavIcon name="lost" /><span>Mascotas perdidas</span><span className="nav-pending-label">Próximamente</span></span>
        <Link className={`nav-link ${current === 'account' ? 'nav-link--active' : ''}`} href="/cuenta#cuenta" aria-current={current === 'account' ? 'page' : undefined}><NavIcon name="account" /><span>Cuenta</span></Link>
      </nav>
      <form action={signOut}><button className="text-button" type="submit">Cerrar sesión</button></form>
    </header>
  );
}

function NavIcon({ name }: { name: 'pets' | 'lost' | 'account' }) {
  if (name === 'pets') return <svg className="nav-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 13c-2.8 0-5.8 3.2-5.8 5.4 0 1.8 1.5 2.6 3.2 1.8.9-.4 1.7-.6 2.6-.6s1.7.2 2.6.6c1.7.8 3.2 0 3.2-1.8 0-2.2-3-5.4-5.8-5.4Z"/><ellipse cx="5.2" cy="9.2" rx="1.7" ry="2.3" transform="rotate(-25 5.2 9.2)"/><ellipse cx="9.1" cy="6.1" rx="1.7" ry="2.3" transform="rotate(-8 9.1 6.1)"/><ellipse cx="14.9" cy="6.1" rx="1.7" ry="2.3" transform="rotate(8 14.9 6.1)"/><ellipse cx="18.8" cy="9.2" rx="1.7" ry="2.3" transform="rotate(25 18.8 9.2)"/></svg>;
  if (name === 'lost') return <svg className="nav-link__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/></svg>;
  return <svg className="nav-link__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.8 20c.7-3.5 3.4-5.4 7.2-5.4s6.5 1.9 7.2 5.4"/></svg>;
}
