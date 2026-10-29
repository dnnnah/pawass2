# Colaboración en PawPass V2

La fuente de verdad funcional es [PAWPASS-V2-SPEC.md](PAWPASS-V2-SPEC.md). [PRODUCT.md](PRODUCT.md) resume la dirección del producto. PawPass V1 sirve como antecedente para evitar problemas, no como especificación heredada.

## Forma de trabajo acordada

- Trabajar por fases con alcance y criterios de aceptación claros. Cada fase de implementación tendrá su propio chat cuando se inicie; crear esos chats con **gpt-6-luna y razonamiento alto**.
- Organizar el código por **Módulos Verticales (Feature-Driven)**: cada capacidad de producto reúne sus componentes, acciones, reglas de dominio y contratos de datos bajo `src/features/<modulo>`. `src/app` compone rutas desde esos módulos; evitar carpetas globales por tipo para lógica específica de una función.
- Las ramas de trabajo se nombran por su función, por ejemplo `feat/cuenta-mascotas` o `fix/contacto-qr`. **No usar `codex` en los nombres de ramas**.
- Escribir los mensajes de commit **en español** y con formato **Conventional Commits** (`tipo(alcance): descripción`). Al crear commits, aplicar la skill `git-commit`.
- Procurar que cada commit tenga como máximo **400 líneas modificadas** (adiciones + eliminaciones), separando cambios por unidad funcional cuando sea viable. Se permiten excepciones cuando el alcance o la cohesión técnica lo justifiquen.
- Redactar los pull requests **en español y con detalle**: propósito, alcance, decisiones, cambios de datos o migraciones, pruebas realizadas, riesgos conocidos y capturas si cambió la interfaz.
- Crear todos los pull requests mediante **GitHub CLI (`gh`)**; no crearlos desde la interfaz web.
- Mantener como referencia visual aprobada el HTML local `.superpowers/brainstorm/56993-1793234858/content/azul-rescate-06.html` y su `paw-mark.svg`, junto con la sección 13 de `PAWPASS-V2-SPEC.md`. La maqueta guía la continuidad visual; no sustituye los requisitos funcionales ni de accesibilidad.
- Mantener accesibilidad **WCAG 2.2 AA** y SEO como requisitos transversales. Verificar la privacidad antes de publicar o indexar páginas, metadatos, imágenes y archivos.
- Para la fase 3, el alcance implementable es modo mascota perdida, ficha pública de pérdida, tablón `/perdidas`, recuperación y aviso “Ya está en casa” por 30 días. El cartel de búsqueda pertenece a una fase posterior.
- La interfaz habitual usa azul mineral, estados neutrales y jerarquía de acciones sólido / contorno / texto. No usar verde ni amarillo como colores de interfaz; rojo solo para pérdidas, emergencias y alertas críticas. WhatsApp mantiene una acción azul de marca.
- El logo coloca la huellita después de “pawpass”. “Mi cuenta” es una página dedicada. El alta solo se muestra al elegir agregar y se divide en tres pasos: alta básica con consentimiento, detalles opcionales y contactos/visibilidad opcionales; los dos últimos se pueden aplazar.
- Llamadas y WhatsApp heredan el mismo teléfono de la cuenta por defecto. Solo se separan cuando el tutor elige explícitamente otro número.
- La eliminación de mascota y cuenta necesita doble confirmación, limpia registros y archivos y mantiene la reserva técnica del código público sin datos identificables.
- El acceso rápido de la cuenta de prueba solo aparece en desarrollo local; nunca se habilita públicamente ni usa secretos incrustados en cliente. La cuenta es temporal y eliminable.
- En registro se solicita repetir la contraseña y se valida la coincidencia antes del envío; los campos de contraseña admiten mostrar/ocultar con controles accesibles.
- En el diseño habitual, usar azul; reservar rojo para emergencias, pérdidas y alertas críticas. Pawgram es el nombre confirmado del espacio social futuro. Pawshot y Pawsnap siguen siendo candidatos para la función de fotos.

## Estado de fase

Las fases 1 y 2 están implementadas y fusionadas según el estado actual de GitHub. La fase 3 tiene alcance aprobado en `PAWPASS-V2-SPEC.md` y en `docs/superpowers/specs/2026-10-28-fase-3-mascota-perdida-y-cuenta-design.md`. El cartel de búsqueda sigue reservado para su fase posterior.
