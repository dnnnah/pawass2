# Plan de implementación — Fase 4: carnet privado

## Objetivo

Implementar el carnet privado de salud por mascota en `feat/carnet-salud` desde el commit más reciente de `origin/main`, sin cartel ni Pawgram.

## Dependencias y riesgos

- Al inicio, el proyecto remoto `nmjciiywuyldhkrzsxks` reportaba solo las tres migraciones base mientras el repositorio ya tenía fases 2/3. Las migraciones pendientes son aditivas y se aplicarán en orden, sin resets ni operaciones de borrado.
- Historial remoto después de aplicar el esquema: `20261029165514_care_alerts`, `20261029165519_modo_mascota_perdida` y `20261029165524_fase_4_carnet_privado`; los nombres locales se alinearon con esas versiones.
- El usuario autorizó el proyecto remoto. El CLI no tiene `SUPABASE_ACCESS_TOKEN`, pero el MCP está conectado. La secuencia revisada se aplicó sin reset ni cambios a filas existentes.
- La cuenta seed de producción no debe convertirse en entorno de prueba. Preferir seed local aislado; si el acceso a la cuenta que contiene requiere red remota o uso de registros existentes, detenerse antes de mutar datos.
- Bucket de documentos privado y RLS en tabla y Storage deben autorizar por propietario, no solo por autenticación.

## Tareas ordenadas

### 1. Conciliación de esquema y base local

- [x] Comparar los SQL locales de fase 2/3 con las migraciones registradas y tablas remotas. Identificar secuencia pendiente y dependencias.
- [x] Verificar disponibilidad de Supabase local; Docker no tiene daemon disponible, así que no se pudo levantar instancia.
- [x] Confirmar historial remoto de 3 migraciones y ausencia de tablas fase 2, 3 y 4; comparar SQL aditivo para aplicar fases 2/3/4 en orden.
- Aceptación: desfase y limitación local documentados; no ejecutar reset remoto.

### 2. Dominio y reglas de dosis (TDD)

- [x] Agregar pruebas RED para los estados `sin información`, `sin próxima fecha`, `vencida`, `próxima a vencer` en días 0–30 y `al día` después del día 30.
- [x] Probar fechas sugeridas sin confirmación, fecha manual confirmada, catálogo por especie, “Otra” y entradas inválidas.
- [x] Implementar dominio mínimo para poner verdes las pruebas sin inferir vencimiento.
- Verificar: `npm test -- tests/health-record.test.ts` (15 pruebas verdes).

### 3. Persistencia privada

- [x] Elegir modelo de tablas con constraints de fecha/tipo, FK cascades, índices por mascota y grants mínimos.
- [x] Crear migración Supabase con bucket privado, MIME/tamaño acordados, políticas por propietario y asociación de objeto.
- [x] Agregar pruebas SQL pgTAP de RLS, privilegios, bucket privado y lectura cruzada.
- [ ] Ejecutar pgTAP local; bloqueado por Docker no disponible. Los advisors remotos no reportan problemas nuevos de permisos/RLS del carnet; los índices sin uso son esperables en tablas nuevas.

### 4. Acciones del servidor y archivos

- [x] Implementar CRUD autenticado de vacunas, desparasitaciones y procedimientos bajo `src/features/health-record`.
- [x] Subir y borrar archivos con Storage API; guardar ruta privada y metadatos sin URLs.
- [x] Servir descargas con ruta autenticada tras comprobar sesión, propiedad y referencia al objeto. Aplicar allowlist MIME/tamaño y nombres seguros.
- Verificar: tablas, RLS, grants, bucket privado y políticas confirmados en el proyecto remoto. pgTAP no está instalado allí; el smoke test transaccional agotó el tiempo y se comprobó que no dejó filas.

### 5. Carnet y accesos

- [x] Crear `/mascotas/[id]/carnet`, privado, dinámico y noindex, con chequeo de propiedad y estados vacíos.
- [x] Construir formularios por categoría, confirmación visible de próxima fecha y edición/borrado.
- [x] Agregar enlaces desde la ficha/editor y tarjeta/lista de cada mascota.
- Verificar: el detector Impeccable se ejecutó. La vista privada redirige al login sin sesión; inspección visual autenticada y pruebas de foco/teclado/lector siguen pendientes por falta de entorno local seed.

### 6. Pruebas de integración y regresión

- [ ] Seed local con tutores A/B y mascota del tutor A; completar recorrido de carnet. Bloqueado porque Docker no tiene daemon y `.env.local` solo apunta al remoto sin credenciales de prueba.
- [x] Revisar que las funciones RPC públicas no leen tablas del carnet; el expediente se consulta solo desde rutas autenticadas.
- [x] Ejecutar pruebas completas, typecheck, lint y build.
- [ ] Abrir capturas autenticadas de móvil/escritorio y probar navegación de teclado/lector de pantalla. El detector se ejecutó; sus hallazgos fueron avisos de tokens de color/tipografía/radio.

### 7. Entrega

- [x] Actualizar spec, PRODUCT.md y AGENTS.md con decisiones finales, límites, y orden fase 4/5/cierre/Pawgram.
- [ ] Commits en español, Conventional Commits y menos de 400 líneas modificadas cuando la cohesión lo permita; justificar excepciones en el cuerpo.
- [ ] Crear PR en español con `gh`, resumen de datos/migraciones, pruebas, privacidad, riesgos y capturas. No fusionar.

## Comandos de verificación

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Las pruebas pgTAP deben ejecutarse en Supabase local. Las migraciones autorizadas se aplicaron al proyecto remoto tras revisar el desfase; no usar `supabase db reset` ni comandos destructivos contra `nmjciiywuyldhkrzsxks`.
