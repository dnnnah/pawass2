# Fase 3 — Pérdida, recuperación y mejora de cuenta/mascotas

## Objetivo

Completar el ciclo de recuperación de una mascota y corregir la experiencia privada de cuentas y mascotas antes de cerrar esta fase. El cartel de búsqueda permanece fuera de alcance.

## Producto y rutas

- `/mascotas`: dashboard privado con tarjetas rediseñadas, estado “En casa” o “Perdida”, acceso al QR y controles del episodio activo. “Agregar mascota” revela el alta en tres pasos; el formulario está cerrado inicialmente.
- Alta: (1) nombre, especie y consentimiento informado para crear inmediatamente el QR; (2) raza, mezcla opcional, sexo, talla, color y fecha de nacimiento o edad aproximada; (3) detalles opcionales y contactos de rescate. Los pasos 2 y 3 se pueden omitir al crear y completar desde la ficha privada.
- `/cuenta`: página dedicada para identidad, teléfonos y privacidad, con zona de eliminación de cuenta separada del contenido de mascotas.
- `/perdidas`: tablón público con filtro de especie y búsqueda por ubicación escrita. Solo muestra alertas activas.
- `/perdidas/[code]`: detalle público indexable mientras la alerta está activa. Comparte identidad y contactos permitidos, datos del extravío y alertas ya autorizadas para QR. No incluye historial médico ni nombres de tutores.
- `/p/[code]`: QR único noindex. Si hay pérdida, presenta franja roja y enlace al detalle; si la mascota volvió a casa, presenta aviso de recuperación durante 30 días.
- Recuperar desde la cuenta requiere acción explícita; retira el episodio del tablón y conserva historial privado.

## Datos y seguridad

- La migración extiende `pets` con atributos opcionales de identidad y crea `lost_pet_reports`, con episodios históricos y un índice único parcial para limitar una pérdida activa por mascota.
- RLS permite operaciones autenticadas solo al tutor propietario. Anon no recibe acceso directo a tablas.
- Las RPC públicas tienen argumentos acotados y proyecciones explícitas; solo leen pérdida activa y alertas marcadas `qr_visible`. La búsqueda queda acotada a texto de ubicación y especie.
- El QR habitual y la recuperación no se indexan. `/perdidas` y detalles activos sí pueden indexarse. Al recuperar, el detalle desaparece de la consulta pública y del sitemap.
- Eliminar mascota elimina registros relacionados y archivos referenciados mediante Storage API. El FK de `public_code_reservations` deja `pet_id = null`, conservando el código sin vínculo identificable.
- Eliminar cuenta requiere cliente Admin con `SUPABASE_SERVICE_ROLE_KEY` solo servidor, primero limpia archivos referenciados y después elimina el usuario para que las cascadas de datos preserven los códigos anónimos.

## UX visual y accesibilidad

- Heredar la maqueta aprobada `azul-rescate-06.html`: azul mineral y superficies claras en flujos habituales, rojo limitado a pérdida/urgencias/crítico, neutrales para el resto; acción primaria sólida, secundaria de contorno y terciaria de texto.
- No usar verdes o amarillos de estado. WhatsApp mantiene el azul PawPass.
- Logo en orden palabra y huella. Mi cuenta tiene una composición independiente.
- Teléfono de llamadas y WhatsApp comparten valor por defecto. Solo se muestra el segundo campo al elegir un número distinto.
- Fichas con una cabecera visual de mascota, código y estado, acciones principales y detalles distribuidos por secciones; editor en contexto, no formulario genérico sin jerarquía.
- Controles accesibles por teclado y táctiles, estados anunciados, contraste WCAG 2.2 AA, reflujo en móvil y movimiento reducido.

## Acceso rápido de prueba

- La cuenta de prueba seed conserva un nombre corto y usa solo datos ficticios.
- El botón “Entrar a la cuenta de prueba” aparece únicamente en `NODE_ENV=development` cuando la URL de Supabase es localhost/127.0.0.1.
- El servidor genera un magic link de una sola vez mediante el cliente Admin privado y redirige por el callback normal. Ninguna clave o contraseña llega al navegador.
- La cuenta se elimina mediante la página “Mi cuenta” y no se crea ni activa en proyectos remotos.
- El acceso y cambio de contraseña ofrecen un control accesible para mostrar/ocultar; el registro exige repetir la contraseña y valida la coincidencia antes de enviar.

## Verificación

- TDD para normalización del reporte, periodo de recuperación, proyección pública, edad exacta/aproximada y número compartido por defecto.
- Pruebas SQL para RLS, grants, proyección y reserva de código; revisar la migración sin aplicarla a la base remota existente.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` y revisión visual de escritorio/móvil.
- PR de fase 3 desde `feat/alertas-perdida`; fases anteriores ya fusionadas según GitHub, pero no se crean merges.
