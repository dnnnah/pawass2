# Fase 2 — Alertas de cuidado

## Objetivo y límites

Permitir que el tutor registre alertas médicas o de temperamento, ajuste el nivel sugerido por catálogo y elija expresamente cuáles aparecen en la ficha pública QR. La selección pública incluirá la alerta y sus instrucciones de manejo. El resto permanece privado. Esta fase no implementa carnet completo, pérdida operativa ni cartel.

También alinea el inicio privado, las fichas de mascotas y la navegación con la sección 13 de `PAWPASS-V2-SPEC.md` y con `.superpowers/brainstorm/56993-1793234858/content/azul-rescate-06.html` más `paw-mark.svg`.

## Arquitectura

- Adoptar Módulos Verticales (Feature-Driven): `src/features/care-alerts` contendrá dominio, catálogo, acciones y componentes propios; `src/app` compone las rutas existentes.
- Mantener PostgreSQL como autoridad de persistencia. Una tabla de alertas privadas pertenecerá a una mascota y guardará su texto, severidad elegida y selección explícita para QR. El catálogo inicial con sugerencias vivirá en el módulo; `Otra` permitirá texto personalizado.
- Proteger las alertas con RLS por propietario de mascota. No conceder acceso anónimo a tablas ni a consultas generales de salud.
- Exponer al QR únicamente mediante una función RPC con contrato reducido y `SECURITY DEFINER` de lectura: código público válido, consentimiento QR activo, mascota vigente y filas marcadas `qr_visible`. La función no devolverá campos privados, identificadores internos ni metadatos del tutor. Revocar `EXECUTE` a `PUBLIC` y concederlo explícitamente a `anon` y `authenticated`.
- La UI de salud mostrará la sugerencia del catálogo, permitirá cambiarla antes de guardar y requerirá una elección separada para publicar en QR. La acción pública explicará que el texto e instrucciones serán visibles a cualquiera con el código.

## Catálogo inicial

El catálogo inicial, editable por el tutor por registro, cubrirá alergias, condiciones, medicación, cuidados y temperamento. Cada opción traerá una sugerencia (`critica`, `precaucion` o `informativa`), sin presentar esa sugerencia como recomendación veterinaria. La lista concreta se mantendrá en TypeScript para poder revisarla como contenido versionado; las alertas guardan la severidad elegida, no dependen en tiempo de lectura de la sugerencia vigente.

## Interfaz y estados

- Inicio privado: las mascotas aparecen primero, con fotografía cuando exista, nombre/código, estado habitual, CTA sólido «Reportar perdida» y acciones secundarias «Ver ficha» y «Mostrar QR». Como pérdida no está implementada todavía, el CTA se presenta como pendiente/inhabilitado sin fingir que crea una alerta.
- Las fotos reales del material de referencia no se copiarán a `public` ni se publicarán como ejemplos. Sin foto registrada, usar una composición de marca accesible; usar fotos de usuario solo desde el campo autorizado cuando esté disponible.
- Navegación móvil: «Mis mascotas», «Mascotas perdidas» y «Cuenta». El destino de pérdidas queda explícitamente pendiente de fase posterior y no enlaza a una experiencia que aparente estar operativa.
- Las acciones habituales son azules; el rojo queda para emergencias y alertas críticas. CTA sólido, secundario contorno, terciario texto. La gravedad no depende solo del color.
- La edición de alertas se encuentra en el contexto de mascota y mantiene la clasificación separada de la futura historia clínica completa.

## Accesibilidad, SEO y errores

- Etiquetas y errores asociados a campos, estados con nombre textual, foco visible, navegación por teclado, áreas táctiles adecuadas y semántica de lista/formulario.
- Las rutas privadas continúan con `noindex`. El QR habitual mantiene `noindex`; las alertas publicadas son visibles en el QR solicitado pero no habilitan indexación ni el tablón de pérdidas, aún fuera de alcance.
- Un QR inválido o no vigente mantiene el `notFound` actual. Si falla la lectura del módulo de alertas, no devolver nunca datos alternos ni ampliar permisos; registrar/mostrar la ausencia de datos con seguridad.

## Criterios de aceptación

1. El catálogo sugiere niveles críticos, de precaución e informativos; el tutor puede elegir otra severidad antes de guardar.
2. El tutor puede guardar alergia, condición, medicación, cuidado o temperamento, incluida la opción «Otra» con texto propio.
3. El estado `qr_visible` es explícito, independiente de la severidad. En QR solo aparecen las alertas optadas por el tutor, con sus instrucciones; ninguna fila no seleccionada llega a la respuesta pública.
4. RLS impide a otro tutor consultar, modificar o borrar las alertas. `anon` no puede consultar la tabla ni invocar funciones que devuelvan registros privados.
5. Las vistas de inicio, tarjetas y navegación mantienen la dirección visual aprobada y funcionan en móvil, escritorio y teclado.
6. «Mascotas perdidas» comunica que la función está pendiente. No se incorpora carnet completo, operación de pérdida ni cartel.

## Plan de implementación

1. Añadir pruebas unitarias de normalización/reglas y contrato de proyección pública; observar el fallo antes del código productivo.
2. Crear migración local con catálogo si se requiere almacenamiento, tabla de alertas, RLS, grants y RPC pública de mínimo privilegio; probar en Supabase local.
3. Implementar catálogo, validación, Server Actions y UI de alta/edición dentro de `care-alerts`.
4. Integrar la proyección de alertas con la ficha QR manteniendo su política `noindex`.
5. Ajustar dashboard, tarjetas, iconografía y navegación móvil; mantener el destino de pérdidas honesto y no operativo.
6. Verificar `npm test`, lint, TypeScript, build y Supabase local; revisar a mano la privacidad, teclado y capturas móvil/escritorio comparadas con la referencia aprobada.
7. Agrupar commits en español, Conventional Commits y normalmente menos de 400 líneas modificadas. Crear el PR apilado exclusivamente con `gh` CLI después del push.
