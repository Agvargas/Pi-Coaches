# Plan de tarea: PC-10

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Creado: 2026-09-10T20:55:15Z
- Última actualización: 2026-09-15T18:18:33Z
- Aprobación vigente: `QA OK PC-10` (2026-09-15T18:05:04Z); README documentado y cambios PC-10 publicados en origin/master

## Objetivo

Convertir Pi-Coach en un motor agnóstico de frameworks: descubrir paquetes válidos, permitir seleccionar framework, escenario y modalidad de feedback, conservar HEART y añadir GROW con Kam, Lee y cuatro escenarios aprobados.

## Resultado observable

El cliente PowerShell obtiene el catálogo disponible, permite elegir framework, escenario y `final` o `immediate-and-final`, y crea una práctica válida. HEART inicia mediante Guest; GROW muestra contexto público y espera el primer mensaje del Coach. El motor no contiene condiciones específicas para HEART, GROW, hotel, Kam o Lee.

## Decisiones confirmadas

| Fecha | Decisión | Impacto |
| --- | --- | --- |
| 2026-09-10 | El usuario selecciona framework, escenario y modalidad de feedback. | Catálogo HTTP controlado y nuevo cuerpo de creación. |
| 2026-09-10 | HEART y GROW admiten `final` e `immediate-and-final`. | Cada paquete declara prompts/modos; motor aplica configuración validada. |
| 2026-09-10 | HEART usa `character-opens`; GROW usa `user-opens-with-context`. | Inicio definido declarativamente por paquete. |
| 2026-09-10 | Solo mensajes claramente ajenos se bloquean en cualquier framework. | Coaching débil se acepta y se evalúa según paquete/modo. |
| 2026-09-10 | GROW separa contexto público y privado. | Usuario ve antecedentes; personaje/evaluador recibe detalles privados. |
| 2026-09-10 | Errores iniciales de respuesta/evaluación muestran aviso genérico. | Sin política avanzada de recuperación en este slice. |
| 2026-09-10 | Puntaje es una instrucción opcional del prompt final, no una regla del motor. | PC-10 no exige puntuación GROW. |
| 2026-09-10 | `DECISIÓN PC-10: aprobar propuesta GROW`. | El contenido exacto de `.pi/coordination/tasks/PC-10/grow-content-proposal.md` queda autorizado para migración a paquete GROW. |
| 2026-09-10 | `DECISIÓN PC-10: aprobar contextos HEART`. | El catálogo expone tres contextos públicos HEART separados; reglas de solución/evaluación siguen privadas. |
| 2026-09-10 | `DECISIÓN PC-10: aprobar prompt HEART inmediato`. | El texto exacto de `.pi/coordination/tasks/PC-10/heart-immediate-feedback-proposal.md` queda autorizado para el modo inmediato; prompt final no cambia. |
| 2026-09-10 | `DECISIÓN PC-10: aprobar títulos HEART`. | DisplayName públicos: `Air conditioning`, `Sofa bed`, `Missed breakfast`. |

## Alcance

### Incluido

- Catálogo de paquetes controlados bajo `training-content/frameworks/`, descubierto y validado al arranque.
- Migrar HEART a manifest/configuración genérica sin cambiar sus escenarios, prompts aprobados ni comportamiento cuando se selecciona `final`.
- Añadir prompt HEART para feedback inmediato y los prompts/configuración GROW derivados del material aprobado.
- Añadir GROW: perfiles Kam/Lee, cuatro escenarios, contexto público aprobado y detalles privados para IA personaje/evaluadora.
- Extender motor para `character-opens` y `user-opens-with-context`, y para `final`/`immediate-and-final` declarativos.
- Extender API y `scripts/chat.ps1` para menú de catálogo y las tres selecciones.
- Corrección QA 1: `scripts/chat.ps1` invoca explícitamente `Invoke-RestMethod -Method Get -Uri <URL>` para health y catálogo; no usa argumentos posicionales.
- Corrección QA 3: todas las llamadas de creación, mensaje y cierre usan también `Invoke-RestMethod -Method Post -Uri <URL>`; no quedan verbos/URI posicionales.
- QA iteración 2: entrada inválida mantiene activo el mismo menú; framework ofrece `0. Exit`, escenario `0. Back` a framework y feedback `0. Back` a escenario; retrocesos sucesivos permitidos.
- QA iteración 4: `/end` vuelve al menú raíz tras feedback; `/exit` cancela sin feedback mediante DELETE/dispose; ayuda contextual por `/help` y por opción de menú. Framework raíz con `n` opciones válidas: `0. Exit`, `n+1. Help`; escenario/feedback: `0. Exit`, `n+1. Help`, `n+2. Back`.
- Pruebas unitarias sin modelo/red para catálogo, validación, modalidades, inicio, aislamiento, errores y contratos.
- Deuda futura registrada: diseñar recuperación robusta (reintentos controlados, estado consistente e idempotencia) antes de sustituir la política temporal de retirada de práctica.

### Fuera de alcance

- Web, administración HTTP, carga/edición de archivos por API, hot reload, autenticación, persistencia, base de datos, audio, animación, engagement, cierre automático, corrección de voz/nombres, sistema de plugins ejecutables, modelos/herramientas configurables por paquete, presupuesto/cuota, métricas, otro framework, feedback con puntuación obligatoria y recuperación avanzada de errores.

## Contrato HTTP propuesto

### `GET /frameworks`

- Salida 200: `{ "frameworks": [{ "id", "displayName", "feedbackModes", "scenarios": [{ "id", "displayName", "publicContext" }] }] }`.
- Solo lista paquetes válidos y su metadata pública; nunca prompts, contexto privado, rutas, hashes, errores internos, modelo o secretos.
- 503 `{ "error": "service_unavailable" }` si no existe paquete válido o inicialización falla.

### `POST /trainings`

- Entrada exacta: `{ "frameworkId": string, "scenarioId": string, "feedbackMode": "final" | "immediate-and-final" }`.
- 400 para cuerpo/selección/modalidad no válida; 429 límite; 502 proveedor; 503 no listo; conservar los demás errores existentes.
- Salida 201: `{ "trainingId", "startMode", "openingMessage"?, "publicContext"? }`.
  - `character-opens`: incluye `openingMessage` no vacío; no requiere contexto público.
  - `user-opens-with-context`: incluye `publicContext` no vacío; no requiere apertura de personaje.

### `POST /trainings/:trainingId/messages`

- Entrada exacta sin cambio: `{ "message": string }`.
- Salida bloqueada: contrato actual `{ "status": "blocked", "message" }`.
- Salida aceptada: `{ "status": "accepted", "reply": string, "feedback"?: string }`; `feedback` aparece solo en `immediate-and-final`.
- Ante fallo de proveedor/personaje/evaluación, devolver el error público genérico existente; PC-10 no promete recuperación parcial.

### `POST /trainings/:trainingId/end`

- Salida 200 sin cambio estructural: `{ "feedback": string }`, usando prompt final del paquete.

### `DELETE /trainings/:trainingId`

- Salida 204 sin cuerpo: retira y dispone la práctica sin invocar al Evaluator ni generar feedback.
- 404 `{ "error": "training_not_found" }` si no existe; 409 `{ "error": "training_busy" }` si está procesando o finalizando.
- El cliente usa esta operación para `/exit` y luego termina PowerShell.

## Configuración declarativa esperada

Cada manifest puede declarar únicamente: ID/nombre público, modalidad de inicio, modalidades de feedback soportadas, nombres relativos permitidos de prompts/datos y metadatos públicos de escenarios. El esquema debe ser cerrado; rutas se resuelven dentro de su paquete y se rechazan absolutos, `..`, separadores no permitidos, código, prompts inline y campos para modelo/proveedor/thinking/tools.

Los escenarios contienen: ID/nombre público, `publicContext` cuando aplique, personaje, contexto privado y datos de ejercicio. El motor recibe un snapshot inmutable; el usuario solo recibe metadata/contexto público.

## Contextos públicos HEART aprobados

Los siguientes textos son la fuente literal aprobada para el catálogo. Son metadata pública; los escenarios privados conservan hechos, soluciones y reglas de evaluación que no se exponen.

| ID | Display name | Public context |
| --- | --- | --- |
| `air-conditioning` | `Air conditioning` | A guest reports that a rattling air-conditioning unit kept them awake overnight and left them extremely frustrated. |
| `sofa-bed` | `Sofa bed` | A family arriving with two adults and two children finds that the sofa bed and room supplies were not prepared as expected. |
| `missed-breakfast` | `Missed breakfast` | A guest missed breakfast while finishing a presentation, is rushing to a meeting, and is upset about not having eaten. |

## Contenido GROW aprobado

- Escenarios: `kam-career-readiness`, `lee-cross-functional-project`, `kam-change-strategy`, `lee-presentation-feedback`.
- Contextos públicos: los cuatro textos aprobados por la persona responsable el 2026-09-10, preservados en inglés.
- Perfiles privados Kam/Lee, detalles de situación y prompts GROW: requieren aprobación/transcripción explícita antes de implementación; los detalles personales reservados no salen por catálogo/API.
- Evaluación: orientación GROW, preguntas abiertas, empatía, no directividad, secuencia recomendada/no obligatoria y feedback directo al Coach. No trasladar audio, engagement, reintentos, reformulación ni puntuación obligatoria del producto origen.

## Evidencia de Sdk

- Sdk confirmó dos sesiones aisladas por práctica: Character y Evaluator; Evaluator ejecuta `VALIDATE`, `IMMEDIATE_FEEDBACK` y `FINAL_EVALUATE`. No se paralelizan prompts: `VALIDATE → Character → feedback inmediato opcional`; bloqueado no llega a Character/transcript. Final evalúa transcript de servidor autoritativo y sesiones se disponen siempre al terminar.
- Decisión humana: ante fallo post-llamada retirar/disponer la práctica y devolver error público 502/504, porque no hay rollback SDK. El aviso público pide iniciar una práctica nueva, no reiniciar servidor. Registrar como deuda futura recuperación/reintentos.
- Conservada PC-09: runtime/modelo únicos, `noTools: "all"`, loader aislado con `appendSystemPromptOverride: () => []`, sesiones por rol in-memory, contenido validado antes de runtime y motor dueño de sesiones.
- Sdk (QA 4): `cancelTraining(id)` debe hacer síncronamente `available(id) → retire(training) → dispose()`; sin `prompt`, transcript, feedback ni `abort`. DELETE activo devuelve 204 vacío; ausente 404; ocupado/finalizando 409 y no interfiere. La ruta DELETE va antes de compuerta POST/lectura de body; shutdown sigue 503.

## Implementación autorizada

- Producto: `src/server.mjs`, `src/training-service.mjs`, `src/sdk-session-factory.mjs`, `src/training-content.mjs`, nuevos módulos `.mjs` directos bajo `src/` solo si son necesarios para catálogo/contrato declarativo, `scripts/chat.ps1`, `training-content/`, `test/`.
- Se permite migrar `training-content/heart/` a `training-content/frameworks/heart/` y crear `training-content/frameworks/grow/` con manifest, prompts, perfiles y escenarios.
- `.pi/coordination/tasks/PC-10/` solo Orc; `.git/` para commits/push no forzados. `README.md` solo tras `QA OK`.
- Protegidos: `package*.json`, `.gitignore`, `AGENTS.md`, `.vscode/`, `.pi/` fuera PC-10, secretos y rutas no listadas.

## Criterios de finalización

- Catálogo muestra solo paquetes válidos y no expone contenido privado.
- HEART y GROW se ejecutan mediante configuración, no condiciones por nombre en el motor.
- HEART en `final` conserva semántica aprobada; ambas modalidades reciben feedback correcto según prompt.
- GROW muestra contexto público, espera Coach y protege detalles privados; los cuatro escenarios funcionan.
- Validación global bloquea solo mensajes claramente ajenos; intervenciones débiles alcanzan personaje/feedback.
- Tests cubren schema, descubrimiento, selección, ambos inicios, ambas modalidades, aislamiento/snapshot, errores/cleanup y contratos sin modelo/red.
- Revisión técnica, QA humana desde PowerShell para HEART y GROW, documentación posterior y commits publicados.

## QA humana desde PowerShell

- Comandos: `npm start`; `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\chat.ps1`.
- Probar HEART/GROW, selección inválida, los dos modos de feedback, inicio Guest/contexto Coach, bloqueo ajeno, intervención débil aceptada, feedback final, escenarios GROW y cierre.
- Estado: `QA OK PC-10` (2026-09-15T18:05:04Z); documentación publicada en `3ab4bb3` y tarea cerrada.
