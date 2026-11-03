import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HomeContent } from './home-content';

describe('entrada a la demo pública', () => {
  it('ofrece una ruta directa para explorar la demo desde la portada', () => {
    const html = renderToStaticMarkup(<HomeContent signedIn={false} />);
    expect(html).toContain('href="/demo"');
    expect(html).toContain('Explorar demo');
  });
});
