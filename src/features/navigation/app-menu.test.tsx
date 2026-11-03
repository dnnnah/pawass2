import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppMenu } from './app-header';

describe('menú principal de PawPass', () => {
  it('incluye la demo como destino público y marca su página activa', () => {
    const html = renderToStaticMarkup(<AppMenu active="demo" signedIn={false} onNavigate={() => {}} />);
    expect(html).toContain('href="/demo"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Explorar demo');
    expect(html).not.toContain('Cerrar sesión');
  });
});
