import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '../src/components/ui/button';
import { FormMessage } from '../src/components/ui/form-message';

// Regressions: a disclosure accidentally submits its parent form, or an empty
// feedback region is announced before there is a result to communicate.
describe('primitivas compartidas de formulario', () => {
  it('evita enviar el formulario por defecto y admite envío explícito', () => {
    expect(renderToStaticMarkup(<Button>Agregar</Button>)).toContain('type="button"');
    expect(renderToStaticMarkup(<Button type="submit">Guardar</Button>)).toContain('type="submit"');
  });

  it('no crea una región de anuncio cuando no hay mensaje', () => {
    expect(renderToStaticMarkup(<FormMessage />)).toBe('');
    expect(renderToStaticMarkup(<FormMessage>{''}</FormMessage>)).toBe('');
  });

  it('anuncia el resultado como estado y permite reservar alert para errores inmediatos', () => {
    expect(renderToStaticMarkup(<FormMessage>Guardado</FormMessage>)).toContain('role="status" aria-live="polite"');
    const error = renderToStaticMarkup(<FormMessage role="alert">No se pudo preparar la foto</FormMessage>);
    expect(error).toContain('role="alert"');
    expect(error).not.toContain('aria-live="polite"');
  });
});
