'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function LostSpeciesFilter({ species }: { species: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="lost-filters" aria-busy={pending}>
      <label className="field"><span>Especie</span><select name="especie" value={species} disabled={pending} onChange={(event) => {
        const value = event.target.value;
        startTransition(() => router.replace(value ? `/perdidas?especie=${encodeURIComponent(value)}` : '/perdidas', { scroll: false }));
      }}><option value="">Perros y gatos</option><option value="perro">Perros</option><option value="gato">Gatos</option></select></label>
      <span className="filter-feedback" role="status">{pending ? 'Actualizando alertas…' : 'Las alertas se muestran automáticamente.'}</span>
    </div>
  );
}
