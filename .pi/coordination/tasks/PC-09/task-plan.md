# Plan de tarea: PC-09

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `IMPLEMENTING`
- Creado: 2026-09-10T16:30:23Z
- Última actualización: 2026-09-10T16:33:34Z
- Aprobación vigente: `APROBADO PC-09` (2026-09-10T16:31:53Z); evidencia Sdk recibida

## Objetivo

Modularizar internamente Pi-Coach para que el motor de prácticas, la integración con Pi SDK y el paquete de contenido HEART tengan responsabilidades separadas, sin cambiar el contrato HTTP ni el comportamiento HEART aprobado.

## Resultado observable

HEART continúa funcionando con los mismos tres escenarios y contrato HTTP. `src/server.mjs` queda limitado a inicialización, transporte HTTP y apagado; las prácticas/sesiones y la creación aislada de sesiones SDK viven en módulos internos. HEART se describe mediante un paquete declarativo aprobado que incluye un manifest validado.

## Alcance

### Incluido

- Extraer del servidor el ciclo de vida de práctica: creación, sesiones, transcript, validación, feedback final, locks, límites, cleanup y errores internos.
- Extraer la construcción aislada de sesiones Pi SDK a un módulo dedicado.
- Mantener o adaptar el cargador de contenido para leer y validar `training-content/heart/manifest.json`, prompts y escenarios desde rutas controladas.
- Validar manifest declarativo, campos esperados, rutas relativas internas permitidas y consistencia con los tres IDs existentes.
- Añadir/adaptar pruebas sin modelo para contenido/manifest y módulos de práctica que no requieran proveedor.
- Conservar literales de prompts/escenarios, hashes PC-08, snapshot inmutable, `appendSystemPromptOverride: () => []` y todos los controles SDK aprobados.

### Fuera de alcance

- Segundo framework/paquete, selección de paquete desde API, cambio de `scenarioId`, rutas/métodos/respuestas HTTP, modelo, proveedor, thinking, herramientas, límites de producto, recarga dinámica, administración HTTP/web, autenticación, persistencia, base de datos, plugins ejecutables, dependencias y cambios de contenido pedagógico.

## Decisiones confirmadas

| Fecha | Decisión | Impacto |
| --- | --- | --- |
| 2026-09-10 | Ejecutar primero modularización interna de HEART; validar otro framework en una tarea futura. | PC-09 no altera el contrato HTTP ni añade segundo paquete. |
| 2026-09-10 | El paquete HEART tendrá manifest declarativo. | Las referencias se resuelven dentro de directorio controlado; no son rutas libres. |
| 2026-09-10 | Mantener separación mínima, no microservicios ni sistema de plugins. | Módulos Node internos y sin dependencias. |

## Evidencia de Sdk

- Sdk confirmó: una sola inicialización memoizada de contenido y luego `ModelRuntime`/modelo Terra por proceso; no existe destructor SDK documentado para runtime. El motor es dueño de sesiones y las dispone; la fábrica crea recursos nuevos por rol.
- Grafo aprobado: `server.mjs (HTTP) → training-service.mjs (motor) → { sdk-session-factory.mjs (Pi SDK), training-content.mjs (datos) }`; no import inverso a server ni código desde manifest.
- El servidor conserva transporte y compuerta de red de shutdown; el motor conserva trainings, pending creations, límites, locks, timeout, transcript, cleanup y admisión. Evitar estados duplicados de shutdown.
- Evidencia previa PC-08 que se conserva literalmente: loader explícito aislado, `appendSystemPromptOverride: () => []`, `noExtensions/noSkills/noPromptTemplates/noThemes/noContextFiles`, sesiones/settings in-memory, modelo Terra, `noTools: "all"`, reload del loader, thinking por rol y carga de contenido antes de runtime.

## Contrato técnico

- Sin cambio: `GET /health`, `POST /trainings`, `POST /trainings/:trainingId/messages` y `POST /trainings/:trainingId/end`; sus entradas, salidas, errores y semántica de sesión se preservan.
- Sin cambio: `scenarioId` exactos `air-conditioning`, `sofa-bed`, `missed-breakfast`; bloqueo público, códigos 400/404/409/413/429/502/503/504 y limpieza.
- El manifest no llega por HTTP, no selecciona modelo/herramientas y no puede resolver rutas fuera de `training-content/heart/`.
- Si contenido/manifest es inválido, el servicio sigue no listo y solo expone el 503 seguro existente.

## Implementación autorizada

- Archivos de producto previstos: `src/server.mjs`, `src/training-service.mjs`, `src/sdk-session-factory.mjs`, `src/training-content.mjs`, `training-content/heart/manifest.json`, `training-content/heart/guest-prompt.md`, `training-content/heart/evaluator-prompt.md`, `training-content/heart/scenarios.json`, `test/training-content.test.mjs`, `test/training-service.test.mjs`.
- Se permite crear únicamente módulos `.mjs` adicionales directamente bajo `src/` o `test/` si son necesarios para las responsabilidades anteriores y se declaran a Rev.
- Sin dependencias nuevas. `README.md` solo después de `QA OK`; `.pi/coordination/tasks/PC-09/` solo Orc; `.git/` para commits/push no forzados.
- Protegidos: `scripts/chat.ps1`, `package*.json`, `.gitignore`, `AGENTS.md`, `.vscode/`, secretos, `.pi/` fuera de PC-09 y cualquier ruta no listada.

## Criterios de finalización

- `server.mjs` no contiene implementación de sesiones SDK, transcript, manejo de práctica o carga/validación detallada de contenido.
- Módulos internos tienen dependencias unidireccionales: HTTP → motor de práctica → fábrica SDK/contenido; ningún paquete de contenido ejecuta código ni controla configuración operativa.
- Manifest HEART válido describe solo metadatos/archivos aprobados; prompts y escenarios conservan hashes PC-08.
- Pruebas cubren manifest válido/inválido, rutas no permitidas, carga, snapshots, límites y cleanup sin modelo/red.
- `node --check`, `node --test`, `npm ls @earendil-works/pi-coding-agent --depth=0`, `git diff --check` pasan; Cod publica commit; Rev aprueba; persona responsable realiza QA PowerShell de los tres escenarios.

## Revisión técnica

- Iteración de QA: `0`
- Ciclo técnico: `1`
- Ronda técnica: `0`
- Riesgos: ciclos de importación, alteración accidental de errores HTTP, lifecycle duplicado de runtime/sesiones, pérdida de locks/cleanup, manifest que habilite traversal, regresión de hash/texto, exposición de detalles y tests que creen sesiones reales. Sdk exige pruebas con factory falsa para inicialización única, recursos por rol, locks y cleanup sin SDK/red.

## QA humana desde PowerShell

- Comandos: `npm start`, seguido de `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\chat.ps1`.
- Resultado esperado: los tres escenarios preservan hechos; mensaje ajeno bloqueado; respuesta relevante aceptada; `/end` entrega feedback HEART; sesiones aisladas y cierre siguen funcionando.
- Estado: pendiente de revisión técnica.

## Documentación

- Después de `QA OK`, Doc puede actualizar `README.md` para describir la estructura modular y manifest HEART confirmado, sin prometer soporte de múltiples frameworks todavía.
