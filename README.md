# PawPass V2

PawPass reúne la cuenta del tutor, fichas QR de rescate, alertas de cuidado, pérdida y recuperación, un carnet privado, carteles de búsqueda y el espacio social Pawgram. La raíz `/` es la portada pública; `/acceso` contiene inicio, registro y recuperación. `/demo` presenta cinco perfiles sintéticos de solo lectura. El estado del producto, los límites funcionales y el contrato de Pawgram están en [PRODUCT.md](PRODUCT.md); las reglas visuales y de accesibilidad están en [DESIGN.md](DESIGN.md).

## Requisitos e instalación

Usa Node.js 22 (la misma versión de CI; Next.js requiere al menos 20.9) y npm. Instala dependencias y prepara el entorno local:

```sh
npm ci
cp .env.example .env.local
```

Completa `.env.local` con credenciales de un proyecto Supabase de desarrollo:

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto. En local suele ser `http://127.0.0.1:54321`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave pública/publishable de Supabase. RLS limita su acceso. |
| `NEXT_PUBLIC_SITE_URL` | Origen de la aplicación para canonical, enlaces y callbacks; por ejemplo `http://localhost:3000`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privilegiada, solo servidor. Necesaria para operaciones administrativas acotadas como eliminar cuenta, moderación y limpieza social. Nunca debe llevar prefijo `NEXT_PUBLIC_`, enviarse al navegador ni guardarse en Git. |

Inicia Next.js:

```sh
npm run dev
```

La configuración local del desarrollador no sustituye las variables de CI o producción. No copies claves de producción a archivos compartidos ni uses datos reales para pruebas destructivas.

## Supabase local, migraciones y datos demo

Para levantar un Supabase local necesitas Docker en ejecución y Supabase CLI (incluida como dependencia del proyecto):

```sh
npx supabase start
npx supabase status
npx supabase db reset --local
```

El reset aplica desde cero las migraciones locales y `supabase/seed.sql`. La semilla crea una cuenta ficticia `pawpass-seed@pawpass.invalid` y mascotas de prueba. Solo debe cargarse en Supabase local o en un entorno desechable; nunca apuntes un reset al proyecto remoto. El acceso rápido de la aplicación aparece solo en desarrollo cuando Supabase usa `localhost` o `127.0.0.1`. La cuenta se elimina desde Mi cuenta.

La demo pública no usa la semilla: sus cinco fichas están en un catálogo estático y sus fotografías optimizadas están en `public/demo`. No contiene canales de contacto ni operaciones contra datos de usuarios.

Antes de crear o aplicar una migración nueva en una base remota:

1. Revisa `npx supabase migration list --linked` y compárala con todos los archivos locales de migración pendientes.
2. Lee el SQL completo y confirma orden, efectos, RLS, grants, funciones y políticas de Storage.
3. Prueba primero en una base local aislada con todas las migraciones desde cero y sus pruebas SQL.
4. Aplica solo después de confirmar el estado remoto y el alcance. No uses `db reset` en remoto ni apliques migraciones pendientes a ciegas.

Las tablas privadas de cuenta, salud y documentos usan RLS/propiedad; los contratos públicos se sirven mediante consultas o funciones limitadas. La clave de servicio solo se usa desde servidor. Los archivos clínicos se conservan en un bucket privado y se descargan por una ruta autenticada; las imágenes sociales usan almacenamiento separado y autorización por solicitud.

## Rutas principales

| Ruta | Uso y acceso |
|---|---|
| `/` | Portada pública; si hay sesión ofrece acceso a Mis mascotas. |
| `/acceso` | Inicio de sesión, registro (`?modo=crear`) y recuperación. |
| `/auth/callback` | Confirmación/intercambio de sesión de Supabase Auth. |
| `/auth/reset-password` | Cambio de contraseña desde enlace de recuperación. |
| `/mascotas` | Lista privada y alta de mascotas. |
| `/mascotas/<id>` | Ficha y editor privado de mascota. |
| `/mascotas/<id>/perdida` | Reporte, cartel y recuperación del tutor. |
| `/mascotas/<id>/carnet` | Carnet y documentos privados del tutor. |
| `/cuenta` | Perfil, contactos y eliminación de cuenta. |
| `/p/<código>` | QR público, `noindex`; muestra solo los datos autorizados. |
| `/perdidas` | Tablón público de alertas activas. |
| `/perdidas/<código>` | Ficha pública de una pérdida activa. |
| `/pawgram` | Feed social público, `noindex`. |
| `/pawgram/mascotas/<id>` | Perfil público autorizado, `noindex`. |
| `/pawgram/publicaciones/<id>` | Publicación pública autorizada, `noindex`. |
| `/pawgram/mis-mascotas` y `/mascotas/<id>/pawgram` | Gestión privada y consentimiento social. |
| `/pawgram/administracion` | Moderación, solo para administradores autorizados. |
| `/demo` | Catálogo sintético, no indexable y sin acciones reales. |

Las rutas privadas requieren sesión y validación de propiedad en servidor. Las páginas de salud y cuenta, las fichas QR y las páginas de Pawgram no publican datos privados en metadata o sitemap. Una alerta activa puede indexarse; los buscadores pueden tardar en reflejar su retirada.

## Arquitectura

El código de producto vive en `src/features/<modulo>`; `src/app` compone rutas, layouts, estados de carga y metadata. Los módulos vigentes incluyen `auth`, `profile`, `pets`, `rescue`, `care-alerts`, `lost-pets`, `health-record`, `pawgram-profiles`, `pawgram-posts`, `pawgram-paws`, `pawgram-feed`, `pawgram-moderation`, `demo`, `pwa`, `navigation` y `brand`. `src/lib` contiene utilidades realmente compartidas y clientes de infraestructura. Las migraciones, seed y configuración de Supabase están bajo `supabase/`.

Cada capacidad agrupa UI, acciones, dominio, contratos y pruebas cerca de su módulo; evita añadir lógica de una función a carpetas globales por tipo. Las rutas deben entregar solo los datos que pueden mostrar. Autenticación, propiedad, visibilidad y límites de archivos se vuelven a comprobar en servidor y en la base, no solo en controles de interfaz.

## Comandos

```sh
npm test                 # Vitest
npm run lint             # ESLint
npm run typecheck        # TypeScript estricto
npm run build            # Next.js de producción con webpack
npm run start             # Servidor de producción
npm run audit:assets     # Audita CSS por ruta; requiere build previo
npm run test:e2e         # Playwright; requiere build y Supabase local
npm run db:reset         # Supabase local y seed; requiere Docker
npm run pawgram:cleanup  # Reintenta limpieza de assets sociales pendientes
```

Para ejecutar solo los dos E2E públicos sin modificar una cuenta de prueba, primero construye la aplicación y ejecuta el servidor de Playwright en modo público:

```sh
npm run build
PAWPASS_E2E_PUBLIC_ONLY=1 npm run test:e2e -- --grep 'la demo pública|la pérdida de demostración'
```

El E2E autenticado prepara una cuenta reservada con una clave temporal y solo admite un host de loopback. Para los tres E2E, levanta Supabase local, reinicia su base local con el seed y después ejecuta `npm run test:e2e`. En CI, GitHub Actions hace ese recorrido completo, incluye pruebas pgTAP, Vitest, lint, build, typecheck y auditoría de CSS. Chromium se instala en el workflow. Localmente `npm run test:e2e -- --list` lista los tres escenarios sin ejecutarlos.

`npm run pawgram:cleanup` procesa hasta 1.000 assets por ejecución y falla con código distinto de cero si quedan archivos pendientes. En producción habrá que programarlo periódicamente y vigilar fallos; esa programación forma parte del trabajo operativo de despliegue.

## Flujo de trabajo del proyecto

- Trabaja por fases con alcance y aceptación claros; cada fase de implementación inicia en un chat propio con GPT-6 Luna y razonamiento alto.
- Nombra ramas por su función, por ejemplo `feat/cuenta-mascotas` o `fix/contacto-qr`; no uses `codex` en el nombre.
- Usa Conventional Commits en español, por ejemplo `docs(operacion): actualizar instrucciones locales`. Aplica la skill `git-commit` al crear commits. Procura que cada commit tenga como máximo 400 líneas sumadas de adiciones y eliminaciones; separa unidades cuando sea viable y explica la excepción en commits históricos grandes.
- Escribe los pull requests en español y con detalle: propósito, alcance, decisiones, cambios de datos/migraciones, pruebas, riesgos y capturas si cambió la interfaz. Créales exclusivamente con GitHub CLI (`gh`) y no los fusiones antes de la revisión del autor.
- Conserva como únicas guías Markdown activas `README.md`, `PRODUCT.md` y `DESIGN.md`. Mantén rutas, scripts, variables y estados de fase al día aquí, sin conservar contratos contradictorios.

## Privacidad y seguridad

- No incluyas secretos en cliente, commits, seed remoto, logs o screenshots. `SUPABASE_SERVICE_ROLE_KEY` existe solo en el proceso servidor y para operaciones justificadas.
- Confirma sesión, propiedad y consentimiento en cada acción; RLS debe seguir siendo la barrera de datos. No publiques tablas privadas mediante permisos anónimos.
- Los QR, Pawgram y la demo son superficies distintas: el QR expone solo campos expresamente elegidos para rescate; Pawgram muestra solo su snapshot social consentido; la demo solo datos y fotos sintéticos autorizados.
- No agregues salud, documentos, RUAC, identidad del tutor, números o ubicación privada a metadata, Open Graph, sitemap o respuestas públicas.
- Retira contenido antes de limpiar sus archivos y conserva reintentos/referencias ante errores de Storage. La limpieza de filas y objetos no es una transacción atómica; comunica fallos parciales.
- El uso de `noindex` reduce indexación, pero no protege una URL pública ni borra copias externas. Las respuestas privadas y recursos sociales deben conservar las políticas `no-store` previstas.
- No solicites geolocalización del visitante. La zona de pérdida es texto que aporta el tutor.

## Vercel, dominio y OAuth

El repositorio está preparado para Next.js en Vercel; el despliegue detectó el framework y no requiere un `vercel.json` adicional. La aplicación usa un proyecto Supabase existente. El proyecto de Vercel se llama `pawpass`; `https://pawpass.vercel.app` pertenece a otro sitio, así que asignamos `https://pawpass2.vercel.app` al entorno Production. La portada, el manifest y el service worker ya responden en ese dominio. El alias automático del proyecto es [pawpass-ashen.vercel.app](https://pawpass-ashen.vercel.app).

En Vercel Production quedaron `NEXT_PUBLIC_SITE_URL=https://pawpass2.vercel.app`, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para el proyecto PawPass de Supabase (`nmjciiywuyldhkrzsxks`, región `us-east-1`). Vercel indica que hace falta un nuevo despliegue para aplicar estas variables; no se inició ese redeploy. Falta `SUPABASE_SERVICE_ROLE_KEY`: agrégala como tipo **Secret** desde el panel de Supabase y nunca la expongas al navegador.

Vercel marca una implementación de `feat/vercel-pwa-oauth` como **Production**, aunque el ajuste de seguimiento de rama dice `main`. El nuevo dominio apunta al entorno Production. Revisa esta discrepancia y la rama de origen antes de publicar cambios posteriores o habilitar cuentas reales.

### Configurar Vercel

1. En **Settings → General**, usa Node.js 22. Deja los comandos detectados por Next.js: instalación `npm ci`, build `npm run build` y salida administrada por Next.js. El proyecto ya configura Server Actions con un límite de 4 MB; las fotos y documentos de hasta 10 MB suben directamente a Storage con un token temporal, y el servidor los valida y normaliza antes de guardarlos. No aumentes el límite de Server Actions para aceptar esos archivos.
2. En **Settings → Environment Variables**, añade estas tres variables a Production y Preview, cada una con el valor del proyecto Supabase que corresponda a ese entorno:

   | Variable | Dónde obtenerla |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL. |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → publishable key. |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → secret/service-role key. Solo servidor; nunca uses el prefijo `NEXT_PUBLIC_`. |

   Para `NEXT_PUBLIC_SITE_URL`, añade `https://pawpass2.vercel.app` en **Production**. Déjala sin definir en **Preview**: Vercel aporta el origen de cada preview y la aplicación conserva el dominio de producción como canonical. No pongas claves de producción en previews; lo recomendable es conectar un proyecto Supabase separado, con datos de prueba, como valores de Preview. No pegues secretos en GitHub, capturas ni conversaciones.
3. Comprueba que la región de las funciones de Vercel quede cerca de la región de tu proyecto Supabase; primero identifica esa región en Supabase → Project Settings → General. Vercel suele construir y desplegar automáticamente al importar el repositorio. Usa la rama `main` como producción y revisa los despliegues de ramas/PR como previews.
4. No pulses **Deploy** hasta configurar las variables y revisar los valores de Production/Preview. No hace falta pulsar **Add** en la tarjeta de integración Supabase: eso puede crear o conectar otro proyecto y PawPass necesita las credenciales de su proyecto Supabase actual. Tras el primer despliegue, confirma el dominio en **Settings → Domains** y ejecuta las comprobaciones de la lista de salida.

### Google OAuth en Supabase

Google Cloud ya tiene un cliente OAuth web activo llamado **PawPass Web**. Se agregó `pawpass2.vercel.app` a los dominios autorizados y `https://pawpass2.vercel.app` a los orígenes de JavaScript, conservando `localhost`, el dominio anterior y el callback existente. No crees un cliente duplicado ni generes otro secreto. El callback existente apunta a otro proyecto Supabase; confirma y agrega el callback `https://nmjciiywuyldhkrzsxks.supabase.co/auth/v1/callback` del proyecto PawPass antes de probar el flujo. El público está en **Prueba**, con cero usuarios de prueba, así que solo podrán acceder las cuentas que se agreguen como testers. Para publicar a usuarios generales, completa primero la información legal y los enlaces de marca y sigue la verificación que Google solicite.

1. En Google Cloud existe un OAuth Client ID web llamado **PawPass Web**. Reutilízalo y añade como origen autorizado `https://pawpass2.vercel.app`, conservando `http://localhost:3000`.
2. En Supabase → **Authentication → Sign In / Providers → Google**, habilita Google. Copia el Client ID y Client Secret de Google en los campos del proveedor. Google debe tener como URI de redirección autorizado el callback exacto que muestra Supabase en ese panel, con forma `https://<project-ref>.supabase.co/auth/v1/callback`.
3. En Supabase → **Authentication → URL Configuration**, configura Site URL como `https://pawpass2.vercel.app`. En Redirect URLs agrega `https://pawpass2.vercel.app/auth/callback`, `https://pawpass2.vercel.app/auth/reset-password` y `http://localhost:3000/**`. Para previews agrega un patrón limitado a tu slug/cuenta Vercel, por ejemplo `https://*-<slug-de-tu-equipo>.vercel.app/**`; reemplaza los ejemplos y prueba un preview real. No uses un comodín abierto para cualquier host.
4. Prueba registro, confirmación de correo, inicio de sesión con Google, cierre de sesión, recuperación y cambio de contraseña en una preview aislada. Verifica además el callback en la URL estable y el preview antes de producción. Si Google exige verificación, completa sus requisitos de identidad y dominio desde Google Cloud.

La clave privada `SUPABASE_SERVICE_ROLE_KEY` aún debe añadirse desde el panel de Supabase como **Secret** en Vercel Production; después podrás iniciar un redeploy cuando decidas publicar esta configuración. No compartas esa clave por chat. Tampoco está definida la identidad legal ni un medio de contacto del responsable. Las páginas `/privacidad` y `/terminos` muestran un borrador visible con esa limitación; completa y revisa el responsable, contacto, conservación y regiones de tratamiento antes de abrir el servicio o pedir verificación a Google.

### Lista de salida

- Confirma que `pawpass2.vercel.app` conserva una configuración válida, que Production usa la rama y proyecto Supabase esperados y que Preview no expone datos de producción.
- Verifica la portada, acceso, callback OAuth, recuperación, alta/edición de una mascota, QR, reporte de pérdida, subida y descarga privada de un documento, Pawgram, páginas legales y página offline.
- Instala la PWA en Chrome Android y Safari iOS; comprueba icono, nombre y apertura independiente. El service worker solo precachea recursos públicos conocidos: no almacena páginas privadas, auth, API, documentos ni fotografías. La edición y los datos requieren conexión.
- Revisa privacidad/SEO, lectores de pantalla y contrastes en los dispositivos objetivo. Esta revisión automatizada no certifica WCAG 2.2 AA; hace falta una comprobación manual completa.
- Programa y monitoriza `npm run pawgram:cleanup` en un entorno operativo con Supabase. También revisa límites, retención y limpieza periódica de objetos temporales abandonados en Storage.
- Prueba un rollback desde Vercel y conserva el último despliegue correcto. El dominio nuevo ya está asignado a Production; esta fase no ejecutó un redeploy manual después de configurar `NEXT_PUBLIC_SITE_URL`.

## Next.js y archivos locales

El proyecto usa Next.js 16.4.3. Antes de cambiar APIs, convenciones o estructura, lee la guía correspondiente incluida con esa versión de Next.js y sigue sus advertencias. `next.config.ts` desactiva `agentRules` para que `next dev` no cree ni actualice un cuarto archivo Markdown administrado. El sidecar Markdown de superficie que puede producir Impeccable es contexto regenerable, no una guía activa; `.gitignore` lo excluye para mantener las tres guías acordadas. No invoques un generador de instrucciones que lo vuelva a versionar. Los metadatos de Impeccable son auxiliares; la guía de diseño mantenida es `DESIGN.md`.

Los artefactos locales ignorados por Git, incluyendo la carpeta de experimentos visuales, no forman parte del repositorio ni de un PR. Verifica `git ls-files '*.md'` para comprobar el árbol versionado. Los archivos de build, resultados E2E y secretos locales tampoco se versionan.
