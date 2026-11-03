import type { Metadata } from 'next';
import { LegalPage } from '@/features/legal/legal-page';
import { getSiteUrl } from '@/lib/supabase/env';

export const metadata: Metadata = {
  title: 'Aviso de privacidad | PawPass',
  description: 'Cómo PawPass utiliza la información de cuenta, mascotas, cuidados y rescate.',
  alternates: { canonical: `${getSiteUrl()}/privacidad` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Aviso de privacidad" summary="Información sobre los datos que PawPass usa para cuentas, fichas de mascotas, cuidado y rescate.">
      <section>
        <h2>Responsable y contacto</h2>
        <p>PawPass es el nombre del producto. Este proyecto aún no identifica a la persona física o empresa que será responsable del tratamiento, su domicilio ni un medio de contacto. Esos datos deben añadirse antes de ofrecer el servicio al público; este borrador no los sustituye.</p>
      </section>
      <section>
        <h2>Datos que puede tratar el servicio</h2>
        <p>La aplicación puede guardar datos de cuenta como nombre, correo y teléfono; información de las mascotas; alertas e instrucciones de cuidado; reportes de pérdida con zona escrita; fotografías; y registros de salud y documentos que el tutor agrega al carnet privado.</p>
        <p>El tutor decide si publica datos concretos en una ficha QR, una alerta de pérdida o Pawgram. El expediente de salud y los documentos se diseñaron para mantenerse privados. Una publicación o ficha marcada como pública puede ser vista y copiada por cualquier persona.</p>
      </section>
      <section>
        <h2>Inicio de sesión con Google</h2>
        <p>Si eliges Google, Supabase Auth procesa la autenticación. PawPass recibe los datos básicos de perfil y correo necesarios para identificar o crear tu cuenta. PawPass no solicita acceso a Google Drive, Gmail ni a otros archivos de tu cuenta.</p>
      </section>
      <section>
        <h2>Proveedores y almacenamiento</h2>
        <p>PawPass usa Supabase para autenticación, base de datos y archivos. Vercel está previsto para alojar la aplicación web. Las regiones finales, los plazos de retención de respaldos y los medios de contacto de cada proveedor deben confirmarse antes del lanzamiento.</p>
      </section>
      <section>
        <h2>Acceso, cambios y eliminación</h2>
        <p>La cuenta permite editar información y solicitar su eliminación. Al borrar una mascota, el código público puede reservarse sin datos identificables para evitar que se reutilice. El tutor debe retirar información que ya compartió fuera de PawPass; copias hechas por otras personas o buscadores pueden permanecer fuera del control de la aplicación.</p>
      </section>
      <section>
        <h2>Datos pendientes para la versión definitiva</h2>
        <p>Antes de habilitar usuarios públicos, el responsable deberá publicar su identidad y contacto, definir los plazos de conservación y eliminación de respaldos, describir los derechos y canales para ejercerlos, confirmar las regiones de almacenamiento y revisar este aviso según las jurisdicciones donde opere.</p>
      </section>
    </LegalPage>
  );
}
