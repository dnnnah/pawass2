---
name: PawPass V2
description: Identidad clara y cuidado cercano para volver a encontrarse.
colors:
  blue: "#176986"
  blue-deep: "#12536b"
  blue-light: "#e2f0f4"
  ink: "#173b4b"
  muted: "#506b77"
  paper: "#ffffff"
  surface: "#f5fafc"
  line: "#c8d9de"
  danger: "#b6323c"
  danger-soft: "#fcebed"
  accent-violet: "#6651a3"
  accent-cyan: "#087c9f"
  accent-cobalt: "#3154aa"
  surface-violet: "#faf8ff"
  photo-violet: "#efebf7"
  line-violet: "#d5cbed"
  surface-cobalt: "#f0f7ff"
  line-cobalt: "#c2d9ed"
typography:
  display:
    fontFamily: "Nunito Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.35rem, 4vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Nunito Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.12
  body:
    fontFamily: "Nunito Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Nunito Sans Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 700
rounded:
  field: "9px"
  button: "12px"
  card: "16px"
  rescue: "20px"
  pill: "999px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1.1rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1.1rem"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.blue-deep}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1.1rem"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "1.35rem"
---

# Design System: PawPass V2

## Overview

**Creative North Star: "Azul mineral para cuidar"**

PawPass conserva la continuidad de la maqueta azul-rescate-06 y su huella, con las decisiones posteriores aprobadas: lienzo blanco, detalles azules, fotografías completas y Nunito Sans Variable. La personalidad combina 75% profesional y 25% juguetón: información clara, mensajes cálidos y figuras visibles de corazón, gato, perro, estrella, collar y huella. Los acentos violeta, cian y cobalto aportan el color más llamativo aprobado, con tarjetas alternas pastel.

La decoración acompaña el cuidado sin competir con el nombre, la fotografía, el estado o el contacto. Esta documentación describe el sistema implementado en modo Operate; no sustituye la especificación funcional ni convierte la maqueta en una composición obligatoria.

**Key Characteristics:**

- Blanco con superficies pastel y acentos azules, violetas y cian.
- Fotografías completas, sin recorte.
- Acciones sólido / contorno / texto.
- Calidez discreta y legibilidad accesible.

## Colors

### Primary

Azul mineral (`blue`) para acciones y detalles de marca; azul profundo (`blue-deep`) para enlaces y hover; azul suave (`blue-light`) para estados habituales y selección.

### Secondary

Violeta (`accent-violet`) para corazón y collar, cian (`accent-cyan`) para gato y estrellas, y cobalto (`accent-cobalt`) para perro. Son acentos decorativos visibles; las acciones conservan su jerarquía azul. Las tarjetas pares de mascotas usan cuerpo violeta casi blanco (`surface-violet`), fondo de foto violeta suave (`photo-violet`) y borde lavanda (`line-violet`). Las tarjetas pares del tablón usan cuerpo azul pastel (`surface-cobalt`) y borde azul suave (`line-cobalt`).

### Neutral

Blanco (`paper`) como lienzo. Superficie azul casi blanca (`surface`) para cuerpos de tarjetas. Tinta (`ink`) para lectura principal, texto secundario (`muted`) para ayuda y línea suave (`line`) para separar grupos.

### Named Rules

**The Azul cotidiano Rule.** Las tareas habituales y WhatsApp usan azul; el rojo identifica pérdida, emergencia o alerta crítica. No introducir verde ni amarillo como colores de interfaz; la marca oficial multicolor de Google es una excepción de identidad externa.

Rojo de rescate (`danger`) y fondo rojo suave (`danger-soft`) son colores semánticos de excepción, acompañados de texto que identifique el estado.

## Typography

**Display Font:** Nunito Sans Variable, con ui-sans-serif, system-ui y sans-serif de respaldo.
**Body Font:** la misma familia, autoalojada mediante `@fontsource-variable/nunito-sans` e importada desde el layout raíz.

La curva amable de la familia aporta cercanía sin sacrificar lectura. Los títulos cambian de tamaño según su contexto: el panel usa 2.5rem (peso 750), las tarjetas 2rem y el cuerpo 16px. En móvil el título del panel baja a 2rem y el de tarjeta a 1.9rem. Las etiquetas usan 0.92rem y peso 700. Párrafos limitados a 68ch; conservar texto en caja normal.

## Layout

Contenido centrado, ancho máximo habitual de 1100px. Listas de mascotas y tablón en dos columnas con separación de 1.5rem; a 620px pasan a una columna con separación de 1.25rem. La ficha QR tiene máximo 760px. El editor agrupa identidad, fotografía, cuidados y contactos en bloques con navegación de secciones y ayuda de privacidad lateral; a 880px esa ayuda fluye debajo del contenido. No convertir esta organización en nuevas capacidades de producto.

La navegación principal vive en un menú hamburguesa en la cabecera a todas las anchuras. Esta decisión posterior sustituye la navegación inferior móvil; no se reserva relleno inferior para ella. El tablón aplica automáticamente el filtro de especie y muestra el estado de actualización; no añade botón “Buscar alertas”, filtro de zona ni una llamada “Entrar a PawPass”. Un único SiteFooter, compuesto desde el layout raíz, cierra todas las páginas de la aplicación. Se mantiene cerca del contenido: cuenta, rescate y ficha de pérdida no fuerzan una altura de pantalla; acceso reserva `calc(100svh - 145px)` para su composición. El pie tiene margen superior de 1.25rem y relleno de .4rem 0 1rem.

## Elevation & Depth

Predominan líneas y fondos tonales. La ficha QR usa una sombra ambiental suave (`0 16px 40px rgba(32, 70, 91, 0.09)`); el panel de contacto de cuenta usa `0 10px 28px rgba(26, 66, 84, .06)`. No extender estas sombras a todos los bloques.

## Shapes

Tarjetas y bloques con esquinas suaves (16px); ficha QR más abierta (20px); botones (12px), campos (9px) y estados en cápsula (999px). Bordes finos separan contenido; los botones de contorno usan 2px. Los motivos de mascota son SVG visibles de trazo sencillo; el protagonismo visual sigue en la mascota y no sustituyen el logo aprobado.

## Components

### Buttons

Primario sólido azul, secundario de contorno y terciario de texto subrayado. Altura mínima habitual de 48px, peso 700 y relleno de 0.75rem 1.1rem. Hover oscurece el primario y matiza el secundario; al pulsar desciende 1px. Foco de 3px con separación de 3px; deshabilitado con opacidad 0.58. Transición de 120ms ease, reducida según preferencias del usuario.

El botón compartido “Continuar con Google” usa el contorno habitual y el activo oficial multicolor autoalojado `public/google-g.svg`, decorativo junto a su etiqueta visible. Sus colores pertenecen a Google y no amplían la paleta de PawPass.

### Cards / Containers

Fotografía sobre fondo suave, cuerpo con detalles azules y acciones en orden claro. Fotos de tarjetas a 320px en escritorio y 220px en móvil. El nombre, especie, código y estado tienen jerarquías distintas.

**The Foto completa Rule.** Mostrar la fotografía con object-fit: contain; el espacio sobrante conserva el fondo suave del contenedor.

### Inputs / Fields

Campo blanco con borde visible, etiqueta encima, ayuda debajo y foco consistente. Altura mínima de 48px; el selector conserva indicación de despliegue y vuelve al control nativo en colores forzados. Mostrar/ocultar contraseña usa un botón con nombre accesible.

Teléfono y WhatsApp separan país/lada y número nacional. El selector usa el catálogo estático `country-options.json` para mantener el mismo contenido inicial en servidor y cliente. Durante la edición se muestran solo dígitos (máximo 15); al perder foco se agrupan dos dígitos iniciales y bloques de cuatro, por ejemplo `55 1234 5678`. La recompensa opcional admite únicamente dígitos, sin símbolos ni decimales, con la misma restricción en el normalizador. Es un contrato de entrada; no implica cambios de base de datos ni migraciones.

### Navigation

AppHeader muestra la marca y un botón “Menú” con icono SVG, nombre accesible, aria-expanded y aria-controls. El panel desplegable ofrece Mis mascotas, Mascotas perdidas, Mi cuenta y la acción de sesión correspondiente. Tiene ancho máximo de 340px, esquinas de 12px, borde suave y sombra `0 12px 30px #173b4b14`. Se cierra al seleccionar un destino, pulsar fuera o usar Escape; Escape devuelve el foco al botón. El activo usa fondo azul suave y aria-current. El botón mide al menos 48px (44px en móvil). La navegación del editor puede envolver líneas y conserva objetivos de 48px. Los estados y cápsulas incluyen texto además de color.

### Contacto de rescate

WhatsApp mantiene azul de marca y precede a la llamada de contorno, cuando exista; la llamada durante una pérdida usa contorno rojo y ubicación ocupa el nivel de texto. Los avisos de pérdida o cuidado crítico usan rojo sin cambiar la identidad habitual de WhatsApp.

### PetTrail, mensajes y pie global

PetTrail reúne estrella, perro, huella, corazón, gato, collar y estrella, con trazos redondeados. Las figuras principales miden 44px (34px en móvil) y las estrellas 26px (17px en móvil); perro y gato tienen inclinaciones suaves opuestas. Las figuras decorativas se ocultan a tecnología de asistencia.

PetNote personaliza el mensaje con el nombre: acompañamiento en edición, petición de ayuda en rescate y agradecimiento al volver a casa. SiteFooter contiene un único PetTrail, la marca y un mensaje cálido compartido. Su variante compacta reduce las figuras a 26px y las estrellas a 18px, con separación vertical corta; el texto principal usa .9rem y el auxiliar .8rem. Evitar pies locales duplicados.

El panel “Mis mascotas” saluda con el nombre del tutor cuando está disponible. El tablón incluye dos bloques de ánimo: uno acompaña al tutor y otro invita a ayudar mediante WhatsApp. Usan superficies violeta y cian suaves, figuras de 30px y encabezados de 1.05rem; pasan de dos columnas a una en móvil.

## Do's and Don'ts

### Do:

- Do conservar la huella después de “pawpass”.
- Do ofrecer foco visible, etiquetas claras y controles táctiles accesibles conforme a WCAG 2.2 AA.
- Do mantener WhatsApp primero, llamada secundaria cuando esté disponible y ubicación como acción terciaria.
- Do utilizar mensajes personalizados y figuras visibles sin ocultar información.

### Don't:

- Don't recortar las fotografías para llenar una tarjeta.
- Don't usar verde o amarillo como colores propios de interfaz ni rojo para estados cotidianos; conservar la marca oficial multicolor de Google.
- Don't usar decoración como sustituto de etiquetas o estados textuales.

No canonizado: los rótulos superiores en mayúsculas y espaciado amplio que persisten en `.section-label`, y el rojo heredado en eliminación de cuenta/mascota, son desviaciones existentes; no se convierten en reglas para nuevas superficies ni se reparan en esta documentación.
