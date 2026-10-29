# Fase 4 — Carnet de salud privado

## Objetivo y límites

Dar al tutor un expediente privado y editable por mascota, accesible desde la ficha y desde Mis mascotas. Incluye vacunas, desparasitaciones, cirugías/intervenciones y documentos clasificados. No añade cartel de búsqueda ni Pawgram.

El objetivo es que el tutor encuentre y actualice el historial con facilidad, entienda cuándo hay una dosis próxima o vencida y pueda abrir sus documentos sin convertirlos en enlaces públicos. La ficha QR y `/perdidas` conservan únicamente sus contratos públicos existentes.

## Alcance funcional

- Página privada por mascota en `/mascotas/[id]/carnet`; requiere sesión y valida que la mascota pertenezca al tutor. El área lleva `noindex` y no incorpora datos de salud en metadatos, sitemap ni vistas previas.
- Enlaces visibles y con nombre de mascota desde la ficha privada/editor y desde la tarjeta o lista de Mis mascotas.
- Alta, edición y eliminación por el tutor de vacunas, desparasitaciones, cirugías e intervenciones. Vacunas y desparasitaciones se clasifican desde catálogos por especie (`perro`/`gato`) con una opción “Otra”; el contenido inicial se enfoca en México y se versiona en el módulo de dominio. “Otra” requiere nombre libre.
- Una aplicación de vacuna/desparasitación guarda tipo/catálogo, fecha aplicada, próxima dosis confirmada opcional, lote, veterinario y notas pertinentes. Una sugerencia de próxima fecha puede presentarse como sugerencia, pero no se persiste como confirmada hasta que el tutor la revise y la acepte o la edite. Se puede guardar sin próxima fecha. La primera referencia de catálogo es un refuerzo anual antirrábico; avisa que el esquema inicial requiere valoración y enlaza a [la referencia oficial mexicana](https://www.gob.mx/salud/cenaprece/documentos/cartel-prevencion-de-la-rabia). Los tratamientos y otros biológicos no reciben periodicidad automática.
- Estados: sin información cuando no hay registro; sin próxima fecha cuando hay registro sin fecha futura; vencida cuando la próxima fecha es anterior a hoy; próxima a vencer cuando cae entre hoy y los siguientes 30 días inclusive; al día cuando es posterior a ese umbral. No se infiere caducidad a partir del tipo de vacuna, periodicidad estándar o fecha aplicada. El cálculo usa fecha local de calendario y se prueba en límites.
- Cirugías/intervenciones guardan nombre, fecha y notas opcionales.
- Documentos con clasificación (cartilla, certificado, microchip, receta, estudio, identificación u otra), archivo permitido, fecha y notas opcionales. El metadato guarda una ruta interna estable, nunca una URL pública. Descarga/visualización requiere sesión y autorización del propietario y se sirve mediante una ruta autenticada de la aplicación, sin URL firmada.
- Bucket privado dedicado para documentos. RLS en filas y `storage.objects` comprueba que el primer segmento del objeto corresponde al propietario y que el documento está asociado a una mascota propia. Operaciones de borrado usan Storage API para no dejar objetos huérfanos.
- Todo historial y documento es privado: sin proyección RPC, QR, ficha de pérdida, tablón, Open Graph ni datos estructurados públicos.

## Arquitectura

- Módulo vertical `src/features/health-record`: dominio, catálogos, estado de dosis, acciones de servidor, controles de carga y componentes de lectura/edición.
- `src/app/mascotas/[id]/carnet/page.tsx` compone el módulo, obtiene sesión, confirma propiedad y entrega datos al cliente mínimo necesario.
- PostgreSQL mantiene registros de salud y metadatos de documentos relacionados a `pets` con FK `ON DELETE CASCADE`, restricciones, índices por mascota/fecha, grants explícitos y RLS para propietario.
- Supabase Storage conserva los documentos en bucket privado separado de las fotos. Las políticas no usan `user_metadata` como autorización ni dependen solo del rol `authenticated`.
- Las mutaciones validan los formularios en servidor, comprueban la sesión y usan RLS como control final. No se introduce service-role en cliente.

## Datos y migraciones

- Usar una tabla privada `pet_health_records` para dosis y procedimientos con `record_type` y constraints condicionales; separar metadatos y archivos en `pet_health_documents`.
- La fecha de aplicación es obligatoria en una dosis registrada. La próxima fecha es nullable y significa exactamente “sin próxima fecha” cuando falta.
- Documento: ID, mascota, propietario derivable vía mascota, categoría, `storage_path`, nombre original saneado, MIME permitido, tamaño, fecha opcional y notas. No guardar URL firmada ni pública.
- Eliminar mascota conserva el comportamiento ya acordado de borrar registros asociados y objetos por Storage API, manteniendo reserva anónima del código QR.
- Al iniciar la fase, el historial remoto del proyecto `nmjciiywuyldhkrzsxks` tenía tres migraciones aplicadas (`20261029013521`, `20261029013635`, `20261029014935`); las de alertas (`20261029020748`) y pérdida (`20261029025135`) aún no aparecían ni estaban sus tablas. La implementación conserva esa secuencia aditiva antes de aplicar fase 4; no reinicia ni borra datos.

## UI, accesibilidad y estilo

- Modo Operate: una vista de carnet escaneable en móvil con resumen textual de estado, bloques por categoría y acciones de agregar/editar/borrar fáciles de encontrar; formulario de registro comprensible y por secciones; estados vacíos específicos y confirmación antes de borrar.
- Continuar sistema aprobado: azul mineral y neutros; rojo únicamente para aviso crítico o dosis vencida como alerta de salud; nunca verde o amarillo; botones sólido/contorno/texto; huellita después de “pawpass”.
- Mantener Nunito Sans, fotos sin recorte y jerarquía, foco, superficies y espaciado del rediseño aprobado.
- WCAG 2.2 AA: etiquetas persistentes, errores asociados, anuncios de resultado, navegación por teclado, foco visible, controles táctiles, contraste AA, no depender solo del color, fechas localizadas legibles, reflujo móvil y movimiento reducido.
- No se crea vista PDF ni imprimible del carnet.

## Criterios de aceptación

1. Un tutor autenticado abre el carnet desde la ficha o tarjeta de una mascota propia. Un usuario anónimo se redirige a autenticación; otro tutor recibe not-found/denegación equivalente, sin revelar existencia del expediente.
2. Se pueden registrar, editar y borrar vacunas, desparasitaciones y cirugías/intervenciones; los catálogos dependen de especie, incluyen “Otra” y tienen contenido inicial mexicano.
3. Las fechas sugeridas requieren confirmación visible antes de persistir; se permite no indicar próxima fecha.
4. Las cinco condiciones de estado se calculan correctamente, incluido el umbral de 30 días; no tener registro ni fecha no genera estado vencido.
5. El propietario puede cargar, clasificar, abrir/descargar y eliminar documentos; URL pública anónima no sirve el archivo y un segundo usuario no puede leerlo ni modificarlo.
6. QR, fichas públicas de pérdida y tablón nunca reciben historial, documentos, rutas de Storage ni URLs firmadas.
7. Las políticas SQL limitan acceso por propietario y los tests cubren lectura/escritura/borrado entre dos tutores y acceso anónimo.
8. La ruta privada mantiene `noindex`; typecheck, lint, pruebas, build y verificación visual móvil/escritorio terminan correctamente.
9. La navegación por teclado, foco y lector de pantalla de las tareas principales se verifica manualmente y las vistas siguen el sistema aprobado.

## Plan de implementación propuesto

1. Conciliar el estado de Supabase remoto/local y el orden de las migraciones pendientes de fases 2/3, sin tocar datos. Probar esquema completo en Supabase local o una rama de desarrollo aprobada.
2. Escribir primero pruebas unitarias para reglas de estado, catálogo por especie, normalización y límites de fecha; comprobar RED antes de implementar dominio.
3. Implementar migración aditiva de registros y bucket/Storage RLS, junto con pruebas SQL de aislamiento entre propietarios.
4. Crear acciones autenticadas de alta/edición/eliminación/carga/descarga y el dominio del módulo `health-record`.
5. Construir carnet móvil, formularios accesibles y accesos desde ficha y lista de mascotas.
6. Ejecutar pruebas de extremo a extremo con usuario seed local y verificar no exposición en QR/tablón; ejecutar suite, typecheck, lint y build.
7. Inspeccionar la UI en móvil y escritorio, corregir un pase de defectos, correr detector Impeccable y pruebas manuales de teclado/lector de pantalla.
8. Crear commits pequeños en español y PR detallado mediante `gh`; no fusionar.

## Configuración de comandos

- Pruebas: `npm test`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`
- Supabase: usar CLI/MCP existente. No usar `db reset` contra proyecto remoto.

## Límites

- Siempre: validar en servidor, comprobar propiedad, bucket privado, descarga mediante ruta autenticada, metadata noindex y aislamiento público/privado.
- Nunca: publicar documentos, exponer URLs públicas/firmadas, inferir fecha de caducidad, inferir estado veterinario, introducir credenciales seed en cliente, usar service-role para resolver permisos, tocar/limpiar datos de terceros.
- Fuera de alcance: cartel, Pawgram, carnet imprimible/PDF, recomendación veterinaria automatizada, sincronización offline y migración de archivos existentes que no sean documentos del carnet.

## Decisiones cerradas durante la implementación

- Documentos: PDF, JPEG, PNG y WebP, hasta 10 MiB por archivo. Se validan MIME y firma de bytes.
- Al eliminar un documento o mascota se quita el archivo mediante Storage API antes de borrar sus metadatos; no se ejecutan borrados directos en `storage.objects`.
- Los estados usan la fecha de calendario local del navegador para evitar asumir una zona horaria del servidor.
- El usuario seed se reserva para Supabase local. El proyecto remoto contiene datos y no se usa como sandbox.
- La acción de subida admite solicitudes de 12 MB para transportar archivos de hasta 10 MiB y el multipart.
