# Implementación — Fase 1: cuenta y mascotas

## Objetivo

Entregar la base PawPass V2 con autenticación, perfil obligatorio del tutor, alta rápida de perro/gato y ficha pública QR disponible inmediatamente tras consentimiento. El expediente no se expone y los módulos de salud, pérdida, cartel y carnet quedan fuera de esta fase.

## Decisiones técnicas confirmadas contra `PAWPASS-V2-SPEC.md`

- Next.js App Router, React, TypeScript estricto y Tailwind CSS; Supabase Auth/Postgres.
- `profiles`: identidad mínima, teléfonos de llamada y WhatsApp normalizados a E.164.
- `pets`: dueño, nombre, especie, foto principal opcional y excepción de contacto por mascota.
- `public_code_reservations`: `PC-XXXXXX` como clave primaria; FK a mascota con `ON DELETE SET NULL`, así se retira la ficha y se reserva el código sin datos personales.
- RPC transaccional de creación: exige `auth.uid()`, perfil completo y consentimiento explícito; genera código con alfabeto legible y reintenta colisiones por restricción única.
- La ficha QR llama una función SQL pública y limitada que solo proyecta código, nombre, especie y teléfonos efectivos. No concede acceso anon directo a tablas; no incluye apellidos, expediente, documentos ni RUAC.
- Las filas de perfil y mascota usan RLS de propietario. El código reservado no es consultable directamente por clientes.
- `/` acceso/registro, `/auth/callback`, `/cuenta` gestión privada, `/p/[code]` QR público. `/cuenta` noindex; QR habitual noindex; se excluye el código de `robots.txt` para que crawlers puedan leer su meta noindex.
- Excepción de contacto guarda un par llamada/WhatsApp en mascota; desactivada, la ficha resuelve siempre los contactos vigentes del perfil.

## Plan y aceptación

- [x] Validar formato de códigos, teléfono, consentimiento, redirecciones y resolución de herencia/excepción con pruebas unitarias.
- [x] Crear app App Router, formularios accesibles de Auth/perfil/mascota, server actions y utilidades SSR de Supabase.
- [x] Añadir migraciones con constraints, RLS y reserva de códigos única/no reutilizable; el RPC valida autenticación, perfil y consentimiento.
- [x] Implementar ficha QR SSR con contacto, canonical y noindex; páginas privadas noindex.
- [x] Documentar despliegue, variables, Google OAuth, correo transaccional y cuenta seed de prueba.
- [x] Verificar pruebas unitarias, TypeScript, lint y build.

## Riesgos y configuraciones externas

- Las migraciones y los datos seed de prueba ya están en el proyecto PawPass. La aplicación local necesita URL + publishable key.
- La función RPC de ficha pública es `SECURITY DEFINER` para consultar tablas protegidas por RLS, pero devuelve solo los campos expresamente autorizados por el código QR.
- Google OAuth debe habilitarse en Supabase y registrar la URL de callback del despliegue.
- Producción necesita configurar SMTP para confirmación y recuperación de correo.
- La aceptación crea una ficha accesible a cualquiera que tenga el código y publica los números de contacto del tutor o su excepción; la UI debe advertirlo antes de guardar.
- La política de borrado de cuentas, archivos, verificación de correo y los catálogos de países son configuración/alcance a completar en fases posteriores.
