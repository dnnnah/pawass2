# PawPass V2 — Especificación de producto en definición

> **Estado:** alcance y reglas funcionales de la primera versión aprobados por el autor. Las decisiones de diseño técnico y de la etapa social se enumeran al final.

## 1. Propósito y alcance

PawPass es una aplicación web instalable (PWA) abierta a tutores de cualquier país, con contenido inicial y lenguaje enfocados en México. Permite al tutor registrar la identidad y salud de sus mascotas, facilitar el contacto cuando alguien escanea su placa QR y publicar una alerta cuando una mascota se pierde. La aplicación no divide a sus usuarios ni a sus mascotas en productos separados por país.

La primera versión pública incluye **cuenta y mascota, alertas de cuidado, ficha de rescate por QR, alerta y tablón de mascotas perdidas, cartel de búsqueda y carnet de salud privado**. La comunidad de perfiles públicos y las “patitas” se definirán y construirán en una etapa posterior.

El orden de definición y construcción es: **cuenta y mascota → alertas de cuidado → QR y pérdida → cartel → carnet de salud completo**. Las alertas de cuidado se preparan antes que el carnet completo porque el QR de rescate debe poder mostrarlas desde el inicio.

PawPass V2 es un proyecto nuevo. Las decisiones, estados y estructuras de PawPass anterior no se heredan automáticamente.

**Arquitectura base aprobada:** una aplicación web modular con React, Next.js, TypeScript y Tailwind CSS. Supabase provee autenticación, PostgreSQL y almacenamiento de archivos. Supabase Auth ofrecerá tanto correo y contraseña como Google OAuth; las sesiones se integrarán con Next.js.

**Organización del código:** Módulos Verticales (Feature-Driven). Cada módulo de producto agrupa interfaz, acciones, reglas de dominio y contratos relacionados bajo `src/features/<modulo>`; `src/app` ensambla las rutas y layouts. Las utilidades compartidas se reservan para lógica realmente transversal.

### Stack obligatorio y responsabilidad de cada parte

| Capa | Elección | Responsabilidad |
| --- | --- | --- |
| Interfaz | **React** | Componentes y estados interactivos de las pantallas. |
| Aplicación web | **Next.js con App Router** | Rutas, renderizado, páginas públicas y privadas, y lógica de servidor necesaria para exponer solo datos autorizados. |
| Lenguaje | **TypeScript en modo estricto** | Tipos de dominio, contratos entre módulos y comprobación estática. |
| Estilos | **Tailwind CSS** | Sistema visual, tokens y estilos de componentes reutilizables; las acciones y estados mantendrán una jerarquía consistente. |
| Identidad | **Supabase Auth** | Cuentas, sesiones, correo/contraseña, recuperación y Google OAuth. |
| Datos | **Supabase PostgreSQL** | Modelo relacional, catálogos, mascotas, salud, alertas e historial, con permisos por propietario. |
| Archivos | **Supabase Storage** | Fotografías y documentos; los documentos privados no se sirven desde rutas públicas. |
| Instalación | **PWA sobre Next.js** | Instalación y pantalla sin conexión, sin edición de datos offline en la primera versión. |

Se usará **una sola aplicación Next.js** organizada por módulos de producto, sin una API independiente. Las versiones concretas de paquetes se fijarán al iniciar la implementación y quedarán registradas en el archivo de dependencias y su lockfile. La biblioteca para generar carteles y el procesamiento de imágenes se elegirán durante el diseño técnico, después de validar sus requisitos de calidad.

En concreto, **React no es una segunda aplicación**: los componentes React forman la interfaz dentro de Next.js. Los archivos de aplicación y componentes se escribirán en TypeScript/TSX; Tailwind CSS será el sistema de estilos de la interfaz. Next.js servirá tanto páginas como las rutas de servidor necesarias para preparar las fichas públicas y realizar operaciones que no deben ejecutarse desde el navegador. La aplicación requerirá un despliegue que ejecute código de servidor; no se planteará como exportación HTML puramente estática.

Las claves secretas de Supabase permanecen en el servidor. Los datos privados se protegen con permisos de propietario en PostgreSQL y los documentos con acceso privado en Storage. La PWA se añade sobre la aplicación Next.js para instalación y pantalla sin conexión. El proveedor de alojamiento, las versiones exactas y las bibliotecas auxiliares se decidirán en el plan técnico, sin cambiar estas elecciones obligatorias.

**Límite de acceso aprobado:** el expediente del tutor y sus documentos son privados. Las rutas públicas del QR y del tablón entregan únicamente los campos autorizados para rescate, preparados por la aplicación desde una sola base de datos. La ficha pública obtiene el contacto vigente de la cuenta o de la excepción de la mascota; no mantiene copias independientes que puedan quedar desactualizadas. Los documentos se almacenan de forma privada. La eliminación de registros y archivos se coordina desde el servidor.

## 2. Cuenta y contactos de rescate

- El tutor puede autenticarse con correo y contraseña o con Google.
- En los formularios de acceso y cambio de contraseña puede mostrar u ocultar el texto del campo con un control accesible. El registro solicita la contraseña dos veces y valida que coincidan antes de enviarla a Supabase.
- Los correos de confirmación y recuperación de contraseña deben funcionar en producción mediante un servicio de envío configurado para la aplicación.
- Después de autenticarse, completa su perfil antes de crear mascotas. El nombre es obligatorio; los dos campos de apellido son opcionales.
- El teléfono para llamadas y WhatsApp usan el mismo número por defecto. El tutor puede separarlos expresamente si quiere. Cada número guardado incluye lada internacional. En los formularios se elige el país/lada por separado y se introducen solo dígitos; fuera de edición, el número nacional de diez dígitos se presenta como `55 1234 5678`.
- Se aceptan teléfonos y números de WhatsApp con lada de otros países. La lada de México aparece preseleccionada y el tutor puede cambiarla; esto no limita dónde puede usarse PawPass.
- Se valida el formato de ambos números y se pide al tutor confirmarlos visualmente. No se exige verificación por SMS en la primera versión.
- El perfil puede guardar la ciudad o zona habitual. Estos datos **no se usarán** como sustitutos de la última ubicación vista en una alerta de pérdida.
- Las mascotas heredan los contactos de la cuenta. El tutor puede elegir entre cambiar los contactos de la cuenta para las mascotas que los heredan o crear/cambiar una excepción para una mascota concreta. Las excepciones se conservan cuando cambia el contacto de la cuenta.
- El nombre y los apellidos del tutor no aparecen en la ficha pública de rescate; esta muestra botones de llamada y WhatsApp.

## 3. Identidad y alta de mascotas

- El alta rápida exige únicamente **nombre y especie** (`perro` o `gato`). Los demás datos pueden completarse después.
- Se pueden registrar raza desde un catálogo por especie —incluida “Mestizo / Sin raza”—, mezcla estimada opcional, sexo, talla, color, peso, microchip y esterilización.
- La mascota puede tener una **clave RUAC de la Ciudad de México**, capturada opcionalmente por el tutor. La clave completa se muestra solo en la ficha privada de la mascota. En el QR público aparece únicamente un indicador de que el tutor aportó una clave RUAC, sin revelar el número ni afirmar una verificación oficial. Si no hay clave, no aparece apartado ni indicador RUAC.
- Para la edad se admite fecha de nacimiento exacta o edad aproximada en años y meses cuando se desconoce la fecha. La edad aproximada debe conservar la fecha en que fue declarada para poder actualizarse de forma coherente.
- La foto principal es opcional durante el alta rápida. Se puede agregar después.
- Cada mascota recibe al crearse un código público corto e inmutable con formato **`PC-XXXXXX`**: seis caracteres alfanuméricos en mayúsculas, evitando caracteres que se confundan visualmente. El sistema debe garantizar unicidad.
- Un código eliminado nunca se asigna a otra mascota. Si se elimina una mascota, el enlace anterior deja de mostrar su ficha. Solo se conserva una reserva técnica del código, sin datos personales ni archivos de la mascota.

### Publicación inmediata del QR

La ficha QR queda activa al crear la mascota. Antes de guardar el alta, PawPass muestra los datos que estarán accesibles a cualquier persona que tenga o escriba el código y pide aceptación explícita del tutor. La mascota **no aparece por ello en un listado público**.

### Alta en tres pasos

1. **Crear ficha:** nombre, especie y aceptación explícita de la información pública del QR. Guardar este paso crea y activa la ficha.
2. **Identidad:** raza y mezcla opcional, sexo, talla, color y fecha de nacimiento o edad aproximada. Este paso se puede completar después.
3. **Detalles y contacto:** peso, microchip, RUAC, esterilización, foto y contactos distintos para la mascota. Este paso es opcional y aplazable. Los campos de salud siguen en las alertas de cuidado y no se copian automáticamente al QR.

El acceso al alta se muestra únicamente después de que el tutor elija “Agregar mascota”. Un paso omitido se puede retomar desde la ficha privada de la mascota.

## 4. Ficha pública de rescate por QR

- La ruta de la ficha es `/p/PC-XXXXXX`. Se abre en un navegador móvil sin instalar la aplicación ni crear una cuenta. El código puede teclearse manualmente.
- Muestra nombre, especie, foto principal si existe, botones de llamada y WhatsApp y las alertas críticas o instrucciones de manejo que el tutor haya elegido publicar.
- No muestra nombre ni apellidos del tutor, historial clínico completo ni documentos privados.
- El contacto disponible se resuelve con la excepción de la mascota, si existe; en caso contrario, con los datos vigentes de la cuenta.
- El botón de WhatsApp abre una conversación con un mensaje prellenado que identifica a la mascota y su código. Quien la encuentre puede elegir incluir su ubicación actual como enlace de mapa; se solicita su permiso antes de obtenerla.
- La ficha QR sigue disponible aunque la mascota no tenga una alerta de pérdida ni un futuro perfil comunitario.

## 5. Alertas de cuidado y salud privada

### Alertas médicas y de temperamento

- Hay un catálogo de alergias, condiciones, medicación, cuidados y rasgos de temperamento, con opción “Otra” para texto personalizado.
- El catálogo sugiere un nivel de importancia: **crítica, precaución o informativa**. El tutor puede cambiarlo antes de guardar.
- El tutor elige expresamente qué alertas críticas e instrucciones de manejo aparecen en el QR. Los demás datos permanecen privados.
- Al activar una alerta de pérdida **no se publica información médica adicional**. La ficha y el tablón conservan solo las alertas de cuidado que el tutor ya eligió mostrar.

### Vacunas y desparasitaciones

- Se registran desde catálogos por especie, con opción “Otra”. Cada registro puede guardar fecha de aplicación, próxima dosis, lote, veterinario y notas pertinentes.
- Los catálogos iniciales y sus sugerencias se enfocan en México. El catálogo puede sugerir una próxima fecha, pero el tutor debe revisarla y confirmarla antes de guardarla. Si no existe una sugerencia para el elemento elegido, el tutor puede indicar la fecha por su cuenta. Solo la fecha confirmada determina el semáforo.
- El semáforo distingue **al día**, **próxima a vencer** y **vencida**. “Próxima a vencer” empieza 30 días antes de la próxima fecha registrada.
- Si no existe registro, se muestra **sin información**. Si existe un registro sin próxima fecha, se muestra **sin próxima fecha**. Ninguno de esos casos se considera vencido automáticamente.

### Otros datos y documentos

- El carnet privado permite registrar cirugías e intervenciones con fecha y notas.
- El tutor puede subir documentos clasificados, como cartilla de vacunación, certificado de esterilización, registro de microchip, receta, estudio médico o identificación.
- Los documentos y el historial clínico completo son privados para el tutor autenticado; nunca se entregan desde la ficha QR ni desde el tablón público.
- Las fotos de galería y los documentos son grupos distintos de archivos. La posible publicación de fotos en la comunidad se definirá en la etapa posterior.

## 6. Modo mascota perdida y tablón público

**Fase 3 aprobada:** incluye estado de pérdida, página pública de pérdida, tablón `/perdidas`, recuperación e indicador temporal del QR. El cartel de “Se busca” se implementa en una fase posterior.

- El tutor puede activar una alerta de pérdida inmediatamente con la información ya registrada; no se exige completar zona, foto reciente ni otros campos antes de publicarla.
- Al publicar la alerta se avisa qué datos serán visibles en el tablón público. El QR ya está activo desde la creación de la mascota y no necesita un paso de activación adicional.
- El aviso de publicación explica que la alerta activa podrá aparecer en buscadores y que el número de contacto visible en su ficha pública podría quedar expuesto en esos resultados.
- La alerta aparece de inmediato en `/perdidas`. Si aún no se indicó la última ubicación, se muestra **“Ubicación pendiente”**; no se toma la ciudad habitual del tutor como si fuera el lugar del extravío.
- El tutor puede agregar o editar: foto reciente del extravío, qué llevaba puesto, ciudad, zona o colonia, fecha y hora aproximadas, mensaje de ayuda, instrucciones y recompensa informativa opcional, escrita solo con dígitos, sin símbolos ni decimales.
- La ubicación se describe en texto para que cualquier tutor pueda indicar dónde se vio a la mascota, sin dividir el producto ni el tablón por países. No se exige publicar una coordenada precisa.
- La ficha de pérdida reutiliza identidad, contacto y alertas de cuidado elegidas. Añade únicamente los datos específicos del extravío.
- Cada episodio de pérdida conserva fechas y estado. El contenido de pérdida se separa de los datos de salud y nunca añade información clínica que el tutor no haya autorizado ya para el QR.
- La ficha de pérdida tiene una URL pública propia, permite volver a la ficha QR y solo expone identidad, contactos efectivos, alertas elegidas y detalles del extravío.
- El tablón muestra las alertas al abrirse y permite filtrar automáticamente por especie, sin botón de búsqueda ni búsqueda por zona; cada ficha permite contactar al tutor por WhatsApp.
- Una mascota puede tener una alerta de pérdida activa a la vez. Al cerrar la alerta, sale de inmediato del tablón.
- Tras marcarla como recuperada, el QR muestra la ficha habitual con el aviso **“Ya está en casa” durante 30 días**. Después vuelve a la ficha habitual sin ese aviso. Una nueva alerta activa reemplaza el aviso de recuperación.
- El tutor conserva un historial privado de sus episodios de pérdida y recuperación, con sus fechas correspondientes.

## 7. Cartel de “Se busca” — fase posterior

- La alerta puede estar activa antes de que el cartel esté listo. La descarga se habilita cuando existe **al menos una foto** de la mascota y se ha indicado la última zona vista.
- PawPass genera dos imágenes PNG de alta calidad: **9:16** para historias y estados, y **4:5** para publicaciones.
- El cartel incluye foto, nombre, código y QR escaneable, última zona vista, descripción útil, alertas de cuidado elegidas, qué llevaba puesto y recompensa si se registró.
- El teléfono para llamadas aparece escrito en el cartel para que sea posible contactar sin escanear el QR. Antes de descargar o compartir, se advierte al tutor que ese número quedará visible en la imagen que circule fuera de PawPass.
- Al compartir desde el teléfono, PawPass usa las funciones disponibles del dispositivo. Si el navegador no puede adjuntar el PNG directamente a una aplicación, ofrece la descarga de la imagen e instrucciones breves para compartirla manualmente.
- La familia puede **descargar, compartir o imprimir** el cartel para colocarlo en la calle. La impresión ofrece composiciones adaptadas a papel **A4 y carta**. La función de impresión corresponde al cartel de búsqueda; no se crea una vista imprimible ni un PDF del carnet de salud.
- Si una persona escanea un cartel antiguo después de la recuperación, llega a la misma ficha QR y ve el aviso temporal “Ya está en casa”.

## 8. PWA, archivos y eliminación

- La primera versión puede instalarse como PWA. Sin internet muestra una pantalla clara de desconexión. Consultar o modificar datos requiere conexión; no habrá edición ni sincronización diferida sin internet.
- Todas las fotos subidas (principal, galería y extravío) se convierten a WebP con calidad objetivo del 80 % antes de almacenarse. Los documentos conservan su formato permitido.
- Eliminar una mascota o la cuenta completa requiere doble confirmación, incluida una acción explícita del tutor.
- La eliminación comprende registros relacionados y archivos almacenados; no deben quedar fotos ni documentos huérfanos. Los códigos públicos retirados permanecen reservados sin conservar datos personales de la mascota.
- La eliminación desde producto pide una confirmación inicial y otra acción explícita de alta intención (por ejemplo escribir el nombre/código de la mascota o `ELIMINAR CUENTA`). La operación del servidor verifica sesión y propiedad. El código público queda reservado anónimamente.
- El acceso rápido a la cuenta de prueba solo está disponible en desarrollo local. No se despliegan contraseñas de prueba ni secretos en el cliente y debe poder eliminarse desde la cuenta.

## 9. Etapa posterior: comunidad pública

**Pawgram** es el nombre confirmado para el futuro espacio social de mascotas públicas. Pertenece a una **etapa posterior**. Mostrará únicamente mascotas que sus tutores decidan publicar, sin importar el país. La publicación social es independiente de que el QR de rescate esté activo. El tutor elegirá qué bloques de información mostrar y mantendrá fuera de Pawgram su teléfono, WhatsApp y documentos privados. La regla exacta del botón “Dar una patita” y la publicación de fotos de galería se definirán antes de construir esta etapa.

Los nombres **Pawshot** y **Pawsnap** son candidatos para la acción o sección de subir una foto nueva o reciente. No se ha elegido uno ni se ha definido todavía si nombra un botón, un flujo o una sección. La terminología propia de PawPass se decidirá con el diseño de cada función, sin cambiar su alcance por el nombre.

## 10. Límites de la primera versión

- Sin carnet físico imprimible ni exportación PDF del carnet.
- Sin refugios, adopciones ni transferencias de titularidad.
- Sin chat interno, comentarios ni pagos.
- Sin rastreo GPS en tiempo real. La ubicación de quien encuentra a la mascota solo se incluye si esa persona decide enviarla por WhatsApp.
- Sin edición de datos sin conexión.

## 11. Criterios de aceptación de la primera versión

1. Un tutor puede completar su cuenta, confirmar dos números de rescate y crear una mascota con solo nombre y especie. La ficha QR funciona desde ese momento tras la aceptación explícita de sus datos visibles.
2. Una persona sin cuenta puede abrir el QR, identificar a la mascota, ver únicamente las alertas de cuidado autorizadas y contactar al tutor por llamada o WhatsApp. No puede ver documentos ni historial clínico privado.
3. El tutor puede activar una alerta de pérdida sin completar antes todos sus detalles. La mascota aparece de inmediato en el tablón y sale de él al marcarse como recuperada. El QR muestra “Ya está en casa” durante los siguientes 30 días.
4. Cuando hay foto y última zona vista, el tutor puede obtener carteles PNG 9:16 y 4:5, compartirlos o descargarlos e imprimir versiones adaptadas a A4 y carta.
5. El tutor puede registrar alertas de cuidado, vacunas, desparasitaciones, cirugías y documentos. La falta de un registro o de una próxima fecha nunca se presenta como una dosis vencida.
6. Al eliminar una mascota o una cuenta con doble confirmación, desaparecen sus datos y archivos relacionados; ningún código público retirado se asigna después a otra mascota.

## 12. Decisiones para el diseño técnico y la etapa posterior

- Definir contenido y mantenimiento de los catálogos iniciales enfocados en México, sin convertir sus sugerencias en indicaciones veterinarias automáticas.
- Definir formatos y límites de carga de fotos y documentos, así como dimensiones de imágenes.
- Precisar la presentación de campos ausentes en el QR y en el tablón cuando una mascota se registró con solo nombre y especie.
- Definir los detalles funcionales de Pawgram cuando se diseñe esa etapa posterior y elegir entre Pawshot, Pawsnap u otro nombre para el flujo de fotos.

## 13. Dirección de interfaz aprobada

- La pantalla principal privada muestra primero las mascotas del tutor. Cada mascota presenta una acción de **“Reportar perdida”** claramente visible. El carnet de salud y los documentos se consultan desde la ficha de esa mascota.
- La navegación principal usa un menú hamburguesa en todas las anchuras y contiene **Mis mascotas**, **Mascotas perdidas** y **Mi cuenta**. Salud y documentos se consultan dentro de cada mascota.
- La ficha pública del QR muestra primero la foto y el nombre de la mascota, seguidos primero de WhatsApp como acción sólida, después de llamada como acción de contorno y de ubicación como apoyo textual. Las alertas de cuidado elegidas aparecen a continuación, con jerarquía según su importancia.
- Cuando hay una alerta de pérdida activa, la parte superior de la ficha QR muestra una franja clara de **“Mascota perdida”** y mantiene foto, nombre y botones de contacto en las primeras posiciones.
- La estructura visual prioriza fotografías de las mascotas, fichas sencillas y cercanía. El fondo es blanco, con superficies y detalles azules en las fichas y texto azul oscuro de alto contraste. La tipografía es Nunito Sans Variable autoalojada; el carácter combina 75% profesional y 25% juguetón, con figuras de huellas, corazones, estrellas, collares, perros y gatos y acentos decorativos cian, cobalto y violeta.
- El logo muestra la palabra **“pawpass” junto a una huellita**. La huellita y la identidad habitual usan azul, no rojo.
- Orden confirmado del logo: palabra **“pawpass” primero y huellita después**.
- El **azul mineral** es el color de acciones y estados habituales. El **rojo** se reserva para estado de pérdida, alertas críticas y acciones urgentes como “Reportar perdida” y el contacto durante una pérdida.
- La jerarquía de botones es consistente en ambos contextos: acción principal con relleno sólido, acción secundaria con contorno y acción terciaria como texto sin relleno. La pareja principal/secundaria usa azul en flujos habituales y rojo en emergencias.
- No usar verde ni amarillo como colores de interfaz. Los estados de éxito y precaución usan texto, iconografía y superficies neutrales o azules accesibles; el verde de marca de WhatsApp no se aplica al botón de PawPass.
- “Mis mascotas” y “Mi cuenta” son páginas distintas con estructura propia. El formulario de alta permanece oculto hasta que se elige agregar una mascota.

## 14. Calidad transversal: accesibilidad y SEO

La **accesibilidad y el SEO son requisitos de la primera versión**, desde la arquitectura y el diseño, no tareas de pulido posteriores.

### Accesibilidad

- Objetivo de conformidad: **WCAG 2.2 nivel AA** para los flujos de cuenta, mascota, QR, pérdida, cartel y salud.
- La navegación y las acciones deben funcionar con teclado; el foco ha de ser visible y seguir un orden lógico. Formularios, errores, estados y botones deben tener nombres e instrucciones comprensibles para lectores de pantalla.
- El color nunca es el único indicador de pérdida, gravedad o estado de salud: se acompañará de texto e iconografía comprensible. La jerarquía azul/rojo debe conservar contraste suficiente.
- La interfaz debe soportar ampliación de texto, reflujo en móvil y preferencias de movimiento reducido. Las áreas táctiles, mensajes de error y pasos de autenticación deben diseñarse para un uso accesible.
- Las fotografías informativas tendrán texto alternativo útil. El cartel tendrá una descripción textual accesible de la información que transmite, además de su imagen descargable o imprimible. El QR conservará una URL y un código legibles para acceso alternativo al escaneo.
- Cada fase verificará sus flujos con revisión automática y pruebas manuales de teclado, lector de pantalla y móvil antes de considerarse terminada.

### SEO y privacidad

- Las páginas públicas que se acuerde indexar deben entregar contenido y metadatos útiles desde el servidor, con títulos, descripciones y URL canónicas coherentes. Se prepararán `sitemap.xml` y `robots.txt` según la política de indexación aprobada.
- Las áreas autenticadas, el expediente privado y los documentos no se indexan. Ningún dato privado debe incorporarse a metadatos, datos estructurados, mapas del sitio o vistas previas para compartir.
- El tablón `/perdidas` y las fichas de pérdida **mientras la alerta esté activa** son indexables. La ficha QR habitual, sin alerta activa, lleva `noindex`. Al recuperar a la mascota, su ficha vuelve a `noindex` y sale del mapa del sitio de alertas; los buscadores pueden tardar en reflejar la retirada.
- La ficha QR `/p/PC-XXXXXX` lleva `noindex` tanto en estado normal como durante una pérdida; la ruta pública separada de pérdida y el tablón son indexables solo mientras la alerta está activa. La vista de recuperación lleva `noindex`.
- La política de indexación se aplica con directivas de página que los rastreadores puedan leer. `robots.txt` no debe impedir que un rastreador vea el `noindex` de una ficha pública. El SEO no debe ampliar por accidente la exposición de datos de salud o información privada.
- Se revisarán indexación, rendimiento y resultados de búsqueda en cada fase que añada páginas públicas.
