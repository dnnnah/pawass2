# Estado de fases — PawPass V2

Actualizado el 31 de octubre de 2026.

| Fase | Alcance | Estado |
|---|---|---|
| 1 y 2 | Cuenta, mascotas y alertas de cuidado | Implementadas en `main`. |
| 3 | Pérdida, tablón público y recuperación | Implementada según el estado de GitHub. |
| 4 | Carnet de salud privado por mascota | PR #6 integrado en `main`. |
| 5 | Cartel de búsqueda | Lista para revisión en PR desde `feat/cartel-busqueda`; sin migraciones de base de datos. |
| Cierre de primera versión | Accesibilidad, SEO, PWA y flujos completos | Siguiente fase, posterior a la revisión de fase 5. |
| Posterior | Pawgram | Fuera de la primera versión. |

## Fase 5 — Cartel de “Se busca”

- El generador aparece en la ficha privada mientras la alerta de pérdida está activa y haya foto, última zona vista y teléfono de llamadas. La foto reciente de la alerta tiene prioridad; si no existe, se usa la foto principal.
- El PNG ofrece 1080 × 1920 (9:16), 1440 × 1800 (4:5), 1275 × 1800 (A4) y 1275 × 1650 (carta). La foto ocupa una columna propia con recorte centrado; la otra reúne ubicación, hora, señas, hasta dos alertas de cuidado autorizadas y una nota para quien la encuentre. La recompensa y los contactos cierran el cartel junto al QR.
- Las alertas priorizan primero las críticas, luego las precauciones y al final las informativas, manteniendo el orden original dentro de cada prioridad. La nota admite hasta 120 caracteres. El número de llamada muestra la lada nacional cuando aplica; WhatsApp hereda el teléfono de la cuenta salvo que el tutor haya configurado otro.
- La ficha `/p/<código>` sigue siendo el destino del QR y muestra el estado vigente, incluido “Ya está en casa” durante el periodo de recuperación definido en la spec. El cartel advierte que el teléfono quedará visible en la imagen antes de exportarla.
- La descarga se habilita cuando la vista previa está lista. Compartir usa Web Share cuando el dispositivo admite adjuntar el PNG y, en caso contrario, indica cómo compartirlo desde Archivos o Fotos.
- El acceso al generador aparece en la tarjeta de una mascota perdida y en su ficha privada. La marca PawPass lleva a “Mis mascotas” para usuarios con sesión. Los cambios de alertas y contactos revalidan las fichas que muestran esos datos; las fotos privadas se firman con el cliente de Supabase de la petición.
- La ficha pública de pérdida comparte el encabezado de navegación y la presentación de la línea visual de la app. No se agregan migraciones ni cambios de esquema.
- El cartel mantiene descripción textual equivalente, controles accesibles y estados anunciados. Se conserva el azul mineral habitual y se reserva el rojo para la alerta activa y cuidados prioritarios.
- No incluye PDF, vista imprimible del carnet ni Pawgram.

## Verificación de fase 5

- [x] La vista previa del cartel 4:5 y la acción de descarga se revisaron en la cuenta local de prueba el 31 de octubre; el estado anunció “Descarga iniciada”.
- [x] `git diff --check` pasó el 31 de octubre.
- [x] No se requieren migraciones de base de datos.
- [x] Captura de revisión 4:5 con datos de la cuenta local de prueba: [`docs/ux-review/2026-10-31/cartel-busqueda-4x5.png`](ux-review/2026-10-31/cartel-busqueda-4x5.png).
- [ ] Repetir pruebas, typecheck, lint y build después de los ajustes visuales y funcionales del 31 de octubre; las 49 pruebas y el build indicados en la captura anterior corresponden a una revisión previa.
- [ ] Abrir el PR en español con GitHub CLI y dejarlo abierto para revisión del autor.
