import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PrivacyPage from '@/app/privacidad/page';
import TermsPage from '@/app/terminos/page';

describe('avisos públicos para el inicio de sesión con Google', () => {
  it('explica los datos que usa PawPass y deja clara la identidad pendiente', () => {
    const markup = renderToStaticMarkup(<PrivacyPage />);

    expect(markup).toContain('Aviso de privacidad');
    expect(markup).toContain('datos básicos de perfil y correo');
    expect(markup).toContain('El expediente de salud y los documentos se diseñaron para mantenerse privados');
    expect(markup).toContain('El titular legal y sus datos de contacto todavía no están definidos');
  });

  it('expone términos informativos sin afirmar que la versión legal ya está aprobada', () => {
    const markup = renderToStaticMarkup(<TermsPage />);

    expect(markup).toContain('Condiciones de uso');
    expect(markup).toContain('borrador informativo');
    expect(markup).toContain('requieren conexión a internet');
    expect(markup).toContain('completar los datos de quien presta el servicio');
  });
});
