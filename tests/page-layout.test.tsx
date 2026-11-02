import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmptyState, PageContent, PageFrame, PageHeading, PawPlaceholder, SectionHeading } from '../src/components/ui/page-layout';
import { PetStatusBadge } from '../src/features/pets/pet-status';

describe('composición compartida de páginas', () => {
  it('conserva una sola región principal y un contenedor de contenido', () => {
    const markup = renderToStaticMarkup(
      <PageFrame><PageContent className="pets-dashboard">Contenido</PageContent></PageFrame>,
    );

    expect(markup).toContain('<main');
    expect(markup).toContain('aria-label="Contenido principal"');
    expect(markup).toMatch(/class="[^"]*pets-dashboard/);
    expect(markup).toContain('Contenido');
  });

  it('expone el título de página como h1 y la descripción como texto normal', () => {
    const markup = renderToStaticMarkup(
      <PageHeading eyebrow="Privado" title="Mi cuenta" description="Administra tus contactos." />,
    );

    expect(markup).toContain('<header');
    expect(markup).toMatch(/<p class="[^"]*">Privado<\/p>/);
    expect(markup).toContain('<h1>Mi cuenta</h1>');
    expect(markup).toMatch(/<p class="[^"]*">Administra tus contactos\.<\/p>/);
  });

  it('mantiene los encabezados de sección como h2 y admite un dato contextual', () => {
    const markup = renderToStaticMarkup(<SectionHeading title="Vacunas" aside="2 registros" />);

    expect(markup).toContain('<h2>Vacunas</h2>');
    expect(markup).toContain('2 registros');
  });

  it('da título accesible al estado vacío y conserva una acción opcional', () => {
    const markup = renderToStaticMarkup(
      <EmptyState title="Todavía no hay mascotas" description="Agrega una ficha cuando estés listo." action={<a href="/cuenta">Mi cuenta</a>} />,
    );

    expect(markup).toContain('aria-labelledby=');
    expect(markup).toMatch(/<h2 id="[^"]+">Todavía no hay mascotas<\/h2>/);
    expect(markup).toContain('Agrega una ficha cuando estés listo.');
    expect(markup).toContain('<a href="/cuenta">Mi cuenta</a>');
  });

  it('marca la huella de sustitución como decoración dentro de su texto alternativo padre', () => {
    const markup = renderToStaticMarkup(<PawPlaceholder />);

    expect(markup).toContain('<svg');
    expect(markup).toContain('aria-hidden="true"');
  });

  it('presenta el estado de la mascota con texto e indicador decorativo compartidos', () => {
    const markup = renderToStaticMarkup(<PetStatusBadge status="lost" />);

    expect(markup).toContain('Perdida');
    expect(markup).toContain('aria-hidden="true"');
  });
});
