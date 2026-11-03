# Fase 4: calidad, seguridad, rendimiento y CI

## Alcance

Esta fase endurece los estados públicos, las operaciones de recuperación y eliminación, las pruebas automatizadas y la inspección de CSS por ruta. No modifica ni aplica migraciones y no accede a datos de producción.

## Cambios

- Las consultas públicas de mascotas y pérdidas distinguen una respuesta vacía o un registro inexistente de un fallo del backend. Los errores muestran estados de reintento y los fallos de lectura de una ficha no se convierten en un 404 engañoso.
- La recuperación cierra primero el aviso público. Si Storage no consigue borrar la foto, la ruta queda registrada para que una eliminación posterior pueda reintentarlo; la respuesta informa que el aviso está cerrado y la limpieza de archivo sigue pendiente.
- La eliminación de una mascota se detiene antes de borrar datos si falla cualquiera de las lecturas previas de relaciones o archivos.
- El workflow de GitHub Actions instala con `npm ci`, levanta Supabase local con datos de prueba, ejecuta pruebas de base y de interfaz y aplica permisos mínimos. No configura secretos de producción.
- Antes de iniciar Supabase, CI detiene cualquier stack residual con el mismo identificador de proyecto para evitar colisiones de puertos entre ejecuciones del runner.
- Hay tres E2E: demo pública segura, ficha de pérdida de demo sin acciones reales y acceso autenticado a mascotas privadas con protección de rutas. El tercero se ejecuta contra Supabase local en CI.
- El inventario de CSS cubre 21 rutas. El CSS por ruta se mide después de una compilación de producción y el script comprueba estilos faltantes y estilos de funciones ajenas.

## Mediciones CSS

La comparación se hizo con el mismo inventario y script antes y después de consolidar reglas repetidas. Los bytes únicos suman los archivos CSS emitidos una sola vez; «referencias» suma el tamaño de los CSS asociados a cada ruta y, por ello, incluye repeticiones compartidas.

| Métrica | Antes | Después | Cambio |
| --- | ---: | ---: | ---: |
| Rutas | 21 | 21 | 0 |
| Archivos CSS únicos | 17 | 17 | 0 |
| Bytes CSS únicos | 196,978 | 196,909 | −69 |
| Bytes únicos gzip | 50,900 | 50,885 | −15 |
| Referencias CSS acumuladas por ruta | 602,041 | 598,152 | −3,889 |
| Referencias repetidas | 405,063 | 401,243 | −3,820 |

No hubo estilos faltantes ni filtraciones entre funciones. El ahorro global en bytes únicos es pequeño; la consolidación elimina principalmente reglas repetidas en los chunks de ruta.

## Verificación

- `npm test`: 42 archivos y 155 pruebas aprobadas.
- `npm run lint`: aprobado.
- `npm run typecheck`: aprobado.
- `npm run build`: aprobado con Next.js 16.4.3 y webpack.
- `npm run audit:assets`: 21 rutas, cero estilos faltantes y cero estilos inesperados.
- `npm run test:e2e -- --list`: exactamente tres pruebas E2E.
- E2E público local: dos escenarios aprobados. El flujo de autenticación se incluye en CI porque requiere Supabase local y Docker no está disponible en este equipo.
- `npm audit --omit=dev`: cero vulnerabilidades de producción.
- `npm audit`: 16 avisos moderados en herramientas de desarrollo del árbol ESLint, relacionados con `minimatch` (DoS por amplificación de `globparts`, GHSA-g3hv-75wg-m249). No hay avisos altos o críticos. npm propone resolverlos con un downgrade mayor de ESLint a 4.0.0, por lo que no se aplicó una actualización automática incompatible.

## Riesgos y límites

- El borrado de filas y objetos en Supabase Storage no es una transacción única. Si se eliminan algunos objetos y después falla otra operación, pueden quedar referencias huérfanas. La política actual de borrado de documentos de salud exige que aún exista su fila; invertir el orden requiere revisar políticas y migraciones. La operación ahora falla con lecturas incompletas y la recuperación conserva la ruta fallida, pero no se afirma atomicidad total.
- No se ejecutó `supabase db reset` en el equipo local porque el daemon de Docker no está activo. CI levanta un stack efímero y prueba las migraciones y políticas locales desde cero.
- No se añadieron ni aplicaron migraciones; la base remota no se modificó.

## Ramas

Se actualizaron las referencias remotas antes de la limpieza y GitHub confirmó que no había PR abiertos. Se eliminaron local y remotamente estas 11 ramas completamente fusionadas: `docs/definir-pawgram`, `feat/alertas-cuidado`, `feat/alertas-perdida`, `feat/carnet-salud`, `feat/cartel-busqueda`, `feat/cierre-primera-version`, `feat/pawgram`, `feat/portada-publica-acceso`, `feat/rediseno-ux`, `refactor/base-visual-css` y `refactor/paginas-existentes`. También se eliminó localmente `feat/cuenta-mascotas`; esa referencia ya no existía en el remoto. Se conservaron `main`, la rama de trabajo actual y `feat/demo-mascotas-segura`, que era la rama activa al iniciar la fase.

