# Fase 3/6: mascotas de ejemplo y demo segura

**Estado:** documento revisado y aprobado por el autor el 3 de noviembre de 2026.

## Objetivo

Publicar una demostración navegable y de solo lectura de PawPass con cinco fichas completas adicionales a la cuenta local de prueba: tres gatos y dos perros. Una ficha muestra un caso de pérdida ficticio y un cartel ilustrativo. La demo permite conocer el producto sin crear otra cuenta ni dar acceso a datos o acciones de producción.

Las fotografías proceden de una carpeta local autorizada por el autor para esta demo. Se usarán exactamente cinco: tres gatos y dos perros; las dos fotos de perro seleccionadas tienen nombre de origen con P inicial. Se excluye la imagen que el autor vetó. Los nombres, identidades, cuidados, contactos de muestra, expedientes y documentos asociados a las fotografías serán ficticios; no se asociará el nombre original de archivo con la ficha ni se conservará su ruta. Las imágenes se copiarán con nombres neutros y se optimizarán sin metadatos EXIF.

## Enfoque

### Aislamiento y fuente de datos

- Mantener todo el módulo bajo `src/features/demo`. El catálogo tipado será la fuente canónica para rutas, fichas y pruebas.
- Servir `/demo`, `/demo/mascotas/[slug]` y `/demo/codigo/[code]` desde el catálogo estático como Server Components. El código de ejemplo resuelve a una ruta de demo; no se consultan sesiones, tablas, Storage, Pawgram, rutas QR reales ni acciones existentes.
- No crear una semilla de base de datos para esta demo: la fuente estática cubre las rutas públicas y las pruebas. No se insertan registros en Supabase ni se modifica `supabase/seed.sql`, la cuenta de prueba o sus datos.
- No agregar Server Actions, formularios de edición, endpoints de mutación ni botones de contacto a este módulo. No hay cliente Supabase ni clave privilegiada en la ruta.
- La ficha de pérdida y el cartel serán componentes propios de demo. No reutilizarán componentes que creen enlaces `tel:`/WhatsApp, recuperación, QR de rescate o edición de reportes.

### Contrato del catálogo

Cada mascota tendrá alias ficticio, especie, raza o mezcla, sexo, edad, color, tamaño, imagen autorizada, descripción de carácter y cuidados generales de muestra. Cada ficha incluirá bloques privados de ejemplo para vacunas, desparasitación, intervención y documentos clasificados. Todo el historial y cada documento llevarán una etiqueta visible de “Ejemplo simulado · sin valor clínico”; los documentos serán tarjetas descriptivas, no archivos clínicos descargables.

La distribución será fija:

| Alias demo | Especie | Pérdida |
| --- | --- | --- |
| Bimba | Perro | No |
| Tacho | Perro | Sí |
| Menta | Gato | No |
| Cosmo | Gato | No |
| Nori | Gato | No |

Los alias son inventados y no dependen de los nombres de archivo. La imagen del perro Tacho acompaña el caso de pérdida ficticio; el texto explicará que la foto está autorizada y el reporte completo es inventado. No se incluirán números, correos, perfiles, direcciones o ubicaciones personales. El contacto del cartel dirá que el canal está deshabilitado y que nadie debe llamar, escribir o iniciar una búsqueda real.

### Rutas, navegación y visibilidad

- `/demo` presenta la condición de demostración antes de mostrar las cinco fichas.
- `/demo/mascotas/[slug]` presenta identidad, fotografía, cuidados y carnet de ejemplo.
- `/demo/codigo/[code]` es el destino visible de códigos/QR demo y vuelve a mostrar el aviso de ficción. Todo QR codificará una URL bajo `/demo/codigo/`.
- La sección perdida mostrará especie, código `DEMO-*`, última fecha y zona inventadas, señas particulares, mensaje y alertas de cuidado de ejemplo, recompensa informativa ficticia y cartel con aviso de demostración. No ofrecerá contacto ni publicación/descarga que pueda confundirse con una búsqueda real.
- La página principal y la navegación global enlazarán a `/demo` con el rótulo “Explorar demo”. El enlace es una navegación interna, no una acción sobre la ficha.
- Las páginas tendrán `noindex`, `nofollow` y `noarchive`. `src/app/sitemap.ts` no añadirá rutas demo. La demo no consulta ni cambia `/perdidas`, su RPC, el feed ni las publicaciones de Pawgram.
- El diseño seguirá la identidad existente: fondo mineral, azul para navegación y acciones internas, rojo solo para distinguir el estado ficticio de pérdida, fotos sin recorte y jerarquía de contenido accesible.

## Criterios verificables

1. El catálogo contiene exactamente cinco fichas: dos perros, tres gatos y exactamente una ficha marcada como perdida.
2. Los cinco archivos servidos corresponden a las imágenes autorizadas seleccionadas, con nombres de destino neutros y sin metadatos identificables.
3. Cada ficha muestra identidad, foto, cuidados y los cuatro grupos del carnet; cada dato de salud y documento se identifica como simulado.
4. La pérdida incluye el conjunto completo de datos de búsqueda de demo y un cartel claramente ficticio; el aviso dice que no requiere ayuda real.
5. Las rutas y el QR resuelven únicamente a `/demo/...`. El HTML no ofrece enlaces `tel:`, WhatsApp, correo real, envío de formularios ni controles de escritura.
6. No existe llamada a Auth, RPC, tablas o Storage desde `src/features/demo`; tampoco hay cambios a migraciones, datos de producción o seed local.
7. `/perdidas`, sitemap y Pawgram no contienen las fichas de demo. Las páginas demo llevan directivas de robots que se pueden leer en el HTML renderizado.
8. Las pruebas de dominio verifican conteos, estados y destinos de demo; las pruebas de interfaz comprueban los avisos, la navegación y la ausencia de acciones de contacto/escritura.
9. La revisión manual cubre teclado, foco, lector/semántica, anchura móvil de 390 px y escritorio. Se ejecutan tests, lint, typecheck y build; se guardan capturas visuales de ambas anchuras.

## Límites y riesgos

La demo será pública y sus fotografías podrán copiarse. El `noindex` reduce la indexación por rastreadores cooperativos, pero no hace privada la ruta. Por ello, la página avisará que es una demostración y solo expondrá perfiles sintéticos y fotos autorizadas, procesadas para quitar metadatos. El reporte y el cartel no pueden activar una llamada, mensaje, recuperación ni ficha real.

## Fuera de alcance

No se borra ni cambia la cuenta de prueba local; no se crean datos demo en la base remota ni seeds adicionales; no se usa service role; no se habilita Google OAuth, despliegue ni limpieza general de documentación; no se reabre el contrato de Pawgram y no se habilita el cartel de búsqueda real de usuarios.
