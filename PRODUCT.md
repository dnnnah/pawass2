# Producto PawPass V2

<!-- impeccable:product-schema 1 -->

## Plataforma

web

## Stack

Aplicación PWA modular con **React, Next.js App Router, TypeScript estricto y Tailwind CSS**. Supabase provee Auth, PostgreSQL y Storage. Inicio de sesión por correo y contraseña o Google OAuth. Elección confirmada por el autor.

## Usuarios

El usuario principal es el tutor de uno o más perros o gatos. Registra datos de cuidado y necesita que una persona que encuentre a su mascota pueda identificarla y contactarlo desde una placa QR. Una persona sin cuenta puede abrir la ficha de rescate o consultar el tablón de mascotas perdidas.

## Propósito del producto

Centralizar información privada de la mascota y acelerar su recuperación si se extravía. La ficha QR funciona desde que se crea la mascota; el tutor puede publicar una alerta inmediatamente y generar un cartel cuando haya foto y ubicación.

## Contexto de uso

La ficha QR se consulta en un navegador móvil sin instalar la PWA. La PWA puede instalarse, pero los datos requieren conexión. El cartel se comparte como imagen o se imprime en A4 o carta para colocarlo en la calle.

## Capacidades y límites

La primera versión incluye cuenta, mascotas, alertas de cuidado, QR, pérdidas, tablón, cartel y carnet privado. La comunidad de mascotas públicas, **Pawgram**, se desarrollará después y será voluntaria. **Pawshot** y **Pawsnap** son nombres candidatos, aún sin elegir, para la función de subir una foto nueva o reciente. No hay adopciones, refugios, chat, pagos, rastreo en tiempo real ni carnet imprimible.

La aplicación está abierta a tutores de cualquier país y no los divide por país. El contenido inicial de los catálogos de salud se enfoca en México; los números de contacto aceptan ladas internacionales. Los documentos y el historial clínico completo son privados. Las rutas públicas reciben solo información autorizada.

## Compromisos de marca

El nombre confirmado es PawPass. El idioma inicial es español. La dirección visual aprobada conserva la referencia azul mineral con fondo blanco, superficies pastel alternas y detalles azules, violetas, cian y cobalto, texto azul oscuro y fotografías protagonistas completas, sin recorte. Nunito Sans Variable se autoaloja mediante npm. La personalidad combina 75% profesional y 25% juguetón, con mensajes cálidos personalizados y figuras visibles de huella, estrella, collar, perro, gato y corazón. El logo coloca la huellita después de “pawpass”. Azul identifica las acciones habituales, incluido WhatsApp aun durante una pérdida; rojo se reserva para pérdidas, emergencias y alertas críticas. La jerarquía de acciones es sólido, contorno y texto; no se usan verde ni amarillo como colores propios de interfaz. El botón de Google conserva su marca oficial multicolor autoalojada como excepción de identidad externa. Un único pie global comparte la marca, las figuras decorativas y un mensaje cálido en toda la aplicación. La navegación principal usa menú hamburguesa en todas las anchuras.

## Evidencia disponible

La fuente de verdad funcional es [PAWPASS-V2-SPEC.md](PAWPASS-V2-SPEC.md), aprobada por bloques por el autor. PawPass anterior sirve como antecedente de problemas de alcance y arquitectura; sus decisiones visuales y técnicas no son autoridad para V2. No se han aportado métricas de uso, testimonios ni activos visuales aprobados para V2.

## Principios de producto

1. Hacer posible el contacto de rescate con rapidez desde el QR.
2. Mantener privado el expediente y publicar solo los datos autorizados.
3. Permitir registrar una mascota y activar una alerta con pocos datos, completándolos después.
4. Resolver los flujos principales antes de ampliar el producto con funciones sociales.
5. Diseñar y verificar accesibilidad WCAG 2.2 AA y SEO desde la primera versión, sin exponer datos privados en páginas indexables.

## Fase 3 aprobada

La fase 3 implementa el modo mascota perdida, el QR con estado de pérdida, el tablón público `/perdidas`, el flujo de recuperación y el aviso “Ya está en casa” durante 30 días. El cartel de búsqueda no forma parte de esta fase.

La experiencia mantiene azul mineral para tareas habituales, neutros para estados informativos y rojo solo para pérdida, emergencia y alertas críticas. La jerarquía de acciones es sólido, contorno y texto. La huella va después de “pawpass”; “Mi cuenta” es independiente del panel “Mis mascotas”. El alta aparece por elección y tiene tres pasos, con nombre, especie y consentimiento público en el primero; los detalles y contactos son opcionales y aplazables. Llamadas y WhatsApp comparten número por defecto.

Los flujos de eliminación de mascota y cuenta requieren dos confirmaciones, limpian datos y archivos asociados y preservan la reserva anónima del código público. El acceso rápido a la cuenta de prueba existe únicamente en desarrollo local, sin credenciales públicas ni secretos cliente.

El acceso y el cambio de contraseña permiten revelar el texto con un control de mostrar/ocultar. Durante el registro, el tutor repite su contraseña y el formulario detecta discrepancias antes de enviar.
