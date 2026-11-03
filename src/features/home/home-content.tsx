import Link from 'next/link';
import { PetDetail } from '@/features/brand/pet-note';
import styles from './home.module.css';

export function HomeContent({ signedIn }: { signedIn: boolean }) {
  return (
    <main id="contenido" tabIndex={-1} className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.intro}>
          <h1 id="home-title">Su ficha.<br />Sus cuidados.<br /><span>Una forma de volver a casa.</span></h1>
          <p>PawPass reúne la ficha de rescate QR y el carnet privado de tu perro o gato. Para cuidar cada día y facilitar el contacto si se pierde.</p>
          <div className={styles.actions}>
            <Link href={signedIn ? '/mascotas' : '/acceso?modo=crear'} prefetch={false} className="button button--primary">{signedIn ? 'Ir a mis mascotas' : 'Crear cuenta'}</Link>
            <Link href="/perdidas" className="button button--outline">Ver mascotas perdidas</Link>
            <Link href="/demo" className="button button--text">Explorar demo</Link>
          </div>
          {!signedIn && <p className={styles.login}>¿Ya tienes cuenta? <Link href="/acceso" prefetch={false}>Iniciar sesión</Link></p>}
          <p className={styles.detail}>Quien encuentra a tu mascota puede abrir su QR sin tener cuenta ni instalar la aplicación.</p>
        </div>
        <figure className={styles.rescue}>
          <figcaption className={styles.demoLabel}>Ejemplo ficticio · Sin datos reales</figcaption>
          <div className={styles.petPortrait}><PetDetail kind="dog" /><span>Mora</span><small>Perra · Ficha de rescate</small></div>
          <div className={styles.rescueBody}>
            <h2>Un QR que abre el contacto</h2>
            <p>Su nombre, sus cuidados de rescate y las formas de contactarte que tú autorizas.</p>
            <div className={styles.exampleActions} aria-label="Vista demostrativa de contactos, sin acciones activas"><span>Enviar WhatsApp al tutor</span><span>Llamar al tutor</span></div>
            <p className={styles.exampleCare}><PetDetail kind="heart" /><span><strong>Cuidados de Mora</strong>Se asusta con los ruidos. Acércate con calma.</span></p>
            <small>Vista demostrativa. Los contactos no están activos.</small>
          </div>
        </figure>
      </section>

      <section className={styles.steps} aria-labelledby="steps-title">
        <h2 id="steps-title">De su primera ficha a cada nuevo cuidado</h2>
        <ol>
          <li><strong>Registra a tu mascota</strong><p>Empieza con su nombre y especie. Elige qué información de rescate autorizas publicar y completa los detalles después.</p></li>
          <li><strong>Comparte su QR</strong><p>Su código es permanente. Al escanearlo, se abre la ficha pública con los contactos y cuidados que decidiste mostrar.</p></li>
          <li><strong>Mantén sus datos al día</strong><p>Actualiza sus contactos, registra sus cuidados y activa una búsqueda si llega a perderse.</p></li>
        </ol>
      </section>

      <section className={styles.feature} aria-labelledby="lost-title">
        <div className={styles.featureCopy}>
          <PetDetail kind="collar" />
          <h2 id="lost-title">Si se pierde, una ficha lista para compartir</h2>
          <p>Activa la alerta de pérdida para publicar los detalles de búsqueda. Su QR conserva la misma dirección y muestra que necesita volver a casa.</p>
          <p>La alerta aparece en el tablón público. Con foto y ubicación, puedes generar un cartel para compartir o imprimir. Cuando regrese, marca que ya está en casa.</p>
          <Link href="/perdidas" className="button button--text">Ver mascotas perdidas</Link>
        </div>
        <figure className={styles.poster}>
          <figcaption className={styles.demoLabel}>Alerta y cartel · Ejemplo ficticio</figcaption>
          <div className={styles.posterBody}>
            <span className={styles.lostStatus}>Mascota perdida</span>
            <h3>Se busca a Mora</h3>
            <PetDetail kind="dog" />
            <p><strong>Última vez vista</strong><br />Parque de ejemplo · Zona ficticia</p>
            <p>Si la ves, contacta a su tutor desde la ficha de búsqueda.</p>
            <small>Demostración: no es una búsqueda activa ni un cartel para difundir.</small>
          </div>
        </figure>
      </section>

      <section className={`${styles.feature} ${styles.health}`} aria-labelledby="health-title">
        <div className={styles.featureCopy}>
          <PetDetail kind="heart" />
          <h2 id="health-title">Sus cuidados, en un espacio privado</h2>
          <p>Guarda vacunas, desparasitaciones, cirugías e intervenciones y documentos clasificados en el carnet de cada mascota.</p>
          <p>El historial y los documentos son privados. La ficha QR solo muestra la información de rescate y las alertas de cuidado que autorizas.</p>
        </div>
        <figure className={styles.record}>
          <figcaption className={styles.demoLabel}>Carnet privado · Ejemplo ficticio</figcaption>
          <div className={styles.recordBody}>
            <div className={styles.recordHeading}><PetDetail kind="cat" /><div><h3>El carnet de Nube</h3><span>Solo para su tutor</span></div></div>
            <dl><div><dt>Vacunas</dt><dd>Registro de aplicación y próximas dosis</dd></div><div><dt>Desparasitaciones</dt><dd>Tratamientos y fechas de seguimiento</dd></div><div><dt>Intervenciones</dt><dd>Cirugías y notas de cuidado</dd></div><div><dt>Documentos</dt><dd>Archivos clasificados y privados</dd></div></dl>
          </div>
        </figure>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <PetDetail kind="sparkle" />
        <h2 id="closing-title">Empieza con su nombre.<br />Completa su historia a tu ritmo.</h2>
        <p>Sus detalles y contactos opcionales pueden esperar. Tú decides qué se comparte y qué queda contigo.</p>
        <Link href={signedIn ? '/mascotas' : '/acceso?modo=crear'} prefetch={false} className="button button--primary">{signedIn ? 'Ir a mis mascotas' : 'Crear cuenta'}</Link>
      </section>
    </main>
  );
}
