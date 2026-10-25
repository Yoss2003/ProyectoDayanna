# Exploradores Espaciales — React + TypeScript

Proyecto limpio de una web educativa para niñas y niños de aproximadamente 5 años.

## Inicio rápido

Requisitos: Node.js 20.19+ o 22.12+, npm y un editor (por ejemplo, VS Code).

```bash
npm install
npm run dev
```

Abre la URL indicada por Vite, generalmente <http://localhost:5173>.

Para comprobar el proyecto antes de publicarlo:

```bash
npm run build
npm run preview
```

## Qué se conserva

- **Pantalla de entrada**, con el astronauta original, el nombre temporal y elección de avatar.
- **Menú principal y tarjetas de misiones**: se reutilizan los estilos originales `src/styles.css`.
- No hay inicio de sesión, correos, servidores ni base de datos. El perfil y las estrellas se almacenan solamente en `sessionStorage` hasta que el usuario abandona la sesión o pulsa Salir.

## Misión 1: ¡Cultiva una planta!

- Completamente reescrita como juego de **imágenes estáticas**.
- Cuatro etapas y **12 decisiones posibles**.
- Cada decisión muestra una imagen PNG y reproduce un **efecto sonoro WAV diferente** (creación sintética original, no una grabación real).
- Si el niño acierta, aparece una explicación y puede pasar a la siguiente etapa.
- Si falla, aparece la explicación de la consecuencia y puede comenzar de nuevo.
- Al completar las cuatro etapas se otorga una estrella temporal.
- Se puede silenciar el juego y reproducir el sonido seleccionado de nuevo.
- Las ilustraciones se encuentran en `public/plant/`.
- Los 12 audios están en `public/sounds/plant/`.

## Otras misiones

La nave, sonidos, lonchera e historia se mantienen como **prototipos funcionales**. Las misiones 3, 4, 5 y 7 **no tienen aún especificaciones educativas**: aparecen en el menú, pero están deshabilitadas deliberadamente. No se han inventado sus contenidos.

## Carpetas

```
public/
  astronauta.png          # Logo original
  plant/                  # Las 12 ilustraciones sin texto ni caras
  sounds/plant/           # 12 sonidos sintetizados
src/
  App.tsx                 # Pantalla inicial, menú, navegación, estrellas
  styles.css              # Estética original (con pequeña adaptación)
  data/missions.ts        # Catálogo oficial y estados de misiones
  games/PlantGame.tsx     # Misión de planta (reescrita)
  games/PlantGame.css     # Diseño nuevo de la misión de planta
  games/OtherGames.tsx    # Prototipos de otras misiones
  lib/session.ts          # Perfil y progreso temporal
  lib/voice.ts            # Instrucciones mediante voz del navegador
```

## Notas técnicas

- Se eligió `React + TypeScript + Vite`, sin dependencias extra para animaciones.
- Los audios usan `new Audio()` al pulsar una opción, compatible con las restricciones habituales de reproducción en móviles.
- Si el dispositivo está silenciado, el juego sigue funcionando sin audio.
- Los personajes y las imágenes solo se muestran; no se realiza seguimiento de los niños en línea.
- El estado temporal de la sesión puede sobrevivir a una recarga de pestaña, pero no crea cuentas personales.

## Integración posterior

Para cambiar textos, opciones o fotografías de la planta, edita el arreglo `stages` al comienzo de `src/games/PlantGame.tsx`.
