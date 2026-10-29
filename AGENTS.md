# Colaboración en PawPass V2

La fuente de verdad funcional es [PAWPASS-V2-SPEC.md](PAWPASS-V2-SPEC.md). [PRODUCT.md](PRODUCT.md) resume la dirección del producto. PawPass V1 sirve como antecedente para evitar problemas, no como especificación heredada.

## Forma de trabajo acordada

- Trabajar por fases con alcance y criterios de aceptación claros. Cada fase de implementación tendrá su propio chat cuando se inicie; crear esos chats con **gpt-6-luna y razonamiento alto**.
- Las ramas de trabajo se nombran por su función, por ejemplo `feat/cuenta-mascotas` o `fix/contacto-qr`. **No usar `codex` en los nombres de ramas**.
- Escribir los mensajes de commit **en español** y con formato **Conventional Commits** (`tipo(alcance): descripción`). Al crear commits, aplicar la skill `git-commit`.
- Redactar los pull requests **en español y con detalle**: propósito, alcance, decisiones, cambios de datos o migraciones, pruebas realizadas, riesgos conocidos y capturas si cambió la interfaz.
- Mantener accesibilidad **WCAG 2.2 AA** y SEO como requisitos transversales. Verificar la privacidad antes de publicar o indexar páginas, metadatos, imágenes y archivos.
- En el diseño habitual, usar azul; reservar rojo para emergencias, pérdidas y alertas críticas. Pawgram es el nombre confirmado del espacio social futuro. Pawshot y Pawsnap siguen siendo candidatos para la función de fotos.

## Estado inicial

Este repositorio empieza con documentación. No iniciar la implementación de una fase por el mero hecho de preparar el repositorio; primero concretar su alcance con el autor.
