# Pawgram — plan técnico de fase 2

Estado: aprobado por el autor e implementado; ver 2026-11-02-pawgram-verificacion.md para evidencias y pendientes. Contrato funcional aprobado: PRODUCT.md, «Pawgram: contrato funcional aprobado». Los 11 criterios son obligatorios; este plan no cambia su alcance.

## Resultado y límites

Construir perfiles sociales voluntarios por mascota, publicaciones de una foto, patitas, consulta pública y moderación. No incluye demo, comentarios, mensajes, seguidores, reportes, OAuth real, despliegue, limpieza documental ni auditoría general de latencia. Mantener rescate y carnet independientes.

## Decisiones de arquitectura

1. Separar tablas de perfiles autorizados, publicaciones, patitas y roles administrativos. El perfil copia únicamente nombre/especie y los opcionales elegidos; nunca se publica la fila privada de mascotas. La edad guarda una referencia privada aprobada y devuelve solamente una edad calculada. No seguir automáticamente cambios de la ficha privada.
2. Separar visibilidad elegida por el tutor de restricción administrativa. La visibilidad efectiva exige perfil publicado, sin restricción de perfil ni de publicación. Las escrituras del tutor no pueden modificar columnas administrativas. Los roles se consultan en una tabla protegida del servidor, sin confiar en user_metadata ni permitir autoasignación.
3. Usar un bucket social privado separado del rescate. Copiar y reprocesar una foto existente solo tras consentimiento social; no compartir archivos físicos con rescate. La ruta pública de imagen verifica visibilidad en cada petición y devuelve bytes con Cache-Control privado/no-store y sin URL firmada expuesta. El acceso privado exige propiedad o rol administrativo. Evitar optimización de imagen que cree una copia pública cacheada.
4. Validar tamaño de entrada (10 MB), decodificación, formatos aceptados y límite de píxeles en servidor; convertir mediante un decodificador de servidor a WebP calidad 80 sin metadatos. La foto del post queda inmutable. Descripción accesible obligatoria de hasta 500 caracteres y texto opcional hasta 1.000; presentación hasta 300.
5. Resolver las patitas con clave única (post_id, account_id), operaciones idempotentes de dar/retirar y validación de visibilidad/propiedad en la base. Serializar respecto a ocultación para evitar una reacción nueva después de retirar contenido. Exponer conteo y reacción propia, nunca listas de identidades.
6. Consultar feed con cursor compuesto (created_at, id) descendente, tamaño acotado e índice correspondiente. La proyección pública solo incluye campos autorizados y conteos. No ordenar por patitas ni país.
7. Revocar visibilidad antes de limpiar archivos. Mantener una cola durable de limpieza con reintentos idempotentes para fallos parciales de Storage; no borrar la única referencia al archivo pendiente. Integrar eliminación de mascota/cuenta y conservar reservas anónimas del código QR. No usar privilegios administrativos para ampliar lectura pública.

## Rutas y módulos

- src/features/pawgram-profiles: snapshot autorizado, validación, vista previa, consentimiento, editor privado, publicar/ocultar/actualizar.
- src/features/pawgram-posts: procesamiento servidor, alta/edición de texto, confirmación de eliminación, acceso a imágenes y limpieza.
- src/features/pawgram-paws: contratos y acciones idempotentes, conteo y estado propio.
- src/features/pawgram-feed: consultas públicas, cursor, tarjetas, perfil público y detalle de publicación.
- src/features/pawgram-moderation: rol real, restricción/restauración con motivo y acceso privado al contenido restringido.
- src/app compone /pawgram, /pawgram/mascotas/[id], /pawgram/publicaciones/[id], /pawgram/imagenes/[id], /mascotas/[id]/pawgram y /pawgram/administracion; las rutas privadas requieren sesión y propiedad/rol.

Todas las páginas sociales llevan noindex y quedan fuera del sitemap. Los metadatos públicos se generan desde proyecciones autorizadas vigentes. El servicio de imágenes añade X-Robots-Tag y no-store; revisar también el service worker. Las rutas ocultas o retiradas no entregan títulos, fotos ni contenido anterior.

## Secuencia de implementación y commits

1. Verificar main integrado y crear feat/pawgram. Leer guías instaladas de Next.js sobre acciones, handlers, caché, metadatos y parámetros asíncronos. Aplicar TDD y las skills de Supabase y Postgres.
2. Comparar historial remoto completo con las siete migraciones locales existentes antes de aplicar cualquier migración nueva. Documentar diferencias; no aplicar pendientes a ciegas. Diseñar migraciones y pruebas SQL primero, ejecutar en base local aislada cuando esté disponible.
3. Perfiles: dominio y pruebas; tablas/RLS/contratos; editor con vista previa real de la versión a confirmar, controles individuales y consentimiento separado. Verificar que otra pestaña o edición concurrente no cambie el contenido después de la aprobación.
4. Publicaciones e imágenes: pruebas de archivos y revocación; carga servidor; compensación de uploads fallidos y limpieza durable; interfaz de publicación, edición y eliminación. Integrar limpieza con mascota/cuenta.
5. Patitas y feed: pruebas de concurrencia y paginación; operaciones SQL; consultas y rutas públicas; navegación e interacciones accesibles.
6. Moderación: pruebas de permisos; administración protegida; motivo privado para tutor y restauración que respeta ambas capas de restricción.
7. Verificación integral, capturas y PR. Commits cohesionados en español con Conventional Commits y skill git-commit; procurar <=400 líneas por commit, justificar excepciones por cohesión SQL. PR mediante gh y attach_artifact; no fusionar.

## Matriz de seguridad y aceptación

| Caso | Evidencia necesaria |
| --- | --- |
| C1: perfil nuevo y consentimiento | Sin fila pública por defecto; vista previa y consentimiento separados del QR; peticiones manipuladas rechazadas |
| C2: snapshot y edad | Mutar ficha privada no altera snapshot; revisar payload/HTML/metadatos para excluir contacto, nacimiento, salud e identidad |
| C3: roles de lectura/escritura | SQL y peticiones directas de visitante, propietario, otro tutor y administrador; propietario tampoco puede editar contenido ajeno |
| C4: fotos y límites | Archivos falsos, corruptos, >10 MB y exceso de píxeles; WebP resultante sin EXIF/GPS; alt obligatorio; foto inmutable |
| C5: patitas | Dos conexiones concurrentes y reintentos; máximo una fila; retiro idempotente; rechazo propio/oculto; sin identidades públicas |
| C6: feed | Fechas iguales, varias páginas, inserciones entre páginas; desempate estable, solo visibles, orden cronológico |
| C7: revocación | Repetir GET a HTML, metadatos y misma URL de imagen tras ocultar/restringir/eliminar; 404 sin contenido ni caché de PawPass |
| C8: limpieza | Eliminar post/mascota/cuenta; simular fallo de Storage y reintentar; sin huérfanos y archivos de rescate intactos |
| C9: moderación | Sin rol no hay acceso UI/RPC/tabla; tutor no altera restricción; restauración de perfil respeta post restringido y ocultación voluntaria |
| C10: SEO | noindex en todas las páginas sociales, ausencia de sitemap, robots permite leer directiva, metadatos solo autorizados |
| C11: accesibilidad | Automatización disponible y revisión manual de teclado, lector de pantalla, foco/errores, móvil y reflujo; documentar limitaciones reales |

Ejecutar npm run lint, npm run typecheck, npm test y npm run build. Complementar con pruebas SQL/RLS, concurrencia y peticiones de imágenes. No declarar completa la fase si no se verificaron los 11 criterios; registrar dependencias externas reales y comprobaciones manuales pendientes.

## Dependencias y alternativas

Hace falta un decodificador de imágenes en servidor (evaluar sharp ya instalado transitivamente y declararlo dependencia directa con versión fija), Supabase local o entorno de pruebas autorizado y capacidad de comprobar RLS/Storage. Si no está disponible un entorno aislado, mantener migraciones locales y declarar pruebas de integración pendientes; no sustituirlas por mocks ni usar datos reales para pruebas destructivas. El alta inicial de un administrador se hará por operación privilegiada documentada, sin usuario ni secretos incrustados.

## Revisión del plan

El contrato funcional está aprobado. El autor aprobó el presente plan y su método de ejecución en este chat. Método acordado: ejecución secuencial en este chat, sin subagentes ni worktree. La skill writing-plans referida por brainstorming no está instalada en las rutas disponibles; este documento deja el plan concreto para revisión sin inventar instrucciones de esa skill.
