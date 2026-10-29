# Fase independiente de diseño y UX

Base: `origin/main` en `fb4ade8`, que integra los PR #1–#4 y la fase 3. Rama: `feat/rediseno-ux`. El PR apunta a main y no se fusiona automáticamente.

## Alcance y aceptación

- Una composición coherente para mascotas, editor, rescate y tablón. Arquitectura por módulos verticales.
- Nunito Sans Variable autoalojada; fondo blanco, superficies minerales y acentos azules, cian y violeta. Carácter 75% profesional / 25% juguetón, con figuras de huellas, corazones, estrellas, perro, gato y collar.
- Un footer compartido desde el layout. Mensajes contextuales personalizados por nombre en fichas privadas, de búsqueda, rescate y recuperación.
- Fotografías completas mediante `contain`, sin recortar al animal.
- WhatsApp principal; llamada secundaria cuando el contrato la incluye; ubicación como apoyo textual. El tablón no incorpora un teléfono de llamada nuevo al contrato público.
- Tablón sin búsqueda por zona, sin botón “Buscar alertas” y sin CTA “Entrar a PawPass”. Selección de especie automática, con flecha descendente y foco azul.
- Editor agrupado por aspecto, edad y datos privados, con accesos entre secciones.
- No se modifican migraciones, políticas de acceso ni funciones de base de datos. Por petición posterior explícita del usuario, la recompensa acepta solo dígitos también en el normalizador compartido de entrada.

## Errores de interacción comprobados

El selector de raza usaba `details.breed` como valor controlado. Al seleccionar Labrador desde Chihuahua, la UI volvía a Chihuahua. Se reprodujo en navegador antes de corregir; después conserva Labrador y permite alternar “Otra” y la entrada personalizada.

Las imágenes de huella de las fichas sin fotografía heredaban ancho/alto del 100% y se ampliaban hasta ocupar el espacio de la foto. Se limitan a su tamaño de icono. Los controles de edad heredaban el tamaño de los campos; ahora el radio mide 18px con etiqueta táctil amplia.

## Validación y límites

Capturas a 1440 y 390px, sin desbordamiento horizontal en las superficies revisadas. Navegación de secciones, selección de raza, edad, especie y foco de teclado inspeccionados en navegador. Las capturas de tarjetas y editor usan los componentes reales con datos ficticios y las fotografías de la referencia aprobada; no prueban persistencia de una cuenta real. La ruta temporal y sus fotos se eliminan antes del build final.

Se conservan `noindex` y los contratos de exposición de datos existentes. No se incorporan campos privados a metadatos ni al footer. Contraste sobre blanco: texto 11.91:1; secundario 5.66:1; azul 6.17:1; rojo 5.98:1. Esta revisión no equivale a una auditoría WCAG completa ni a una prueba con lector de pantalla.

Pruebas: lint, typecheck, build de producción y suite Vitest. La regresión automatizada de contacto comprueba WhatsApp → llamada → ubicación. No se realizaron escrituras ni migraciones remotas por el agente. Sin diagnóstico confirmado de defecto de backend; la persistencia real queda fuera de la evidencia visual.

## Capturas

Los archivos `mascotas-*`, `editor-*` y `fichas-perdidas-*` muestran datos ficticios. `tablon-*` muestra la ruta pública. Revisar la fecha y alcance al comparar capturas con cambios posteriores.

## Ajustes locales y procedencia

El filtro automático se verificó navegando de `/perdidas` a `/perdidas?especie=perro` y `/perdidas?especie=gato` sin botón. Next.js bloqueaba recursos de desarrollo del origen 127.0.0.1 cuando el servidor se iniciaba en localhost; `allowedDevOrigins` permite exclusivamente ese hostname de loopback adicional, sin comodines ni cambios de producción.

El botón compartido de Google muestra su marca multicolor tanto en acceso como en registro. Activo oficial autoalojado: https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg. Sus colores de marca son la excepción solicitada para ese logo, no colores de estado de PawPass.

Las capturas finales son JPEG (`.jpg`), con anchos comprobados de 1440 y 390px y un solo footer en las diez superficies. Una primera captura que conservó el ancho de escritorio en la pestaña oculta fue descartada y sustituida; no forma parte de la evidencia final.

## Últimos ajustes solicitados

Navegación hamburguesa en todas las anchuras, con cierre por selección, Escape o exterior y foco devuelto al botón al usar Escape. Se retiró la barra móvil inferior. El indicador N de desarrollo se deshabilita mediante `devIndicators: false`. Footer raíz compacto y cercano. El tablón incluye un mensaje de ánimo para tutores y otro de invitación a contactar. Mis mascotas saluda con el nombre privado del tutor, si está registrado.

Teléfono y WhatsApp: teclado numérico, país/lada por separado, valor de envío solo en dígitos y formato visible `55 1234 5678` fuera de edición. `country-options.json` es una instantánea en español de los países soportados por libphonenumber-js; evita diferencias de traducción y orden entre el ICU de Node y el navegador. Se reprodujo el error de hidratación anterior y una pestaña nueva no reportó errores después del ajuste.

Recompensa: solo dígitos en UI y dominio. Se rechazan texto, símbolos, signos y decimales en lugar de convertirlos silenciosamente en otra cantidad. Una alerta antigua con recompensa textual muestra una instrucción para sustituirla o retirarla al guardar; no se migra automáticamente. La suite final incluye 23 pruebas.

Las 14 capturas finales (`mascotas`, `editor`, `fichas-perdidas`, `tablon`, `acceso`, `menu` y `campos`, en escritorio y móvil) reflejan la hamburguesa y el footer compacto. Las rutas y fotos temporales se retiraron antes del build final. El saludo Ana de la captura privada es demostrativo; la ruta real usa el nombre privado de la cuenta.

Revisión independiente: corrigió la prioridad azul de WhatsApp y el encabezado de acceso. Las últimas ampliaciones (footer/mensajes y luego menú/campos) recibieron disposición ship, limitada a su alcance.
