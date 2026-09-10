# Plan de tarea: PC-08

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `IMPLEMENTING`
- Persona responsable: aprobó las decisiones de alcance y la tarea.
- Creado: 2026-09-10T15:26:08Z
- Última actualización: 2026-09-10T15:29:13Z
- Aprobación vigente: `APROBADO PC-08` (2026-09-10T15:27:20Z); evidencia Sdk recibida

## Objetivo

Extraer el contenido pedagógico HEART actualmente embebido en el servidor a archivos versionados y editables por un administrador del servidor, sin cambiar el contrato HTTP ni el comportamiento validado de las prácticas.

## Alcance

### Incluido

- Cargar desde una ruta fija y controlada los prompts Guest/Evaluator y los tres escenarios HEART.
- Validar el paquete de contenido al arrancar: UTF-8, archivos requeridos, contenido no vacío, tamaños acotados, JSON estricto y los tres IDs actuales.
- Mantener el contenido cargado inmutable durante la ejecución; los cambios se aplican solo tras reiniciar el servidor y solo a prácticas nuevas.
- Asociar internamente la versión de contenido usada por cada práctica.
- Añadir pruebas sin llamadas al modelo para el cargador y errores de contenido.
- Conservar exactamente los textos aprobados inicialmente durante la migración.

### Fuera de alcance

- Recarga dinámica o endpoint administrativo.
- Editar contenido desde HTTP, rutas de archivos configurables por API, carga de archivos, interfaz web, autenticación, persistencia, nuevos escenarios/IDs o nuevos frameworks.
- Cambiar modelo, proveedor, thinking, límites, rutas HTTP, mensaje fijo de bloqueo, reglas HEART, roles Guest/Evaluator, SDK, dependencias o script PowerShell.

## Evidencia de Sdk

- Sdk confirmó `node:fs/promises` con rutas fijas y cadenas pasadas al `DefaultResourceLoader({ systemPrompt })`; conservar `noExtensions`, `noSkills`, `noPromptTemplates`, `noThemes`, `noContextFiles`, `SessionManager.inMemory()`, `SettingsManager.inMemory({ compaction: { enabled: false } })`, modelo/thinkings y `noTools: "all"`.
- Sdk exige `appendSystemPromptOverride: () => []` en el loader para impedir `APPEND_SYSTEM.md` global/cwd y preservar aislamiento.
- Cargar/validar contenido antes de `ModelRuntime.create()`; fallo de contenido deja servicio no listo y solo expone 503 seguro. Snapshot inmutable `{ guestPrompt, evaluatorPrompt, scenarios, version }` por proceso/práctica; VALIDATE/EVALUATE usan el snapshot de la práctica.
- PC-08 no debe reducir ni reordenar las repeticiones actuales de prompt/transcript del Evaluator, cambiar delimitadores/modos, parser exacto `BLOCK`, lock, límites ni contrato.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-09-10 | Aplicar cambios de contenido mediante reinicio del servidor. | Sin recarga dinámica ni cambios a prácticas abiertas. |
| 2026-09-10 | Solo un administrador con acceso al servidor edita archivos. | No hay API administrativa ni edición desde cliente. |
| 2026-09-10 | Conservar exactamente `air-conditioning`, `sofa-bed` y `missed-breakfast`. | Contrato `scenarioId` no cambia. |
| 2026-09-10 | Mantener el mensaje fijo de bloqueo en código. | Contrato HTTP de bloqueo no cambia. |

## Contrato técnico

- Rutas, métodos, entradas, salidas y errores existentes se conservan sin cambio.
- `GET /health` devuelve 503 sin detalles internos cuando el contenido requerido no puede cargarse o validarse.
- `POST /trainings` conserva los tres `scenarioId` aprobados y solo crea prácticas con contenido validado.
- Una práctica conserva internamente el paquete/versión de contenido con que se creó; no se alteran prompts de sesiones abiertas.
- Secretos, rutas locales, prompts, transcripciones, IDs SDK y errores de validación de archivos no se exponen en HTTP.

## Implementación autorizada

- Archivos previstos: `src/server.mjs`, `src/training-content.mjs`, `training-content/heart/guest-prompt.md`, `training-content/heart/evaluator-prompt.md`, `training-content/heart/scenarios.json`, `test/training-content.test.mjs`, `.pi/coordination/tasks/PC-08/{task-plan.md,ledger.md}`, `.git/` por Git.
- Dependencias autorizadas: ninguna; usar Node.js estándar y el SDK existente.
- Protegidos: `README.md` hasta `QA OK`, `scripts/chat.ps1`, `package*.json`, `.gitignore`, `AGENTS.md`, `.vscode/`, secretos y `.pi/` fuera de PC-08.
- Prohibido: rutas de contenido recibidas desde HTTP, lectura arbitraria de disco, contenido ejecutable, `eval`, recarga sin reinicio, cambios a API/SDK/modelo/límites, Git destructivo y exposición de detalles internos.

## Criterios de finalización

- Los prompts y escenarios salen de `src/server.mjs` y viven en el paquete `training-content/heart/` controlado.
- El cargador rechaza contenido incompleto, vacío, demasiado grande, JSON inválido, campos inesperados o IDs distintos de los tres aprobados.
- El arranque no deja el servicio listo si el contenido no es válido; no expone detalles internos.
- Guest/Evaluator reciben los mismos textos y reglas aprobados; los casos QA PC-06 siguen siendo aplicables.
- Pruebas estáticas y de cargador pasan; Cod hace commit/push no forzado; Rev aprueba; la persona responsable ejecuta QA desde PowerShell.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente del ciclo: Sdk aprobó carga con `node:fs/promises` y loader explícito aislado; Cod implementa contenido validado/snapshot y prueba sin cuota en ronda 0.
- Riesgos a comprobar: traversal de rutas, inicio parcialmente configurado, cambios de contenido a sesiones abiertas, regresión de escenarios/prompts, detalles internos por HTTP y cambios de contrato.
- Comandos de comprobación estática: `node --check src/server.mjs`, `node --test test/training-content.test.mjs`, `npm ls @earendil-works/pi-coding-agent --depth=0`, `git diff --check` y comprobaciones Git; sin llamadas reales al modelo.

## QA humana desde PowerShell

- Comando: `npm start`, seguido de `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\chat.ps1`.
- Resultado esperado: los tres escenarios preservan los hechos aprobados; un mensaje ajeno se bloquea; uno relevante se acepta; `/end` entrega feedback HEART; cambios de contenido solo aparecen tras reiniciar y en una práctica nueva.
- Resultado observado: pendiente.
- Estado: pendiente.

## Documentación

- Archivos autorizados después de `QA OK`: `README.md`.
- Contenido: ubicación controlada de contenido, aplicación por reinicio, restricciones de edición y sin prometer recarga dinámica o administración HTTP.
