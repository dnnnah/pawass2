# Estado de fases — PawPass V2

Actualizado el 29 de octubre de 2026.

| Fase | Alcance | Estado |
|---|---|---|
| 1 y 2 | Cuenta, mascotas y alertas de cuidado | Implementadas en `main`. |
| 3 | Pérdida, tablón público y recuperación | Implementada según el estado de GitHub. |
| 4 | Carnet de salud privado por mascota | PR #6 integrado en `main`. |
| 5 | Cartel de búsqueda | Implementación lista para revisión en `feat/cartel-busqueda`; sin migraciones de base de datos. |
| Cierre de primera versión | Accesibilidad, SEO, PWA y flujos completos | Siguiente fase, posterior a la revisión de fase 5. |
| Posterior | Pawgram | Fuera de la primera versión. |

## Fase 5 — Cartel de “Se busca”

- Se habilita dentro de la ficha privada solo durante una pérdida activa, cuando hay una foto disponible, última zona vista y teléfono de rescate.
- La foto reciente de la alerta tiene prioridad; si no existe, se usa la foto principal de la mascota. Las alertas incluidas son únicamente las marcadas para el QR.
- Genera PNG de 1080 × 1920 (9:16), 1440 × 1800 (4:5), 1275 × 1800 (A4) y 1275 × 1650 (carta), con foto completa, datos de búsqueda, teléfono escrito y QR a `/p/<código>`.
- El tutor confirma que acepta publicar el teléfono antes de descargar, compartir o imprimir. La descarga funciona siempre; compartir usa Web Share cuando el dispositivo puede adjuntar el PNG y, en caso contrario, indica cómo compartirlo desde Archivos o Fotos.
- La ficha `/p/<código>` sigue siendo el destino del QR y muestra el estado vigente, incluido “Ya está en casa” durante el periodo de recuperación definido en la spec.
- El cartel tiene descripción textual equivalente, controles con nombre accesible, estados anunciados y composición adaptable. Se conserva el azul mineral habitual y el rojo para urgencia.
- No incluye PDF, vista imprimible del carnet ni Pawgram.

## Verificación de fase 5

- [x] Pruebas de dominio para elegibilidad, proporciones y ruta del QR.
- [x] Revisión visual en móvil y escritorio con datos ficticios.
- [x] Descargar y comprobar los cuatro tamaños PNG.
- [x] Decodificar el QR del PNG y verificar que abre la ruta de rescate.
- [x] `npm test` (49 pruebas), `npm run typecheck`, `npm run lint` y `npm run build` en una copia aislada del repo para proteger `next-env.d.ts`.
- [ ] Crear PR en español con GitHub CLI; dejarlo abierto para revisión del autor.
