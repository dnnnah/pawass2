# Producto PawPass V2

<!-- impeccable:product-schema 1 -->

## Plataforma

web

## Stack

Aplicación PWA modular con **React, Next.js App Router, TypeScript estricto y Tailwind CSS**. Supabase provee Auth, PostgreSQL y Storage. Inicio de sesión por correo y contraseña o Google OAuth. Elección confirmada por el autor.

## Usuarios

El usuario principal es el tutor de uno o más perros o gatos. Registra datos de cuidado y necesita que una persona que encuentre a su mascota pueda identificarla y contactarlo desde una placa QR. Una persona sin cuenta puede abrir la ficha de rescate o consultar el tablón de mascotas perdidas.

## Propósito del producto

Centralizar información privada de la mascota y acelerar su recuperación si se extravía. La ficha QR funciona desde que se crea la mascota; el tutor puede publicar una alerta inmediatamente y generar un cartel cuando haya foto y ubicación.

## Contexto de uso

La ficha QR se consulta en un navegador móvil sin instalar la PWA. La PWA puede instalarse, pero los datos requieren conexión. El cartel se comparte como imagen o se imprime en A4 o carta para colocarlo en la calle.

## Capacidades y límites

La primera versión incluye cuenta, mascotas, alertas de cuidado, QR, pérdidas, tablón, carnet privado y cartel. Por petición del autor, el carnet privado se implementa en la fase 4 y el cartel pasa a la fase 5; luego se cierra la primera versión con accesibilidad, SEO y PWA. La comunidad de mascotas públicas, **Pawgram**, se desarrollará después y será voluntaria. **Pawshot** y **Pawsnap** son nombres candidatos, aún sin elegir, para la función de subir una foto nueva o reciente. No hay adopciones, refugios, chat, pagos, rastreo en tiempo real ni carnet imprimible.

La aplicación está abierta a tutores de cualquier país y no los divide por país. El contenido inicial de los catálogos de salud se enfoca en México; los números de contacto aceptan ladas internacionales. Los documentos y el historial clínico completo son privados. Las rutas públicas reciben solo información autorizada.

## Compromisos de marca

El nombre confirmado es PawPass. El idioma inicial es español. La dirección visual aprobada conserva la referencia azul mineral con fondo blanco, superficies pastel alternas y detalles azules, violetas, cian y cobalto, texto azul oscuro y fotografías protagonistas completas, sin recorte. Nunito Sans Variable se autoaloja mediante npm. La personalidad combina 75% profesional y 25% juguetón, con mensajes cálidos personalizados y figuras visibles de huella, estrella, collar, perro, gato y corazón. El logo coloca la huellita después de “pawpass”. Azul identifica las acciones habituales, incluido WhatsApp aun durante una pérdida; rojo se reserva para pérdidas, emergencias y alertas críticas. La jerarquía de acciones es sólido, contorno y texto; no se usan verde ni amarillo como colores propios de interfaz. El botón de Google conserva su marca oficial multicolor autoalojada como excepción de identidad externa. Un único pie global comparte la marca, las figuras decorativas y un mensaje cálido en toda la aplicación. La navegación principal usa menú hamburguesa en todas las anchuras.

## Evidencia disponible

La fuente de verdad funcional del MVP es [PAWPASS-V2-SPEC.md](PAWPASS-V2-SPEC.md), aprobada por bloques por el autor. La especificación funcional y de seguridad de Pawgram aprobada el 2 de noviembre de 2026 se mantiene en este documento; concreta las decisiones sociales pendientes de aquella especificación. PawPass anterior sirve como antecedente de problemas de alcance y arquitectura; sus decisiones visuales y técnicas no son autoridad para V2. No se han aportado métricas de uso, testimonios ni activos visuales aprobados para V2.

## Principios de producto

1. Hacer posible el contacto de rescate con rapidez desde el QR.
2. Mantener privado el expediente y publicar solo los datos autorizados.
3. Permitir registrar una mascota y activar una alerta con pocos datos, completándolos después.
4. Resolver los flujos principales antes de ampliar el producto con funciones sociales.
5. Diseñar y verificar accesibilidad WCAG 2.2 AA y SEO desde la primera versión, sin exponer datos privados en páginas indexables.

## Fase 3 aprobada

La fase 3 implementa el modo mascota perdida, el QR con estado de pérdida, el tablón público `/perdidas`, el flujo de recuperación y el aviso “Ya está en casa” durante 30 días. El cartel de búsqueda no forma parte de esta fase.

La experiencia mantiene azul mineral para tareas habituales, neutros para estados informativos y rojo solo para pérdida, emergencia y alertas críticas. La jerarquía de acciones es sólido, contorno y texto. La huella va después de “pawpass”; “Mi cuenta” es independiente del panel “Mis mascotas”. El alta aparece por elección y tiene tres pasos, con nombre, especie y consentimiento público en el primero; los detalles y contactos son opcionales y aplazables. Llamadas y WhatsApp comparten número por defecto.

Los flujos de eliminación de mascota y cuenta requieren dos confirmaciones, limpian datos y archivos asociados y preservan la reserva anónima del código público. El acceso rápido a la cuenta de prueba existe únicamente en desarrollo local, sin credenciales públicas ni secretos cliente.

El acceso y el cambio de contraseña permiten revelar el texto con un control de mostrar/ocultar. Durante el registro, el tutor repite su contraseña y el formulario detecta discrepancias antes de enviar.

## Orden histórico del MVP

1. Fases 1 y 2: cuenta/mascotas y alertas de cuidado.
2. Fase 3: mascota perdida, tablón y recuperación.
3. Fase 4: carnet de salud privado por mascota, incluidos registros de vacunación y desparasitación, cirugías/intervenciones y documentos privados clasificados.
4. Fase 5: cartel de búsqueda.
5. Cierre de primera versión: accesibilidad WCAG 2.2 AA, SEO y PWA.
6. Después de primera versión: Pawgram.


## Ruta posterior al MVP

El MVP de rescate, carnet y cartel está implementado; los PR #9, #10 y #11 están fusionados en main. La nueva ruta usa su propia numeración:

1. Definir Pawgram: cerrar el contrato funcional y de seguridad en este documento.
2. Construir Pawgram conforme al contrato aprobado, en un chat independiente.
3. Preparar cinco mascotas de ejemplo completas en una demo pública de solo lectura, con una perdida; mantener la cuenta de prueba actual solo en desarrollo local.
4. Revisar calidad, seguridad y rendimiento.
5. Limpiar documentación y actualizar README, conservando README.md, PRODUCT.md y DESIGN.md como documentación objetivo.
6. Configurar Google OAuth real y desplegar.

Esta fase de definición no crea tablas, migraciones, interfaz, demo ni despliegue. No elimina documentos existentes ni AGENTS.md.

## Pawgram: contrato funcional aprobado

### Objetivo y alcance

Pawgram permite compartir voluntariamente la identidad y las fotos de cada mascota y recibir «patitas». Cada mascota tiene su propio perfil; el tutor administra desde su cuenta privada y no tiene un perfil público personal. La consulta es pública sin iniciar sesión. Publicar y dar patitas requiere una cuenta autenticada.

La publicación social es independiente del estado del QR de rescate y no modifica sus permisos. No hay comentarios, mensajes, videos, seguidores, reportes ni solicitudes de revisión en esta entrega. La aplicación y el feed no se dividen por países. La acción se llama «Publicar foto»; Pawshot y Pawsnap siguen sin elegirse.

### Perfil y autorización de datos

- Toda mascota empieza sin publicar en Pawgram. El tutor revisa una vista previa y acepta expresamente la publicación antes de activar el perfil.
- Nombre y especie forman la identidad base del perfil publicado. Foto, presentación, raza, sexo, talla y edad son opcionales, con controles individuales de publicación. La presentación admite hasta 300 caracteres.
- No se publica ubicación, cuidados, teléfono, WhatsApp, identidad del tutor, microchip, RUAC, documentos ni expediente clínico. Los permisos del QR no autorizan estos datos para Pawgram.
- Pawgram conserva una versión autorizada de los datos: modificar la ficha privada no actualiza automáticamente el perfil. El tutor debe revisar y confirmar la actualización social.
- La edad avanza desde el dato aprobado, sin revelar la fecha de nacimiento ni su dato de cálculo en respuestas públicas.
- Ninguna fotografía de rescate pasa automáticamente a Pawgram. Usar una foto existente requiere autorización social explícita; su retirada social no debe eliminar un archivo todavía necesario para rescate.
- Las respuestas públicas, imágenes y vistas previas contienen exclusivamente datos sociales autorizados; no se entrega el registro privado completo para ocultar campos en el navegador.

### Publicaciones y fotografías

- Cada publicación pertenece a una mascota y contiene exactamente una fotografía, un texto opcional de hasta 1.000 caracteres y una descripción accesible obligatoria de hasta 500 caracteres.
- La fotografía de entrada admite hasta 10 MB. Antes de almacenarla se convierte a WebP con calidad objetivo del 80 % y se eliminan metadatos, incluida la ubicación. La validación de servidor comprueba el archivo y sus límites; no basta la conversión del cliente.
- El tutor puede editar el texto y la descripción accesible. La foto queda fija después de publicar: sustituirla requiere eliminar la publicación y crear otra, sin trasladar patitas.
- Publicar requiere un perfil social activo; un perfil oculto conserva el contenido para su gestión privada. El tutor puede editar o eliminar su propio contenido, pero no el ajeno.
- Las fotografías se muestran completas, respetando su proporción y el sistema visual existente.

### Dar una patita

- Una cuenta autenticada puede dar una patita por publicación ajena y retirarla después. No puede reaccionar a publicaciones de sus propias mascotas.
- La unicidad se garantiza también ante solicitudes simultáneas y reintentos; el conteo nunca se duplica por repetir una petición.
- El conteo es público. La lista de cuentas que reaccionaron y sus identificadores no se expone públicamente. La cuenta autenticada solo necesita conocer su propia reacción.
- No se permiten nuevas reacciones sobre contenido oculto o eliminado. Ocultar conserva las patitas; eliminar la publicación las borra.

### Consulta, feed, SEO y privacidad

- `/pawgram` reúne una presentación breve y el feed común de publicaciones visibles, ordenadas de la más reciente a la más antigua. Las patitas no influyen en el orden; no hay recomendaciones personalizadas.
- Cada perfil muestra sus publicaciones en el mismo orden cronológico. La paginación debe mantener un desempate estable entre publicaciones con igual fecha.
- Feed, perfiles y publicaciones son públicos mediante navegación o enlaces, pero llevan `noindex` y quedan fuera del sitemap. Los rastreadores deben poder leer esa directiva.
- Los metadatos de `/pawgram` son generales. Los de perfiles, publicaciones y vistas previas para compartir usan solo contenido autorizado y respetan la retirada o eliminación.
- `noindex` no restringe el acceso ni impide copias externas. La publicación explica brevemente que fotos y textos pueden revelar datos personales y que el contenido público puede copiarse fuera de PawPass.

### Ocultación, administración y eliminación

- Ocultar el perfil retira inmediatamente el perfil y todas sus publicaciones del feed, rutas públicas y acceso a imágenes sociales. Conserva contenido y patitas para el tutor; republicarlo restaura el contenido que no tenga una restricción administrativa.
- Eliminar una publicación requiere confirmación y borra su foto social y sus patitas. La limpieza respeta archivos que tengan otro uso autorizado y evita huérfanos.
- Eliminar mascota o cuenta incluye todos sus registros y archivos sociales mediante la doble confirmación existente. La reserva anónima del código de rescate se conserva sin información identificable.
- Un administrador autorizado puede ocultar y restaurar perfiles o publicaciones, registrando un motivo visible para el tutor. La autorización administrativa se verifica en servidor y en la capa de datos; no depende de un control de interfaz.
- El tutor conserva acceso privado al contenido ocultado administrativamente, puede eliminarlo y ve el motivo. No puede levantar la restricción editando, ocultando o republicando ese contenido; solo un administrador puede restaurarlo.
- La restricción de un perfil prevalece sobre sus publicaciones. Restaurar un perfil no restaura publicaciones restringidas individualmente ni publica un perfil que el tutor mantenga oculto.
- No se construyen denuncias, ocultación automática por cantidad de reportes ni solicitudes de revisión. La detección de abuso depende de la revisión administrativa.
- Retirar contenido revoca también su acceso por enlaces directos a imágenes y evita que cachés de PawPass sigan sirviéndolo. No se promete retirar copias, capturas o cachés externas.

### Mapa vertical de capacidades

| Módulo | Responsabilidad | Dependencias |
| --- | --- | --- |
| `pawgram-profiles` | Perfil, versión autorizada, publicación y retirada | Cuenta y mascota existentes |
| `pawgram-posts` | Foto, texto, descripción accesible y limpieza de publicaciones | `pawgram-profiles` |
| `pawgram-paws` | Dar y retirar patitas, unicidad y conteos | `pawgram-posts` y cuenta existente |
| `pawgram-feed` | Feed y consulta pública con proyección de datos autorizados | `pawgram-profiles`, `pawgram-posts` |
| `pawgram-moderation` | Ocultación y restauración administrativa con motivo | `pawgram-profiles`, `pawgram-posts` |

Orden previsto: perfiles → publicaciones → patitas y feed → control administrativo → verificación integral antes de considerar terminada la fase 2. Los contratos de visibilidad deben considerar las restricciones administrativas desde el inicio.

Cada módulo agrupa componentes, acciones, dominio, contratos y pruebas bajo `src/features/<modulo>`. `src/app` compone rutas. Privacidad, accesibilidad, SEO y limpieza se verifican en todos los módulos; no se duplican como capas de lógica específica global. Las migraciones y el detalle del almacenamiento se diseñan en fase 2, comparando primero el historial remoto con todas las migraciones locales pendientes.

### Criterios de aceptación y verificación de fase 2

1. Una mascota nueva no aparece en Pawgram; activarla exige vista previa y consentimiento propio, independientemente del QR.
2. Solo se reciben campos sociales autorizados. Cambiar datos privados no cambia el perfil hasta confirmarlo, y la fecha de nacimiento no se entrega al público.
3. Un visitante sin cuenta puede consultar contenido publicado, pero no publicar ni reaccionar. Otra cuenta no puede editar contenido ajeno, incluso mediante peticiones directas.
4. Cada publicación cumple los límites, tiene una sola foto sin metadatos de ubicación y una descripción accesible; el servidor rechaza archivos inválidos. Cambiar la foto requiere otra publicación.
5. Reintentos y concurrencia producen como máximo una patita por cuenta y publicación. Se puede retirar; se rechazan patitas propias y sobre contenido no visible. Las identidades de quienes reaccionan permanecen privadas.
6. El feed y los perfiles muestran solo contenido visible en orden cronológico estable, sin priorizar patitas ni países.
7. Ocultar o eliminar retira contenido de las rutas, feed, metadatos e imágenes públicas. Republicar no evade restricciones administrativas.
8. Eliminar publicaciones, mascotas o cuentas limpia registros y archivos sociales sin huérfanos ni daños a archivos de rescate todavía necesarios.
9. Solo un administrador autorizado puede ocultar o restaurar contenido; el tutor ve el motivo y no puede levantar la restricción.
10. Todas las rutas de Pawgram llevan `noindex`, quedan fuera del sitemap y no filtran información privada en HTML, respuestas, metadatos o vistas previas.
11. Los flujos cumplen el objetivo WCAG 2.2 AA, con revisión automática y comprobación manual de teclado, lector de pantalla, móvil, foco, errores y reflujo.

En fase 2 se usarán pruebas de dominio para límites y estados, pruebas de autorización/RLS para propietario, visitante y administrador, y pruebas de concurrencia para patitas. Se verificará también el acceso directo a archivos después de retirar contenido. Comandos existentes: `npm run lint`, `npm run typecheck`, `npm test` y `npm run build`; las pruebas SQL y la revisión manual complementan esas comprobaciones.

### Riesgos y límites operativos

El contenido público puede copiarse fuera del producto; `noindex` no es una medida de confidencialidad. Fotos y textos pueden revelar datos personales aunque se eliminen los metadatos. Sin reportes, la detección de abuso depende de revisión administrativa. Revocar imágenes exige diseñar el almacenamiento y las cachés para no conservar acceso público residual. La implementación debe mantener separados los permisos sociales y de rescate y evitar usar permisos administrativos para servir datos públicos.

Siempre se validan sesión, propiedad, autorización de campos y archivos en servidor y capa de datos. Nunca se publican secretos, expediente privado o contactos por herencia del QR. Cambios al alcance aprobado requieren revisión del autor. El plan de implementación de fase 2 se preparará en su propio chat a partir de este contrato; esta definición no autoriza adelantar demo, limpieza documental, OAuth ni despliegue.
