# Auditoría y cierre de primera versión de PawPass V2

Fecha: 31 de octubre de 2026
Base: `origin/main` después de integrar PR #7
Alcance: accesibilidad WCAG 2.2 AA, SEO y privacidad, PWA, recorridos completos y experiencia visual de las rutas existentes.

## Criterios verificables

### Accesibilidad y experiencia

- Completar cada recorrido con teclado, orden de foco lógico, indicador de foco visible, sin trampas y con retorno de foco cuando se cierra un diálogo o menú.
- Confirmar nombres, instrucciones, relaciones de campo/error y anuncios de estados con árbol de accesibilidad; probar manualmente con VoiceOver en las rutas y estados principales.
- Medir contraste WCAG AA: 4.5:1 para texto normal y 3:1 para texto grande y controles/gráficos necesarios para operar.
- Reflujo a 320 CSS px y zoom de texto al 200% sin pérdida de contenido o función ni desplazamiento horizontal en dos dimensiones, salvo contenido que lo requiera.
- Respetar `prefers-reduced-motion`; comprobar que estados no dependan solo del color y que los controles táctiles cumplan WCAG 2.2 AA.
- Revisar escritorio y móvil por ruta, conservando el diseño azul mineral aprobado. No rehacer el acceso, que se ve coherente y legible en la primera inspección.

### SEO y privacidad

- `/perdidas` y `/perdidas/<código>` solo mientras la alerta esté activa: HTML con contenido público útil, título/descripcion/canonical correctos, `index,follow` y presencia en sitemap para alertas activas.
- `/p/<código>` en todos los estados, páginas privadas y documentos: `noindex`; no incluir datos privados en title, description, Open Graph, sitemap ni respuestas públicas.
- Una ruta `noindex` debe seguir rastreable por robots; alertas recuperadas no aparecen en el sitemap.
- `robots.txt` y canonical usan el origen de producción configurado y el sitemap no publica rutas de cuenta, mascotas ni documentos.

### PWA y operación sin conexión

- El manifiesto ofrece nombre, colores aprobados, iconos instalables y modo standalone.
- El service worker da una respuesta clara sin conexión para navegación, conserva solo la pantalla offline y recursos estáticos seguros, y nunca almacena respuestas HTML privadas, RSC/API, autenticación, imágenes firmadas, expedientes ni documentos.
- Sin conexión no se puede consultar o editar información privada ni se guardan cambios para sincronizar después.

### Recorridos de aceptación

1. Registro/inicio de sesión y recuperación de acceso.
2. Completar perfil y contactos; validar herencia de teléfono y excepción por mascota.
3. Alta en tres pasos, editar ficha, foto, contactos, alertas y eliminación confirmada.
4. Abrir y compartir QR público, comprobar privacidad y contacto.
5. Activar pérdida, editar detalles, consultar tablón y ficha, generar cartel en los cuatro formatos aprobados y recuperar mascota.
6. Carnet: vacunas, desparasitaciones, intervenciones y descarga privada de documentos; verificar que QR/tablón nunca exponen expediente.

## Hallazgos iniciales

| Ruta / flujo | Hallazgo | Tipo | Prioridad |
|---|---|---|---|
| `/` acceso/registro | Primera inspección móvil: jerarquía y controles claros; se conserva. La sesión local no ofrece cuenta de prueba porque `.env.local` apunta a Supabase remoto. | Verificación pendiente de extremo a extremo | Media |
| `/cuenta`, `/mascotas`, `/mascotas/[id]`, `/mascotas/[id]/carnet` | Rutas y acciones existen y declaran `noindex`; los recorridos requieren sesión. El acceso rápido de prueba está correctamente ausente con backend remoto. No se alterará ni limpiará data remota solo para la auditoría. | Limitación de entorno / verificación | Alta |
| `/perdidas` | SSR y canonical explícita; el carrusel decorativo desbordaba la vista del navegador estrecha. Se permitió el reflujo de las huellas y el documento ya no desborda a 244 CSS px en la inspección de navegador. | Corregido; falta QA con zoom/VoiceOver | Media |
| `/perdidas/[code]` | En una vista pública activa se confirmaron título dinámico, canonical e `index, follow`; el documento no desborda a 244 CSS px. El RPC del tablón y el sitemap obtienen solo alertas activas. El estado recuperado queda pendiente de una revisión con datos de prueba seguros. | Verificación SEO parcial | Media |
| `/p/[code]` | Página declara `noindex` en todos los estados; los contactos y alertas autorizados vienen de RPC públicos. Falta recorrido real de QR válido y confirmar cabeceras anti-cache. | Verificación privacidad | Alta |
| Editor / cartel | La fase 5 está integrada y los formatos 9:16, 4:5, A4 y carta están aprobados por el autor. Se mantiene el máximo expreso de dos alertas; falta repetir pruebas de recorrido y lectura accesible al cerrar V1. | Verificación funcional/accesible | Media |
| PWA global | Añadidos manifiesto standalone, iconos, registro del service worker y pantalla offline. Las pruebas del worker confirman que solo se conserva offline y los recursos estáticos permitidos; nunca HTML/RSC/API privada ni documentos. | Implementado; falta instalación en navegador de producción | Media |
| Metadata global / robots | El layout parte de `noindex`; las rutas públicas reemplazan la directiva. `robots.txt` permite rastrear páginas para que buscadores lean `noindex`. Se comprobó la canonical de una alerta pública. Las rutas de cuenta, mascotas, QR y pérdida responden `no-store`. | Corregido; revisar estados recuperados con datos seguros | Media |

La auditoría pública no envía mensajes ni solicita ubicación. Los datos visibles en el tablón se trataron únicamente como contenido ya publicado por el flujo público.

## Dirección añadida por el autor durante la auditoría

- El formulario de pérdida presenta **día y hora aproximada en campos separados y con etiquetas separadas**.
- La edición de datos de búsqueda abre una página/área de trabajo propia; no se despliega debajo de la tarjeta de mascota.
- La ficha privada muestra un estado inequívoco de **Perdida** y un paso de recuperación claramente separado que confirma “Ya está en casa”, con el periodo de aviso del QR conservado.
- El carnet agrupa identidad de salud, listas y formularios en secciones visuales claras. Cada tipo de registro muestra cantidad, nivel/prioridad cuando aplica, acciones para agregar/editar/eliminar y visibilidad pública solo para alertas de cuidado que el tutor puede autorizar para el QR. Vacunas, desparasitaciones, intervenciones y documentos siguen privados.
- Investigar el tiempo de navegación por ruta y reducir espera real y percibida con medición de datos, prefetch y estados de carga apropiados. No ocultar errores ni introducir caché de datos de usuario.
- Se conserva el acceso actual, valorado positivamente, y la decisión expresa de máximo dos alertas de cuidado en el cartel.
- Las tarjetas de mascota deben separar **Ficha pública**, **Editor de mascota** y **Pérdida**. Una sola acción lleva a la vista pública vigente: QR habitual o ficha de búsqueda activa. El QR permanente mantiene `/p/<código>` y enlaza a la ficha de búsqueda si la alerta está activa.
- El editor y el carnet deben mostrar grupos, conteos y acciones con jerarquía clara. Las rutas inválidas necesitan una página 404 propia y útil.

## Revisión de producto añadida

Los cambios anteriores no requieren nuevas decisiones de alcance: detallan la experiencia del cierre ya aprobado. Antes de tocar esos módulos se trazará el flujo actual, se confirmará si cada hallazgo es de funcionamiento o presentación y se prepararán criterios de aceptación por feature.

## Línea base antes de cambios

- `npm test`: 10 archivos, 58 pruebas aprobadas.
- `npm run typecheck`: aprobado.
- `npm run lint`: aprobado.
- `npm run build`: aprobado en Next.js 16.4.3.
- Next.js instalado: revisadas las guías de PWA, metadata, cache y producción.
- Supabase: no se propone cambiar esquema. No hay CLI local disponible; el proyecto configurado no es Supabase local, así que el recorrido autenticado de escritura no se ha iniciado en el backend conectado.

## Cambios y verificación de cierre

- La pérdida ahora se gestiona desde `/mascotas/[id]/perdida`; crear y editar ya no despliega el formulario debajo de la tarjeta. La página separa el estado perdido de la confirmación explícita de regreso y explica el cierre de la alerta, retiro de foto y aviso QR de 30 días.
- El formulario muestra campos etiquetados por separado para día y hora. Si se indica el momento, ambos campos son obligatorios para no publicar una hora inventada; ambos pueden dejarse vacíos. El timestamp existente se conserva y se interpreta en la zona horaria local del tutor.
- Carnet y alertas de cuidado ahora usan superficies delimitadas, contadores por tipo, prioridad visible, acciones agrupadas y texto de visibilidad QR. La vista del QR aclara qué información verá cualquier persona con el código.
- Las tarjetas de mascota ahora distinguen las áreas pública, privada y de pérdida; con alerta activa, la vista pública abre la ficha de búsqueda y las acciones separan editar alerta, confirmar el regreso y crear cartel. El QR físico conserva su ruta estable.
- La ficha de mascota presenta accesos agrupados para información, fotografía, cuidados, carnet y contactos. El carnet delimita registros y acciones de edición/eliminación; se añadió una página 404 propia con rutas de regreso. La inspección visual de las tarjetas, el carnet de ejemplo y la 404 se hizo con registros ficticios, sin escritura al backend.
- Las rutas dinámicas tienen `loading.tsx` para prefetch parcial y respuesta visual. Los enlaces internos usan navegación de Next.js. En navegador, la navegación del tablón a la ficha pública se completó en aproximadamente 100 ms.
- La inspección del tablón reveló overflow de un motivo decorativo; después del ajuste no hay overflow horizontal incluso a 244 CSS px (el navegador integrado de esta sesión no aplicó el override solicitado de 320 px).
- GET local confirmó `Cache-Control: no-store` en `/cuenta`, `/mascotas`, `/p/<código>` y `/perdidas/<código>`. `robots.txt` responde `Allow: /`; `manifest.webmanifest` ofrece `standalone` e iconos 192/512; `/service-worker.js` responde `no-store` y `Service-Worker-Allowed: /`.
- `npm test`: 78 pruebas en 13 archivos; `npm run typecheck`, `npm run lint` y `npm run build`: aprobados después de implementar PWA, privacidad, SEO y los cambios funcionales.
- Los cambios quedaron en el PR [#8](https://github.com/dnnnah/pawass2/pull/8), abierto desde `feat/cierre-primera-version` para revisión; no se ha integrado.
- No se probaron accesos ni escrituras autenticadas contra el Supabase remoto configurado: no hay cuenta de prueba local disponible y crear alertas públicas o subir/borrar archivos modificaría datos externos. No se modificaron datos remotos ni se solicitaron permisos de ubicación.
- Pendiente antes de declarar conformidad WCAG 2.2 AA: medición cuantitativa de contraste, teclado y VoiceOver en cada flujo autenticado, zoom al 200 %, instalación/offline en navegador de producción y recorrido autenticado con datos desechables en un proyecto local de Supabase. La limitación de entorno queda documentada y no se declara como prueba completada.

## Puerta de salida

No declarar cerrado el cierre de primera versión hasta completar las verificaciones pendientes con un entorno de pruebas seguro, revisar la instalación/offline en producción y describir toda dependencia externa de producción que no esté configurada.

## Revisión posterior: simplificación y fotografías

- Se sustituyeron las tarjetas anidadas por una única acción pública y enlaces de edición y pérdida. El QR permanente se consulta dentro del editor.
- El PNG prioriza indicaciones de encuentro y temperamento público, y añade cuidados según el espacio sin disminuir el cuerpo de texto.
- Causa de fotos ausentes: las vistas públicas requerían una clave administrativa ausente; además, no había respaldo a la foto habitual cuando faltaba la reciente. Se usa el cliente público y una política acotada a fotos vigentes autorizadas.
- Se compararon las seis migraciones remotas con las locales antes de aplicar `20261101050719_fotos_publicas_autorizadas.sql`. Comprobación con cliente anónimo: foto firmada y respuesta HTTP 200; documentos de salud rechazados por el predicado público.
- El logo tiene como destino directo `/mascotas`, con protección de sesión. En desarrollo se retira el service worker de PawPass para evitar estilos antiguos en caché.
- Verificación de esta revisión: 18 pruebas dirigidas aprobadas, lint, typecheck y build aprobados. Se comprobó la foto cargada en tablón, pérdida y QR; el logo volvió al listado desde el editor. Los cuatro PNG se generaron y se inspeccionó la composición de instrucciones/temperamento. No se editaron registros de mascotas durante la revisión.

## Distribución aprobada del editor, QR y pérdida

- Se trasladó el cartel a la página de pérdida y se mantuvo Editar alerta desde el editor. El listado privado, el tablón y la ficha pública ofrecen regreso rápido únicamente al dueño, mediante sesión y consultas limitadas a sus mascotas; el cierre sigue requiriendo confirmación.
- El editor incorpora navbar con sección actual, QR abierto con PNG/SVG y compartir enlace, vista previa de datos guardados con explicación de publicación, y resúmenes visibles de carnet, cuidados y documentos privados. Las fotos públicas mantienen proporción natural.
- Verificación: typecheck y build aprobados; 34 pruebas dirigidas de pérdida, cartel, rutas y política de caché aprobadas. Se inspeccionó el editor y la vista previa autenticada. El tablón en una sesión nueva sin autenticar no mostró controles de dueño. No se confirmó el regreso de ninguna mascota ni se modificaron sus registros.
- La prueba de descarga real del QR quedó bloqueada: el navegador indicó rechazo del permiso de descarga desde el sitio local. No se intentó una descarga alternativa. Los controles y la generación están implementados, pero la recepción final del archivo requiere verificación por el usuario.
- El override móvil solicitado al navegador no se aplicó (la vista permaneció en 1012 CSS px); no se declara completada la revisión móvil de 320 px.
- En la página de pérdida se confirmó una única sección de cartel con los cuatro formatos generados y la casilla de regreso presente. La foto pública cargó con proporción visual 0.750003 frente a la proporción original 0.75, sin controles de dueño en la sesión anónima.
- La confirmación rápida de la tarjeta se abrió y mostró la casilla inicialmente desmarcada; no se envió el cierre. Build final aprobado tras organizar los estilos por feature.

## Ajuste de distribución solicitado durante la revisión

- Se retiró la vista previa y se movió el QR al final de editar ficha y editar alerta. Ambas cabeceras muestran Ver ficha pública.
- Pérdida muestra primero el formulario. El cartel se monta únicamente al abrir su sección plegable; después aparecen regreso y QR.
- Ya está en casa usa un botón real con icono, confirmación y Cancelar. Las alertas de cuidado muestran lápiz de edición y ojo de visibilidad pública; el servidor comprueba sesión, dueño y pertenencia de la alerta y actualiza todas las vistas. Se impide usar el ojo mientras hay una edición abierta para no contradecir cambios pendientes.
- El carnet aplica espaciado por sección y registro, elimina el margen negativo de las confirmaciones y coloca el lápiz junto a vacunas/desparasitaciones. El ojo tachado indica expediente privado; no lo publica. Agregar queda al final de cada sección.
- Cinco pruebas nuevas cubren visibilidad inválida, falta de sesión, mascota ajena y publicación/ocultación por el dueño sin usar datos remotos.
- Se inspeccionaron el botón real de regreso, el lápiz y ojo junto a cuidados, el lápiz de vacuna y los espacios del carnet. Se abrió la edición de cuidado y vacuna sin guardar. Se confirmó que no hay iframe en el editor, que el QR es su última sección y que la alerta ofrece Ver ficha pública.
- Verificación final de esta distribución: 57 pruebas dirigidas aprobadas (pérdida/cartel/rutas/caché y cuidados/salud/visibilidad), lint, typecheck y build aprobados. La descarga de archivos sigue pendiente por el permiso rechazado anteriormente; no se reintentó.

## Verificación responsive y semántica de estados

Se corrigió la navbar que conservaba top de 76 px frente a una cabecera móvil de 64 px; ahora observa la altura real y no usa márgenes laterales negativos. El QR reserva margen y padding propios para separar texto y acciones.

| Ancho CSS real | Ancho del documento | Hueco cabecera/navbar fija | Texto QR al primer botón |
|---|---|---|---|
| 320 px | 320 px | 0 px | 45 px |
| 768 px | 768 px | 0 px | 45 px |
| 1024 px | 1024 px | 0 px | 45 px |

El escalado del navegador requería compensar el ancho solicitado; se verificaron las medidas CSS reales, no solo el parámetro del override. A 320 px también se revisaron Mis mascotas, edición de pérdida, carnet, QR público, ficha pública de pérdida y tablón: todos conservaron ancho de documento de 320 px. Se restableció el viewport después de revisar.

Las etiquetas compartidas de cuidado y dosis muestran iconos y tonos por estado, también en fichas públicas. Se confirmaron los estilos calculados de Precaución, Informativa, Vencida y Sin próxima fecha, con SVG presente. Contrastes texto/fondo: informativa 7.30:1, precaución 7.89:1, urgente/vencida 7.44:1, al día 7.68:1 y desconocido 5.92:1. Las fechas pendientes o vencidas adoptan su tono.

18 pruebas de salud/cuidados, lint, typecheck y build aprobados. Esta revisión no cambió registros remotos ni intentó descargas. La comprobación responsive de estos recorridos sustituye la limitación anterior del override de 320 px; no equivale por sí sola a conformidad WCAG completa.
