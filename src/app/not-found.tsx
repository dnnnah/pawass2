import Link from 'next/link';
import { BrandMark } from '@/features/auth/brand-mark';
import { PetDetail } from '@/features/brand/pet-note';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-heading">
        <BrandMark />
        <div className="not-found-card__illustration" aria-hidden="true"><PetDetail kind="dog" /><PetDetail kind="sparkle" /></div>
        <p className="not-found-card__code">Error 404</p>
        <h1 id="not-found-heading">No encontramos esta página</h1>
        <p>El enlace puede haber cambiado o ya no estar disponible. Puedes volver a tus mascotas o consultar las búsquedas activas.</p>
        <div className="not-found-card__actions"><Link className="button button--primary" href="/mascotas">Ir a mis mascotas</Link><Link className="button button--outline" href="/perdidas">Ver mascotas perdidas</Link></div>
        <Link className="not-found-card__home" href="/">Volver al inicio</Link>
      </section>
    </main>
  );
}
