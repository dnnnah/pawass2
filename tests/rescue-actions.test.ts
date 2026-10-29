import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { WhatsAppActions } from '../src/features/rescue/whatsapp-actions';

describe('jerarquía de contacto de rescate', () => {
  it('ofrece WhatsApp primero, llamada después y ubicación como apoyo', () => {
    const html = renderToStaticMarkup(createElement(WhatsAppActions, {
      name: 'Niko', code: 'PC-TEST01', whatsapp: '+525500000000', callPhone: '+525511111111',
    }));
    expect(html).toContain('href="tel:+525511111111"');
    expect(html.indexOf('https://wa.me/')).toBeLessThan(html.indexOf('tel:'));
    expect(html.indexOf('tel:')).toBeLessThan(html.indexOf('Incluir mi ubicación'));
    expect(html).toContain('button button--text');
  });
});

it('mantiene WhatsApp azul de marca también durante una pérdida', () => {
  const html = renderToStaticMarkup(createElement(WhatsAppActions, {
    name: 'Niko', code: 'PC-TEST01', whatsapp: '+525500000000', urgent: true,
  }));
  expect(html).toContain('class="button button--whatsapp"');
});
