'use client';

export default function RescueError({ reset }: { reset: () => void }) {
  return (
    <main className="setup-page">
      <h1>Ficha temporalmente no disponible</h1>
      <p role="alert">No pudimos leer la información autorizada de rescate. Intenta de nuevo en unos momentos.</p>
      <button className="button button--outline" type="button" onClick={reset}>Reintentar</button>
    </main>
  );
}
