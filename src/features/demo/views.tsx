import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { AppHeader } from '@/features/navigation/app-header';
import { PageContent, PageFrame, PageHeading } from '@/components/ui/page-layout';
import { getSiteUrl } from '@/lib/supabase/env';
import { getDemoQrPath, type DemoHealthEntry, type DemoPet } from './domain';
import styles from './demo.module.css';

export function DemoLandingPage(_props: { pets: DemoPet[] }) {
  return (
    <PageFrame className={styles.shell}>
      <AppHeader active="demo" signedIn={false} />
      <PageContent className={styles.page}>
        <DemoNotice />
        <PageHeading title="Una muestra de PawPass" description="Explora fichas de mascotas, cuidados y un carnet privado de ejemplo. Todo el contenido de esta página está preparado para demostración." />
        <div className={styles.intro}><p>Las fotografías se usan con autorización. Los nombres, perfiles y datos de salud que las acompañan son ficticios. Esta muestra no crea cuentas ni modifica registros.</p></div>
        <section aria-label="Mascotas de ejemplo" className={styles.petGrid}>
          {_props.pets.map((pet) => <DemoPetCard key={pet.slug} pet={pet} />)}
        </section>
      </PageContent>
    </PageFrame>
  );
}

export function DemoPetPage({ pet }: { pet: DemoPet }) {
  const codePath = getDemoQrPath(pet.code);
  return (
    <PageFrame className={styles.shell}>
      <AppHeader active="demo" signedIn={false} />
      <PageContent className={styles.page}>
        <DemoNotice />
        <Link href="/demo" className="back-link">← Volver a la demo</Link>
        <PageHeading title={pet.name} description={`${pet.species === 'perro' ? 'Perro' : 'Gato'} · ${pet.breed} · ${pet.age}`} />
        <section className={styles.profile} aria-label={`Ficha de ejemplo de ${pet.name}`}>
          <div className={styles.profilePhoto}><Image src={pet.photo} alt={pet.photoAlt} width={900} height={1100} priority unoptimized /></div>
          <div className={styles.profileCopy}>
            <p className={styles.recordLabel}>Ficha de demostración · {pet.code}</p>
            <h2>Sobre {pet.name}</h2>
            <dl className={styles.facts}>
              <div><dt>Especie y raza</dt><dd>{pet.species === 'perro' ? 'Perro' : 'Gato'} · {pet.breed}</dd></div>
              <div><dt>Edad y sexo</dt><dd>{pet.age} · {pet.sex}</dd></div>
              <div><dt>Color y tamaño</dt><dd>{pet.color} · {pet.size}</dd></div>
              <div><dt>Tutor de muestra</dt><dd>{pet.family} (ficticio)</dd></div>
            </dl>
            <p>{pet.temperament}</p>
            <div className={styles.care}><h3>Cuidados de ejemplo</h3><ul>{pet.care.map((note) => <li key={note}>{note}</li>)}</ul></div>
          </div>
        </section>

        <section className={styles.health} aria-labelledby="health-title">
          <div className={styles.healthNotice}><strong id="health-title">Carnet de ejemplo · datos simulados</strong><p>En PawPass, el carnet real es privado y solo lo consulta su tutor. Aquí todos los registros son inventados y no sirven como indicación clínica.</p></div>
          <div className={styles.healthGrid}>
            <HealthGroup title="Vacunas" entries={pet.health.vaccinations} />
            <HealthGroup title="Desparasitaciones" entries={pet.health.dewormings} />
            <HealthGroup title="Intervenciones" entries={pet.health.interventions} />
            <HealthGroup title="Documentos" entries={pet.health.documents} />
          </div>
        </section>

        {pet.lostReport && codePath && <DemoLostReport pet={pet} codePath={codePath} />}
        <p className={styles.photoDisclosure}>Foto autorizada para esta muestra; la identidad, el perfil y el historial son ficticios.</p>
      </PageContent>
    </PageFrame>
  );
}

export function DemoCodePage({ pet }: { pet: DemoPet }) {
  return (
    <PageFrame className={styles.shell}>
      <AppHeader active="demo" signedIn={false} />
      <PageContent className={styles.page}>
        <DemoNotice />
        <PageHeading title={`Código de ejemplo · ${pet.name}`} description="Este código solo abre la ficha de demostración y no identifica una mascota real." />
        <Link className="button button--primary" href={`/demo/mascotas/${pet.slug}`}>Ver ficha de {pet.name}</Link>
        <p className={styles.codeNote}>Código ficticio: {pet.code}. No es un código de rescate activo.</p>
      </PageContent>
    </PageFrame>
  );
}

function DemoNotice() {
  return <aside className={styles.notice} aria-label="Aviso de demostración"><strong>Demostración pública · Datos ficticios</strong><p>Las fichas no representan búsquedas reales. Ninguna mascota de esta demo necesita ayuda.</p></aside>;
}

function DemoPetCard({ pet }: { pet: DemoPet }) {
  return (
    <article className={styles.petCard}>
      <Link className={styles.petCardLink} href={`/demo/mascotas/${pet.slug}`}>
        <div className={styles.cardPhoto}><Image src={pet.photo} alt={pet.photoAlt} width={520} height={680} unoptimized /></div>
        <div className={styles.cardBody}>
          <div className={styles.cardMeta}><span>{pet.species === 'perro' ? 'Perro' : 'Gato'} · {pet.age}</span>{pet.lostReport && <span className={styles.lostTag}>Pérdida ficticia</span>}</div>
          <h2>{pet.name}</h2>
          <p>{pet.breed}</p>
          <span className={styles.cardAction}>Explorar ficha <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}

function HealthGroup({ title, entries }: { title: string; entries: DemoHealthEntry[] }) {
  return (
    <section className={styles.healthGroup} aria-label={title}>
      <h3>{title}</h3>
      <ul>{entries.map((entry) => <li key={`${entry.date}-${entry.title}`}>
        <div className={styles.entryHeading}><strong>{entry.title}</strong><time dateTime={entry.date}>{new Date(`${entry.date}T12:00:00`).toLocaleDateString('es-MX', { dateStyle: 'medium' })}</time></div>
        <p>{entry.note}</p>
        <span className={styles.simulated}>Ejemplo simulado · sin valor clínico</span>
      </li>)}</ul>
    </section>
  );
}

function DemoLostReport({ pet, codePath }: { pet: DemoPet; codePath: string }) {
  const report = pet.lostReport!;
  const qrUrl = new URL(codePath, getSiteUrl()).toString();
  return (
    <section className={styles.lostReport} aria-labelledby="demo-lost-title">
      <div className={styles.lostNotice} role="alert">
        <h2 id="demo-lost-title">Reporte de pérdida · caso ficticio</h2>
        <p>{report.message}</p>
        <p><strong>No requiere ayuda real. No llames, no escribas y no compartas este aviso como una búsqueda activa.</strong></p>
      </div>
      <dl className={styles.reportFacts}>
        <div><dt>Última vez visto</dt><dd><time dateTime={report.lastSeenAt}>{new Date(report.lastSeenAt).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}</time></dd></div>
        <div><dt>Zona ficticia</dt><dd>{report.lastSeenLocation}</dd></div>
        <div><dt>Señas</dt><dd>{report.appearance}</dd></div>
        <div><dt>Mensaje de la familia demo</dt><dd>{report.message}</dd></div>
        <div><dt>Recompensa</dt><dd>{report.reward}</dd></div>
        <div><dt>Contacto</dt><dd>{report.contactLabel}</dd></div>
      </dl>
      <div className={styles.poster} aria-label="Cartel ficticio de búsqueda">
        <div className={styles.posterCopy}>
          <p className={styles.posterLabel}>Cartel de búsqueda de demostración</p>
          <h3>Se busca a {pet.name}</h3>
          <p className={styles.posterState}>EJEMPLO FICTICIO · NO DIFUNDIR</p>
          <p>{report.lastSeenLocation}</p>
          <p>{report.appearance}</p>
          <p>{report.careAlerts.map((alert) => `${alert.label}: ${alert.instructions}`).join(' ')}</p>
          <p>{report.reward}</p>
          <strong>{report.contactLabel}</strong>
          <p>Ningún canal de contacto está activo en esta ficha.</p>
        </div>
        <div className={styles.posterPhoto}><Image src={pet.photo} alt={pet.photoAlt} width={560} height={720} unoptimized /></div>
        <div className={styles.qrBox}>
          <QRCodeSVG value={qrUrl} size={128} title={`Código QR de demostración para ${pet.name}`} />
          <div><strong>{pet.code}</strong><span>Abre solo una ruta de demo</span><Link href={codePath}>Abrir código de ejemplo</Link></div>
        </div>
      </div>
    </section>
  );
}
