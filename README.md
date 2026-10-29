# PawPass V2

Aplicación modular en Next.js App Router + React + TypeScript estricto + Tailwind CSS. Supabase aporta Auth, PostgreSQL y Storage. La fase 3 amplía las cuentas, mascotas y QR con alertas de cuidado, pérdida, recuperación y tablón público. El cartel de búsqueda permanece en una fase posterior.

## Desarrollo local

Requisitos: Node.js 24 o posterior y npm.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Completa estas variables en `.env.local` con los valores del proyecto:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (por ejemplo `http://localhost:3000`)
- `SUPABASE_SERVICE_ROLE_KEY` (solo servidor; necesaria para firmar URL temporales de fotos privadas, eliminar una cuenta y habilitar el acceso rápido local a la cuenta de prueba; nunca uses el prefijo `NEXT_PUBLIC_`)

Las fichas QR llaman a una función SQL pública de alcance limitado que devuelve únicamente los campos de rescate autorizados para un código. Las tablas permanecen sin lectura anónima.

Las fotografías se convierten a WebP antes de subirlas a buckets privados. La aplicación solo genera enlaces firmados de una hora en páginas que pueden mostrarlas; al recuperar una mascota se borra su foto reciente.

## Configuración de Supabase

1. Crea un proyecto Supabase y ejecuta las migraciones locales con `npx supabase db push` después de enlazarlo. La base de PawPass de esta entrega ya tiene aplicadas las migraciones de la fase 1 y la función pública restringida para las fichas QR.
2. En Authentication → URL Configuration, registra como Site URL el dominio del despliegue y permite `/auth/callback` y `/auth/reset-password` como redirect URLs. En local, usa `http://localhost:3000` y `http://localhost:3000/auth/callback`.
3. En Authentication → Sign In / Providers, habilita Google y añade las credenciales OAuth de Google. Configura como URI de redirección de Google el callback de Supabase indicado por el Dashboard.
4. Configura SMTP para confirmación de correo y recuperación antes de producción. Supabase puede usar límites de correo bajos en proyectos de desarrollo.

Las migraciones crean el perfil vacío tras el registro, políticas RLS de propietario, reserva no reutilizable de códigos y `create_pet_with_code`, que valida identidad, perfil y consentimiento en una sola transacción. La ruta `/p/[code]` lee solo los campos de rescate necesarios desde el servidor; las tablas y códigos no se exponen a clientes públicos.

## Datos de prueba

`supabase/seed.sql` crea un usuario y dos mascotas ficticias para desarrollo y pruebas. Puedes cargarlos en la base local con `npm run db:reset` (requiere Docker y Supabase CLI). Este comando es local; no lo apuntes a producción.

La cuenta seed ficticia solo debe existir en Supabase local. En desarrollo, el acceso rápido se habilita en `localhost` mediante un enlace de un solo uso generado en el servidor. No hay contraseñas de prueba documentadas ni una cuenta de acceso rápido en proyectos remotos. Puedes eliminar la cuenta desde “Mi cuenta”.

## Rutas de esta fase

- `/`: registro, inicio de sesión, acceso Google y solicitud de recuperación; acceso rápido a la cuenta seed solo en desarrollo local.
- `/auth/callback`: intercambio de código OAuth/confirmación por sesión.
- `/auth/reset-password`: actualización de contraseña desde el enlace de recuperación.
- `/mascotas`: dashboard privado, QR, alta en tres pasos, contactos y controles de pérdida/recuperación.
- `/cuenta`: perfil privado y eliminación de cuenta.
- `/perdidas`: tablón público indexable de alertas activas.
- `/perdidas/PC-XXXXXX`: ficha indexable mientras la alerta siga activa.
- `/p/PC-XXXXXX`: ficha de rescate pública y no indexable.

Las fichas muestran teléfono y WhatsApp autorizados; no muestran apellidos, historial de salud, RUAC, archivos ni documentos. La geolocalización del visitante solo se solicita al presionar “Incluir mi ubicación actual”.

## Comprobaciones

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

## Organización

`src/features/auth`, `profile`, `pets`, `rescue`, `care-alerts` y `lost-pets` contienen sus flujos y acciones. `src/app` compone rutas; `src/lib` contiene reglas de dominio y clientes de infraestructura compartidos. El cartel de búsqueda y el carnet completo se definirán en fases posteriores.
