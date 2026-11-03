# Diseño PawPass V2

## Dirección visual

**Azul mineral para cuidar.** La referencia aprobada establece una identidad cercana, clara y reconocible: 75% profesional y 25% juguetona. El lienzo blanco y las superficies claras dejan que la mascota, su estado y el contacto sean protagonistas. La huella aparece después de «pawpass». La referencia orienta continuidad de identidad; el contrato funcional y la accesibilidad determinan cada pantalla.

La decoración incluye huellas, estrellas, collar, perro, gato y corazón con trazos sencillos. Mensajes cálidos y personalizados acompañan los recorridos. La decoración es secundaria, no oculta datos ni sustituye etiquetas.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `blue` | `#176986` | Acción primaria y marca habitual |
| `blue-deep` | `#12536b` | Enlaces, hover y texto azul profundo |
| `blue-light` | `#e2f0f4` | Selección y superficies de estado habitual |
| `ink` | `#173b4b` | Texto principal |
| `muted` | `#506b77` | Texto secundario |
| `paper` | `#ffffff` | Lienzo |
| `surface` | `#f5fafc` | Superficie azul muy clara |
| `line` | `#c8d9de` | Bordes y separadores |
| `danger` | `#b6323c` | Pérdida, emergencia y alertas críticas |
| `danger-soft` | `#fcebed` | Fondo de estados de urgencia |
| `accent-violet` | `#6651a3` | Acentos decorativos y documentos |
| `accent-cyan` | `#087c9f` | Acentos decorativos, fotos y cuidados |
| `accent-cobalt` | `#3154aa` | Acentos decorativos de mascotas |
| `surface-violet` | `#faf8ff` | Superficie alterna |
| `photo-violet` | `#efebf7` | Fondo de fotografía alterno |
| `line-violet` | `#d5cbed` | Borde de superficie violeta |
| `surface-cobalt` | `#f0f7ff` | Superficie alterna del tablón |
| `line-cobalt` | `#c2d9ed` | Borde de superficie cobalto |

Estados semánticos: informativa usa tinta violeta `#574080` y superficie `#efebf7`; precaución usa tinta azul `#144b6b` y superficie `#e1eef5`; crítica usa tinta roja `#8d2630` y superficie `#fcebed`; al día usa tinta `#12536b` y superficie `#edf5f8`; desconocida usa tinta `#476274` y superficie `#f3f6f8`. La excepción de verde es localizada a la confirmación visual de requisitos de contraseña cumplidos durante el registro; no crea un color de estado general.

Las acciones habituales y WhatsApp usan azul. Rojo se limita a pérdida, emergencia, alertas críticas y errores que requieren corrección. No se usan verde ni amarillo como colores habituales de interfaz. El botón de Google puede mostrar su marca oficial multicolor como identidad externa.

## Tipografía y composición

- Nunito Sans Variable autoalojada desde npm; respaldos `ui-sans-serif`, `system-ui`, `sans-serif`.
- Título de portada: `clamp(2.35rem, 4vw, 3.5rem)`, peso 700, interlineado 1.12, tracking `-0.025em`. Encabezados de sección: 2rem, peso 700, interlineado 1.12. Cuerpo: 16px/1.55. Etiquetas: 0.92rem y peso 700. Texto de párrafo de hasta 68ch.
- Contenido centrado, ancho máximo habitual 1100px; ficha QR hasta 760px. Listas en dos columnas con 1.5rem de espacio; una columna bajo 620px. Ayuda del editor fluye debajo a 880px.
- Fondo blanco, superficies pastel alternas y texto azul oscuro. Líneas y cambios tonales crean profundidad; sombras suaves solo en ficha QR, panel de contacto y menú desplegable.
- Fotos completas con proporción natural (`object-fit: contain`); el espacio libre usa el fondo de la superficie. No recortar a la mascota para llenar tarjetas.

## Formas, espacio y movimiento

Radios: estado 10px, campo 9px, botón 12px, tarjeta 16px, ficha QR 20px y píldora 999px. Espaciado base: 0.5rem, 1rem, 1.5rem y 2rem; el carnet usa separación consistente entre sección, registro, formulario y acciones. Evitar márgenes negativos en móvil.

Las transiciones de controles duran 120ms y respetan `prefers-reduced-motion`. Las sombras aprobadas son `0 16px 40px rgba(32, 70, 91, 0.09)` para ficha QR, `0 10px 28px rgba(26, 66, 84, .06)` para contacto y `0 12px 30px #173b4b14` para el menú.

## Jerarquía de acciones

1. **Primaria:** sólido azul para tareas habituales; sólido rojo solo para una acción urgente que el rojo identifica.
2. **Secundaria:** contorno azul o neutral; contorno rojo para una vía urgente secundaria.
3. **Terciaria:** enlace o texto subrayado, sin relleno.

Botones de al menos 48px de alto; radios 12px, peso 700 y padding aproximado `0.75rem 1.1rem`. Hover oscurece el primario y matiza el secundario. Al pulsar, desplazamiento de 1px. Deshabilitado con opacidad 0.58. Foco visible de 3px con separación de 3px.

WhatsApp se muestra primero como acción azul de marca, incluso durante una pérdida; llamada va después como contorno. El rojo de emergencia no recolorea WhatsApp. Cuando está disponible, la ubicación es información textual; nunca se solicita la ubicación actual del visitante.

## Controles y navegación

- Campos blancos con borde visible, etiqueta persistente encima, ayuda o error debajo, altura mínima de 48px y foco accesible. Los controles de contraseña tienen nombres accesibles para mostrar/ocultar.
- Teléfono: país/lada separado del número nacional; durante edición solo dígitos, al perder foco formato legible, por ejemplo `55 1234 5678`.
- Recompensa de pérdida: solo dígitos; no convertir silenciosamente texto, signos o decimales.
- Registro: requisitos de 8–72 caracteres, mayúscula, número y carácter especial; confirmación de coincidencia antes de envío. Los indicadores incluyen texto y anuncios accesibles. La palomita verde se limita a la validación de contraseña y el error de coincidencia usa rojo.
- Menú hamburguesa en todas las anchuras, con Mis mascotas, Mascotas perdidas y Mi cuenta. Cierra al elegir, pulsar fuera o usar Escape; Escape devuelve el foco al botón. Los enlaces indican destino actual.
- Un pie global compacto comparte la marca, el motivo gráfico y un mensaje cálido. No duplicar pies locales.
- Las tarjetas de mascota priorizan foto, nombre, especie y estado; ofrecen una acción primaria «Ver ficha pública» y enlaces discretos para editar o gestionar pérdida. No anidar tarjetas.

## Accesibilidad y responsive

WCAG 2.2 AA es el objetivo: contraste de texto 4.5:1, contraste de gráficos y controles necesarios 3:1, navegación completa por teclado, orden lógico, foco visible, nombres/instrucciones/errores comprensibles, objetivos táctiles adecuados, ampliación y reflujo a 320 CSS px, zoom de texto al 200% y movimiento reducido. No comunicar estado solo con color: combinar etiqueta, símbolo e icono con tono.

Las imágenes informativas tienen texto alternativo útil; las decorativas se ocultan a tecnologías de asistencia. Los carteles ofrecen una descripción textual equivalente y el QR conserva URL/código legibles. Formularios asocian errores con campos y anuncian resultados. Cargas, errores y resultados de mutación muestran estado visible.

La navegación se adapta a pantallas estrechas sin scroll horizontal; botones se apilan cuando hace falta. La navegación del editor puede envolver y mantiene objetivos de 48px. La navbar fija se alinea con la altura real de cabecera y no usa compensaciones laterales negativas.

## Uso por superficie

- **Inicio:** presentación pública con ejemplos explícitamente ficticios; no incrusta datos personales ni contacto activo. Menú y pie compartidos.
- **Mis mascotas:** estado y datos esenciales primero, con acciones claras para ficha, edición y pérdida.
- **QR:** foto y nombre, WhatsApp azul primero, llamada secundaria, después alertas autorizadas. Si está perdida, franja con texto claro y tono rojo.
- **Pérdida y tablón:** rojo solo para estado activo y alertas críticas; detalles legibles, ubicación escrita y filtros de especie automáticos. El cartel es una superficie de exportación separada y advierte que el teléfono será visible.
- **Carnet:** bloques privados por categoría, conteo y acciones agrupadas; estado de dosis con tono, símbolo y texto. Sin impresión ni PDF clínico.
- **Pawgram:** contenido social optativo con fotos completas y descripción accesible; no trasladar los colores ni permisos de rescate a su contrato de publicación.
- **Demo:** avisos visibles de ficción y ausencia de acciones reales; los estados de pérdida se distinguen como simulados.

## Identidad y decisiones aprobadas

El orden del logo es la palabra «pawpass» seguida por la huella mineral. La aplicación mantiene un solo lenguaje visual: superficies blancas y minerales, acentos pastel, fotos completas, mensajes cálidos y jerarquía de acciones consistente. La presentación exacta cambia por ruta según el objetivo y las necesidades funcionales. La maqueta aprobada no reemplaza contratos de producto, datos, privacidad ni accesibilidad.
