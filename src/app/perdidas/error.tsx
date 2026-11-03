'use client';

import Link from 'next/link';

export default function LostPetsError({ reset }: { reset: () => void }) {
  return (
    <main className="setup-page">
      <h1>Alerta temporalmente no disponible</h1>
      <p role="alert">No pudimos leer esta búsqueda. Intenta de nuevo en unos momentos.</p>
      <button className="button button--outline" type="button" onClick={reset}>Reintentar</button>
      <Link href="/perdidas">Volver al tablón</Link>
    </main>
  );
}
