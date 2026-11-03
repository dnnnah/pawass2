import { describe, expect, it } from 'vitest';
import { demoPets, findDemoPetByCode, getDemoQrPath } from './domain';

describe('catálogo público de demostración', () => {
  it('mantiene cinco mascotas, con tres gatos, dos perros y una sola pérdida', () => {
    expect(demoPets).toHaveLength(5);
    expect(demoPets.filter((pet) => pet.species === 'gato')).toHaveLength(3);
    expect(demoPets.filter((pet) => pet.species === 'perro')).toHaveLength(2);
    expect(demoPets.filter((pet) => pet.lostReport)).toHaveLength(1);
    expect(demoPets.find((pet) => pet.lostReport)?.slug).toBe('tacho');
  });

  it('incluye los cuatro grupos de carnet de muestra en cada ficha', () => {
    for (const pet of demoPets) {
      expect(pet.health.vaccinations.length).toBeGreaterThan(0);
      expect(pet.health.dewormings.length).toBeGreaterThan(0);
      expect(pet.health.interventions.length).toBeGreaterThan(0);
      expect(pet.health.documents.length).toBeGreaterThan(0);
      expect(pet.health.documents.every((document) => document.simulated)).toBe(true);
    }
  });

  it('resuelve el código público solo a una ficha y ruta de demostración', () => {
    expect(findDemoPetByCode('DEMO-TACHO')).toMatchObject({ slug: 'tacho', name: 'Tacho' });
    expect(getDemoQrPath('DEMO-TACHO')).toBe('/demo/codigo/DEMO-TACHO');
    expect(findDemoPetByCode('REAL-CODE-123')).toBeUndefined();
    expect(getDemoQrPath('REAL-CODE-123')).toBeNull();
  });
});
