import type { Metadata } from 'next';
import { LegalPage } from '@/features/legal/legal-page';
import { getSiteUrl } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: 'Condiciones de uso | PawPass',
  description: 'Información preliminar sobre el uso de PawPass.',
  alternates: { canonical: `${getSiteUrl()}/terminos` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Condiciones de uso" summary="Información preliminar sobre las funciones y límites del servicio PawPass.">
      <section>
        <h2>Qué ofrece PawPass</h2>
        <p>PawPass ayuda a organizar fichas de identificación, contactos para rescate, alertas de pérdida y registros privados de cuidado. No es un servicio veterinario ni una autoridad que verifique microchips, RUAC o la identidad de una mascota.</p>
      </section>
      <section>
        <h2>Información pública</h2>
        <p>Antes de publicar una ficha QR, alerta o contenido en Pawgram, revisa qué datos serán visibles. No incluyas información que no quieras compartir. Una vez que alguien copia una página pública, PawPass no puede retirar esa copia de otros sitios o dispositivos.</p>
      </section>
      <section>
        <h2>Cuenta y contenido</h2>
        <p>Mantén segura tu cuenta y comparte únicamente información que tengas derecho a publicar. Las funciones de cuidado y salud son herramientas de organización; no reemplazan el criterio ni la atención de un profesional veterinario.</p>
      </section>
      <section>
        <h2>Conexión y disponibilidad</h2>
        <p>La PWA puede instalarse y mostrar una pantalla sin conexión. Consultar datos, iniciar sesión, subir archivos y guardar cambios requieren conexión a internet. La instalación sin conexión no permite consultar fichas privadas ni guardar ediciones para después.</p>
      </section>
      <section>
        <h2>Documento pendiente</h2>
        <p>Esta página es un borrador informativo, no los términos contractuales definitivos. Antes del acceso público, el responsable del servicio debe completar los datos de quien presta el servicio, el contacto, las reglas de cuenta y contenido, disponibilidad, jurisdicción y proceso para resolver reclamaciones.</p>
      </section>
    </LegalPage>
  );
}
