import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { demoPets } from './domain';
import { DemoLandingPage, DemoPetPage } from './views';

describe('vistas públicas de demostración', () => {
  it('identifica la muestra y enlaza a las cinco fichas sin acciones de contacto', () => {
    const html = renderToStaticMarkup(<DemoLandingPage pets={demoPets} />);
    expect(html).toContain('Demostración pública · Datos ficticios');
    expect(html.match(/href="\/demo\/mascotas\//g)).toHaveLength(5);
    expect(html).toContain('Tacho');
    expect(html).not.toMatch(/href="(?:tel:|mailto:|https?:\/\/wa\.me)/);
    expect(html).not.toContain('<form');
  });

  it('señala que el caso de pérdida es ficticio y solo enlaza al código demo', () => {
    const tacho = demoPets.find((pet) => pet.slug === 'tacho');
    if (!tacho) throw new Error('Falta la ficha de demostración de Tacho.');
    const html = renderToStaticMarkup(<DemoPetPage pet={tacho} />);
    expect(html).toContain('no requiere ayuda ni una búsqueda real');
    expect(html).toContain('Contacto del equipo demo PawPass · canal deshabilitado');
    expect(html).toContain('Cartel de búsqueda de demostración');
    expect(html).toContain('href="/demo/codigo/DEMO-TACHO"');
    expect(html).toContain('Ejemplo simulado · sin valor clínico');
    expect(html).not.toMatch(/href="(?:tel:|mailto:|https?:\/\/wa\.me)/);
    expect(html).not.toContain('<form');
  });
});
