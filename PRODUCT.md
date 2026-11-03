# Producto PawPass V2

## Propósito y usuarios

PawPass ayuda a tutores de perros y gatos a reunir información de cuidado y acelerar el reencuentro si una mascota se extravía. Desde una placa QR, cualquier persona puede identificarla y contactar al tutor sin instalar la aplicación ni crear una cuenta. El tutor mantiene privado el expediente clínico y decide expresamente qué información de cuidado puede aparecer en el QR.

La aplicación se ofrece en español a tutores de cualquier país; los catálogos iniciales de salud se enfocan en México y los teléfonos aceptan ladas internacionales. PawPass V2 es un producto nuevo: PawPass V1 sirve como antecedente de errores que conviene evitar, no como contrato funcional o técnico.

## Plataforma y principios

La aplicación es una PWA construida con React, Next.js App Router, TypeScript estricto y Tailwind CSS. Supabase aporta Auth, PostgreSQL y Storage. Una sola aplicación sirve páginas públicas y privadas y operaciones de servidor. El código se organiza por Módulos Verticales: cada capacidad reúne componentes, acciones, dominio, contratos y pruebas en `src/features/<modulo>`; `src/app` compone rutas. La lógica compartida se reserva para necesidades transversales.

Principios de producto:

1. Hacer rápido el contacto desde un QR, sin pedir ubicación al dispositivo que lo escanea.
2. Mantener privado el expediente y devolver a páginas públicas solo proyecciones de datos autorizados.
3. Permitir el alta y una alerta de pérdida con pocos datos obligatorios; completar los detalles después.
4. Tratar el consentimiento de rescate y el consentimiento social como decisiones separadas.
5. Diseñar accesibilidad WCAG 2.2 AA, privacidad y SEO junto con cada capacidad.

## Primera versión

La primera versión reúne cuenta, mascotas, alertas de cuidado, ficha de rescate QR, pérdida y recuperación, tablón público, carnet privado, cartel de búsqueda y cierre de accesibilidad, SEO y PWA. Estas capacidades están implementadas en el `main` integrado a la fecha de esta consolidación. La demo pública es un catálogo estático de solo lectura, separado de datos y acciones reales.

### Cuenta, contactos y alta

- Acceso con correo y contraseña; la interfaz también ofrece Google, cuya configuración OAuth real queda pendiente de la fase 6. La producción requiere correo transaccional para confirmación y recuperación.
- El perfil requiere nombre; apellidos son opcionales. Teléfono de llamadas y WhatsApp heredan un mismo número. Solo se separan si el tutor elige explícitamente otra línea. Se guardan con lada internacional y se aceptan países distintos de México.
- El registro pide confirmar la contraseña y valida antes de enviar: de 8 a 72 caracteres, una mayúscula, un número y un carácter especial. Los campos permiten mostrar u ocultar el valor con controles accesibles.
- El alta de una mascota se abre después de elegir «Agregar» y tiene tres pasos: (1) nombre, especie y consentimiento explícito para publicar los datos del QR; (2) raza/mezcla, sexo, talla, color y edad exacta o aproximada opcionales; (3) peso, microchip, RUAC, esterilización, foto y contactos distintos opcionales. Los pasos 2 y 3 pueden aplazarse.
- Cada mascota recibe un código corto `PC-XXXXXX`, único e inmutable. Al borrar una mascota se retira su ficha y se reserva el código sin datos identificables ni archivos.
- La cuenta de prueba y el acceso rápido existen solo en Supabase local de desarrollo. No hay credenciales de prueba en cliente ni en producción; la cuenta es temporal y eliminable.
- Borrar una mascota o cuenta requiere dos confirmaciones, verifica sesión y propiedad y limpia registros y archivos asociados. La reserva anónima del código permanece.

### QR y alertas de cuidado

`/p/<código>` muestra nombre, especie, foto actual si existe, botones de WhatsApp y llamada, y únicamente alertas e instrucciones que el tutor autorizó para el QR. Si el tutor registró RUAC, se indica que aportó una clave, sin mostrarla ni afirmar verificación oficial. No muestra identidad del tutor, RUAC completo, expediente ni documentos. Los contactos efectivos son la excepción elegida por mascota o los datos actuales de la cuenta. Las fotos de mascota se convierten a WebP con calidad objetivo 80 antes de almacenarse.

El tutor registra alertas de alergias, condiciones, medicación, cuidados o temperamento; los catálogos sugieren gravedad, pero el tutor puede cambiarla. Solo se publica una alerta cuando se activa expresamente su visibilidad QR. La aplicación no solicita ni incorpora la ubicación del visitante.

### Pérdida y recuperación

- Una alerta se puede publicar de inmediato con la información disponible. Se informa qué datos serán públicos y que una alerta activa puede aparecer en buscadores.
- `/perdidas` lista solo alertas activas. La ficha de pérdida pública usa identidad, contactos efectivos, alertas ya autorizadas y detalles del extravío. Si falta la última ubicación, muestra «Ubicación pendiente»; nunca sustituye ese dato con la ciudad habitual del tutor.
- Se pueden editar foto reciente, fecha y hora aproximadas, zona escrita, señas, mensaje, instrucciones y recompensa informativa. La recompensa acepta solo dígitos. No se pide una coordenada precisa ni se divide el producto por país.
- Solo puede existir un episodio activo por mascota; se conserva historial privado. Recuperar requiere confirmación explícita y retira la alerta del tablón. El QR muestra «Ya está en casa» durante 30 días, luego vuelve a la ficha habitual.
- El QR físico conserva `/p/<código>`; durante la pérdida señala el detalle vigente. El QR habitual y las fichas QR llevan `noindex`; el tablón y la ficha de pérdida activa pueden indexarse. La ficha recuperada deja de indexarse y del sitemap. Los buscadores pueden tardar en reflejar cambios.

### Carnet privado

Cada mascota tiene un carnet autenticado con vacunas, desparasitaciones, cirugías/intervenciones y documentos clasificados. Los registros de dosis pueden guardar fecha aplicada, próxima fecha confirmada, lote, veterinario y notas. Los catálogos por especie se enfocan en México. Una fecha de próxima dosis sugerida requiere revisión y confirmación; no se infiere caducidad ni recomendación veterinaria. La falta de registro o de próxima fecha no significa que algo esté vencido. El aviso «próxima a vencer» cubre los 30 días anteriores a la fecha confirmada.

El carnet y sus metadatos no aparecen en QR, tablón, metadatos públicos ni vistas previas. Los documentos van a un bucket privado; la aplicación valida sesión, propiedad, tipo, tamaño y archivo en servidor, y sirve la descarga por ruta autenticada. No se guardan URL públicas ni firmadas.

### Cartel de búsqueda

Con una alerta activa, al menos una foto y la última zona vista, el tutor puede generar PNG 1080×1920 (9:16) y 1440×1800 (4:5), y formatos de impresión A4 (1275×1800) y carta (1275×1650). El cartel muestra foto, QR, teléfono de llamadas, ubicación textual, señas y hasta dos alertas de cuidado autorizadas; antes de compartirlo o descargarlo, avisa que el teléfono será visible fuera de PawPass. La foto reciente tiene prioridad; si no existe, se usa la foto principal. El número de llamadas hereda el de la cuenta salvo elección explícita de otro. El cartel describe su contenido también en texto; no hay carnet imprimible ni PDF clínico.

### Demo de solo lectura

`/demo` y sus fichas muestran cinco mascotas sintéticas —dos perros y tres gatos—, una con un caso de pérdida ficticio. El catálogo vive en código, no en Supabase; no usa Auth, Storage ni acciones de rescate reales. Las fotos autorizadas se procesan sin metadatos identificables y usan nombres neutros. Cada dato de salud/documento se marca como ejemplo simulado y sin valor clínico. La pérdida no activa llamadas, mensajes, búsquedas ni cambios de estado. Las rutas llevan `noindex`, `nofollow` y `noarchive`, y no entran al sitemap. La demo es pública; `noindex` no impide que alguien copie las imágenes.

## Pawgram — etapa social aprobada e implementada

Pawgram es el espacio social voluntario por mascota. Consultar perfiles y publicaciones es público; publicar y dar «patitas» requiere cuenta. La publicación es independiente del QR de rescate. El tutor no tiene un perfil público personal. La acción de publicación se llama «Publicar foto»; Pawshot y Pawsnap siguen siendo nombres candidatos para una función futura de foto reciente.

### Perfiles y consentimiento

- Una mascota empieza sin perfil publicado. El tutor revisa una vista previa y autoriza Pawgram expresamente; el permiso del QR no cuenta como consentimiento social.
- Nombre y especie identifican el perfil. Foto, presentación (hasta 300 caracteres), raza, sexo, talla y edad son opcionales y tienen controles individuales.
- Pawgram guarda una copia autorizada; editar la ficha privada no la actualiza. El tutor debe revisar y confirmar la actualización. La edad pública se calcula sin revelar fecha de nacimiento ni referencia de cálculo.
- No se publican identidad del tutor, teléfono, WhatsApp, ubicación, cuidados, microchip, RUAC, documentos ni historial. Una foto de rescate solo se copia a un archivo social separado tras permiso explícito.

### Publicaciones y patitas

- Cada publicación de una mascota tiene exactamente una foto, texto opcional de hasta 1.000 caracteres y descripción accesible obligatoria de hasta 500 caracteres. Entrada de imagen de hasta 10 MB; servidor valida el archivo, limita píxeles, convierte a WebP calidad objetivo 80 y elimina metadatos. La foto no se sustituye: para cambiarla se elimina la publicación y se crea otra.
- Una persona autenticada da o retira como máximo una patita por publicación ajena; no reacciona a sus propias mascotas. La base garantiza unicidad e idempotencia ante concurrencia y reintentos. El conteo es público; no lo son las identidades. Ocultar conserva patitas; eliminar publicación las quita.
- El feed `/pawgram` y los perfiles se ordenan cronológicamente con paginación estable. Las patitas no afectan el orden y no hay personalización por país.

### Privacidad, moderación y retirada

- Feed, perfiles y publicaciones son consultables pero llevan `noindex` y se excluyen del sitemap. Metadatos e imágenes solo usan contenido autorizado. `noindex` no limita el acceso ni elimina copias externas.
- Ocultar un perfil retira al instante sus publicaciones y fotos de páginas, feed e imágenes; conserva contenido para el tutor. Restaurar respeta la visibilidad elegida por el tutor y restricciones individuales.
- Moderadores autorizados pueden restringir/restaurar perfil o publicación y deben registrar el motivo. El tutor puede leer y eliminar su contenido restringido, pero no levantar la restricción. No hay reportes de usuario, ocultación por conteo ni solicitudes de revisión en este alcance.
- Al eliminar contenido, mascota o cuenta, los archivos sociales se limpian sin borrar una foto de rescate todavía autorizada. La retirada revoca rutas de PawPass y cachés controladas por PawPass, pero no promete borrar copias externas.

## Límites explícitos

No hay rastreo GPS en tiempo real, uso de geolocalización del visitante, edición offline/sincronización diferida, chat, comentarios, mensajes, videos, seguidores, pagos, adopciones, refugios, transferencia de titularidad, carnet imprimible ni exportación PDF del historial. La PWA se instala y ofrece una pantalla sin conexión; consultar o cambiar datos exige conexión.

## Calidad y exposición pública

WCAG 2.2 AA es el objetivo para flujos de cuenta, mascotas, rescate, pérdida, carnet, cartel y Pawgram: teclado, foco visible, etiquetas y errores asociados, estados textuales, contraste, reflujo, movimiento reducido y uso con lector de pantalla. El color no es el único indicador. Toda ruta privada, documento y carnet lleva `noindex`; la política de indexación pública se expresa en metadata accesible a rastreadores, no mediante un bloqueo que impida leer `noindex`. No se exponen datos privados en sitemap, metadata ni previews.

Las mutaciones validan autenticación y propiedad en servidor y base de datos. RLS y funciones SQL limitan proyecciones públicas; las claves privilegiadas solo existen en servidor. La eliminación puede coordinar filas y Storage mediante varias operaciones, por lo que debe conservar referencias/reintentos ante fallos parciales; no se afirma atomicidad total.

## Ruta de trabajo

1. Cuenta, mascotas y QR.
2. Alertas de cuidado.
3. Pérdida, tablón y recuperación.
4. Carnet de salud privado.
5. Cartel de búsqueda.
6. Cierre de primera versión: accesibilidad, SEO y PWA.
7. Ruta posterior a MVP: contrato Pawgram, Pawgram, demo segura, calidad/CI, documentación y limpieza, y por último Google OAuth real y despliegue.

Cada fase de implementación se trabaja en un chat propio con GPT-6 Luna y razonamiento alto, criterios de aceptación y alcance confirmado. El estado técnico y los comandos de mantenimiento se documentan en `README.md`; la dirección visual está en `DESIGN.md`.
