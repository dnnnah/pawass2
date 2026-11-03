# Plan de implementación: demo segura de mascotas

**Base:** diseño aprobado en `docs/superpowers/specs/2026-11-03-demo-mascotas-segura-design.md`.
**Ejecución prevista:** secuencial en este chat de fase; sin agentes paralelos.

## Tareas

### 1. Definir pruebas de dominio y privacidad (RED)

- Crear pruebas para los cinco registros, la distribución de especies y el único estado perdido.
- Probar resolución por slug/código de demo y el destino interno `/demo/codigo/...`.
- Renderizar la ficha/cartel de demostración y comprobar que el resultado visible está marcado como ficticio y no contiene formularios, enlaces telefónicos ni enlaces de WhatsApp.
- Ejecutar las pruebas nuevas y confirmar fallos por ausencia del módulo antes de escribir implementación.

### 2. Crear el catálogo canónico y los assets autorizados (GREEN)

- Añadir el catálogo tipado bajo `src/features/demo` con cinco fichas ficticias completas: identidad, cuidados, vacunas, desparasitación, intervención y documentos simulados.
- Añadir una pérdida ficticia completa, incluida última ubicación y fecha de zona inventada, señas, mensaje, alertas, recompensa informativa y copy anti-confusión.
- Procesar únicamente las cinco imágenes autorizadas (tres gatos y dos perros; los nombres de origen de los perros comienzan con P), excluyendo la imagen vetada, y exportarlas como WebP sin metadatos identificables y con nombres neutros bajo `public/demo`.
- Hacer pasar las pruebas de catálogo y origen/cantidad de imágenes. No modificar el seed de la cuenta de prueba.

### 3. Construir la superficie pública de solo lectura

- Crear `/demo`, `/demo/mascotas/[slug]` y `/demo/codigo/[code]` como rutas Server Component que consumen únicamente el catálogo.
- Mostrar identidad, foto, cuidados y carnet de ejemplo; cada registro y documento debe conservar la etiqueta de simulación.
- Presentar el reporte y cartel de Tacho en componentes de demo, sin reutilizar flujo de pérdidas real ni exponer contacto accionable.
- Añadir enlace/QR de demostración que resuelva solo dentro de `/demo`.
- Mantener semántica, foco visible, texto alternativo y reflujo en móvil conforme al sistema visual existente.

### 4. Integrar navegación y control de rastreo

- Enlazar `/demo` desde la portada y navegación global con el rótulo aprobado.
- Añadir metadata `noindex`, `nofollow` y `noarchive` a las rutas de demo.
- Dejar `/perdidas`, sitemap, Pawgram, Auth, Supabase, migraciones y seed sin cambios funcionales.

### 5. Verificar integración y preparar entrega

- Ejecutar tests, lint, typecheck y build; corregir fallos de esta fase.
- Inspeccionar el HTML renderizado de las rutas para robots, textos de seguridad, ausencia de formularios/contacto activo y exclusión del sitemap.
- Revisar la app por teclado y lector/semántica y capturar escritorio y 390 px; corregir en una pasada visual y confirmar.
- Revisar diff y tamaño de cada unidad de commit (meta: no más de 400 líneas modificadas por commit, excepto binarios de imágenes). Crear PR con `gh` en español y detalle solicitado; no fusionarlo.

## Riesgos controlados

- El test de rutas debe ejecutar la app sin depender de Auth ni disponibilidad de Supabase.
- Los QR no incorporarán códigos de rescate real ni rutas `/p/` o `/perdidas/`.
- Las fotos se sirven públicamente; se comprueba la salida sin metadatos identificables y se excluye la imagen vetada.
- No se retira ni altera la cuenta local de prueba.
