# Pawgram — verificación y operación de fase 2

## Estado de entrega

Implementación en `feat/pawgram`, pendiente de revisión del autor. Sin demo, OAuth real, despliegue ni cambios en la auditoría general de latencia. El contrato funcional sigue en PRODUCT.md. Las rutas componen los cinco módulos verticales.

Se aplicaron cuatro migraciones aditivas al proyecto PawPass (`nmjciiywuyldhkrzsxks`): tablas, operaciones autorizadas, consulta pública e índices/permisos. Antes de aplicarlas se compararon las siete migraciones base locales con el historial remoto: coincidían y no había pendientes anteriores. Los archivos locales se alinearon con las versiones registradas por el MCP: `20261102220738`, `20261102220741`, `20261102220743` y `20261102223451`. No se cambiaron datos existentes de tutores o mascotas.

## Evidencia por criterio

| Criterio de PRODUCT.md | Implementación y verificación |
| --- | --- |
| 1. Voluntariedad y consentimiento | Sin perfil por defecto; vista previa firmada por servidor, vinculada al tutor y con caducidad de 15 minutos; confirmación social sin preseleccionar. SQL rechaza falta de consentimiento. Probado también mediante formulario y teclado. |
| 2. Solo versión autorizada | Copia explícita de campos; edad pública calculada sin referencias de nacimiento. Pruebas de dominio y SQL comprueban que cambiar la ficha privada no altera el snapshot y que no aparecen identificadores/contactos/fecha de cálculo. |
| 3. Autenticación y propiedad | getUser en mutaciones; RLS y RPC comprueban propiedad. Pruebas SQL y API real con visitante, propietario, otro tutor y administrador. Otra cuenta no lee filas privadas ni edita posts ajenos. |
| 4. Foto y accesibilidad | Una foto inmutable por post; entrada <=10 MB, decodificación servidor, límite de 40 millones de píxeles, sin animación; WebP calidad 80 sin EXIF/XMP/GPS. Texto <=1.000 y alt obligatorio <=500. Pruebas de bytes inválidos/SVG/exceso de tamaño/metadata y carga real desde navegador. |
| 5. Patitas | Clave primaria compuesta y operaciones idempotentes. 24 solicitudes concurrentes de dar/retirar en PostgreSQL temporal; 24 solicitudes reales en Supabase. Rechazo de patitas propias/ocultas. Sin lista pública de identidades. |
| 6. Feed estable | Cursor (created_at,id) descendente, conserva microsegundos y limita tamaño. Prueba SQL de empate de fechas sin omitir/repetir; sin ranking ni países. |
| 7. Retirada y restricciones | Ocultación verificada con RPC y formulario. Misma URL de imagen pasa de 200 a 404, también en HTTP real; HTML e imágenes no-store. Restauración respeta restricciones individuales y elección del tutor. |
| 8. Limpieza y rescate | Assets sociales separados, cascadas y cola durable. Pruebas de fallo/reintento de Storage, eliminación de mascota y reserva anónima de código. Limpieza real de cuentas/archivos temporales. No se comparten archivos físicos con rescate. |
| 9. Administración | Tabla de roles protegida, sin autoasignación; autorización fresca en servidor y SQL. Motivo visible al tutor; no puede alterarlo ni evadirlo al republicar. Pruebas SQL/API de restricción y restauración. |
| 10. SEO y privacidad | noindex/nofollow/noarchive heredados en rutas sociales; imágenes con X-Robots-Tag; sitemap sin Pawgram. Metadatos generales sin información privada. Comprobado en DOM y HTTP. |
| 11. Accesibilidad | Etiquetas nativas, alt obligatorio, estados con role=status y foco al resultado, aria-pressed en patitas. Revisión DOM automática sin campos sin etiqueta ni imágenes sin alt; árbol AX revisado, navegación/confirmación por teclado, Escape devuelve foco al menú y reflujo móvil sin desbordamiento (312 CSS px). Detector Impeccable sin incidencias. La revisión con un lector de pantalla audible completo, como VoiceOver, queda pendiente de comprobación humana; no se afirma certificación WCAG. |

Comprobaciones ejecutadas: `npm run lint`, `npm run typecheck`, `npm test` (134 pruebas, 31 archivos) y `npm run build`. Pruebas SQL adicionales: `pawgram_schema.sql`, `pawgram_authorization.sql`, `pawgram_public_contract.sql`. PostgreSQL temporal 18 con interfaces mínimas de Auth/Storage para probar RLS real; validación posterior con Supabase PostgreSQL 17, Auth y Storage reales mediante fixtures descartables. Las pruebas no se sustituyeron por mocks de autorización.

Capturas en `docs/screenshots/pawgram`: feed de escritorio/móvil y editor móvil. Usan una ilustración y una mascota de prueba temporales, no información personal real.

## Seguridad del almacenamiento

El bucket social es privado y no concede permisos al navegador, ni siquiera para generar URLs firmadas. Las rutas de imagen consultan `pawgram_photo_path` con la sesión ordinaria; solo después leen los bytes con la clave de servidor y vuelven a comprobar la autorización antes de responder. Este uso acotado de la clave evita URLs persistentes de Storage; no se usa para ampliar la proyección pública. La respuesta lleva no-store, nosniff y noindex; Next Image usa unoptimized y el service worker no almacena estas rutas.

El consentimiento copia una foto de rescate solo por elección explícita. Se reprocesa y se guarda como un archivo social independiente. Retirarlo no borra el original de rescate.

## Operación

- `SUPABASE_SERVICE_ROLE_KEY` debe existir únicamente en el entorno privado del servidor; ya está declarada como ejemplo en `.env.example`. Nunca usar prefijo NEXT_PUBLIC ni incluirla en Git. La configuración local la proporcionó el autor.
- El administrador inicial se designa mediante acceso privilegiado a la base: insertar el UUID de una cuenta existente en `public.pawgram_admins(account_id)`. No hay autoasignación ni administrador incrustado. Su interfaz está en `/pawgram/administracion`.
- Eliminar contenido lo retira primero de las consultas; los triggers ponen sus assets en estado retired. La aplicación intenta vaciar la cola al publicar/eliminar y al eliminar mascota/cuenta.
- `npm run pawgram:cleanup` reintenta la cola y recupera cargas pending con más de una hora. Si falla Storage conserva la referencia y termina con código 1. Procesa hasta 1.000 assets por ejecución. En la fase de despliegue deberá programarse periódicamente; esta entrega no crea infraestructura ni despliegue.
- Pruebas concurrentes reproducibles: ejecutar `scripts/test-pawgram-concurrency.py` con `PAWGRAM_TEST_DATABASE_URL` apuntando exclusivamente a una base aislada y migrada.
- Prueba integral descartable: `node --experimental-strip-types scripts/test-pawgram-live.mjs setup`, con el servidor local en 3100 y las variables privadas. Al terminar, ejecutar el mismo comando con `cleanup`. Crea tres cuentas y una mascota propias, guarda credenciales temporales en `/tmp` con permisos 0600 y no modifica cuentas existentes. Nunca ejecutar dos setups sin limpiar el anterior.

## Advisors y límites

Supabase no señala claves foráneas nuevas sin índice. Los índices aún sin uso son esperables en tablas nuevas. Los avisos de RLS sin políticas de `pawgram_admins` y `pawgram_assets` son intencionales: ningún cliente debe leerlas/escribirlas; solo el servidor y las funciones comprobadas acceden a ellas. Los avisos sobre funciones SECURITY DEFINER corresponden a proyecciones públicas y operaciones comprobadas, con search_path vacío y concesiones explícitas. Referencias: [RLS sin políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [funciones públicas](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) y [funciones autenticadas](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

La advertencia preexistente de [protección de contraseñas filtradas deshabilitada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) no se cambió en esta fase. La retirada impide nuevas respuestas de PawPass; no puede borrar copias ya descargadas ni cachés externas. La programación periódica de limpieza y la revisión audible con lector de pantalla son pendientes explícitos para el cierre operativo y la revisión del autor.

## Ajustes tras la revisión del autor

- El login espera la sesión y reemplaza el documento por `/mascotas`, evitando reutilizar una navegación prefetched anterior al acceso. Prueba de regresión y comprobación real del destino después del login.
- `/pawgram/mis-mascotas` permite elegir directamente una mascota, sin buscar la acción dentro del editor general.
- La gestión separa Perfil y Publicaciones. La configuración y la revisión son pasos distintos; volver a editar conserva el borrador. Al publicar se abre Publicaciones y se explica que la primera foto es la que aparece en el feed.
- Los bordes usaban una variable inexistente (`--muted`). Ahora utilizan el token real `--ink-soft`; se comprobaron el borde computado y el reflujo móvil. Los opcionales muestran su valor o explican que falta registrarlo.
- El foco llega a la vista previa y al resultado de publicación; el formulario de la primera foto permanece abierto después de publicar.
- Recorrido real verificado con fixtures nuevos: acceso sin sesión → login → Mis mascotas → selector de Pawgram → perfil desde cero → copia autorizada de foto principal → consentimiento → publicación → primera foto accesible. Se limpiaron también la foto principal y los archivos sociales de los fixtures.
- Capturas actualizadas de selector, gestión de escritorio y editor móvil. No se añadieron migraciones ni cambios de permisos.
