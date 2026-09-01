# Plan de tarea: PC-05

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: aprobó y confirmó contrato de `PC-05`
- Creado: 2026-09-01T21:36:34Z
- Última actualización: 2026-09-01T22:19:16Z
- Aprobación vigente: `APROBADO PC-05` (2026-09-01T21:43:08Z); contrato HEART completo aprobado (2026-09-01T22:19:16Z)

## Objetivo

Definir y confirmar el diseño HEART antes de implementarlo: sustituir el uso genérico actual por prácticas con dos sesiones internas aisladas —Huésped y Evaluador—, prompts internos seguros, validación inmediata de mensajes fuera de contexto y evaluación final en texto estructurado al recibir `/end`.

## Alcance

### Incluido

- Analizar con Sdk cómo crear y coordinar dos `AgentSession` aisladas por práctica, con modelo interno fijo y pensamiento diferente por rol.
- Confirmar que `openai-codex/gpt-5.6-terra` admite pensamiento `medium` para el Evaluador; no hacer fallback silencioso.
- Refinar los prompts internos de Huésped y Evaluador, ambos en inglés, sin exponerlos ni aceptarlos desde HTTP.
- Proponer contrato HTTP y flujo PowerShell: elegir situación, validar mensaje, conversar con Huésped, `/end` y mostrar evaluación HEART final sin JSON.
- Identificar el reemplazo controlado de las rutas/chat genéricos actuales y límites de coste, memoria, concurrencia y seguridad.

### Fuera de alcance

- Modificar servidor, script PowerShell, README, dependencias, configuración/auth de Pi, modelos, credenciales, persistencia, interfaz web o Git.
- Ejecutar llamadas reales al modelo, login, refresh o inspección de secretos.

## Evidencia de Sdk

- API o clase del SDK confirmada: dos `AgentSession` independientes con `ModelRuntime` compartido, `SessionManager.inMemory()`, `SettingsManager.inMemory({ compaction: { enabled: false } })`, `ResourceLoader` aislado, `noTools: "all"`, `prompt()`, `getLastAssistantText()`, `abort()` y `dispose()`.
- Autenticación y modelo: `openai-codex/gpt-5.6-terra` con cuenta local de pruebas; metadata local confirma Huésped `low` y Evaluador `medium`.
- Semántica de sesión: `trainingId opaco -> { guestSession, evaluatorSession, transcript, state, lock }`; servidor coordina/serializa y borra/dispone ambas al finalizar.
- Riesgos y límites: coste de validación + Huésped por mensaje válido y una evaluación final; contexto/sesión se pierden al reiniciar; se requieren límites de turnos/tamaño/tiempo y política de fallo.
- No aplica porque: no aplica; cambia sesiones, prompts y thinking, por lo que Sdk es obligatorio.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-09-01 | Reemplazar el chat genérico por práctica HEART. | No se conservará como flujo de producto la conversación genérica. |
| 2026-09-01 | Crear dos sesiones por práctica: Huésped y Evaluador. | El servidor guarda ambas y su transcripción bajo un ID opaco de práctica. |
| 2026-09-01 | Solo inglés; evaluación final estructurada como texto, no JSON. | Prompts, interfaz y feedback en inglés con secciones HEART. |
| 2026-09-01 | Terminar práctica con `/end`. | El script lo trata como comando local y solicita evaluación final al servidor. |
| 2026-09-01 | Usar Evaluador para validar relevancia inmediata y feedback final. | No se crea tercera sesión; bloquear solo mensajes claramente fuera de contexto. |
| 2026-09-01 | Huésped usa thinking `low`; Evaluador usa `medium`. | Sdk confirmó `medium` en metadata local. |
| 2026-09-01 | Límites suaves: 20 mensajes, 4.000 caracteres y 90 segundos por llamada; hasta 3 prácticas activas simultáneas. | El servidor limita coste/memoria/espera; cada práctica se bloquea de forma independiente. |
| 2026-09-01 | Los prompts no describen la mecánica del servidor. | Prompts definen solo rol/conducta; servidor controla modo, rutas, IDs, límites, `/end`, transcripción y cleanup. |
| 2026-09-01 | El Huésped inicia la práctica. | Tras seleccionar situación, el servidor obtiene un mensaje inicial del Huésped y PowerShell lo muestra antes de que el Team Member responda. |
| 2026-09-01 | Aprobar contrato HEART completo. | Rutas de práctica, selección de situación, validación `BLOCK`, límites, dos sesiones, `/end` y evaluación textual autorizados para PC-06. |

## Contrato técnico

- Método y ruta: Pendientes de confirmación humana final; se propone `POST /trainings`, `POST /trainings/:trainingId/messages` y `POST /trainings/:trainingId/end`.
- Entrada JSON: Situación controlada y mensaje; nunca modelo, prompts, credenciales o administración. Límites confirmados: 20 mensajes, 4.000 caracteres y 3 prácticas activas.
- Salida JSON: Respuesta de huésped, feedback inmediato o evaluación final en texto estructurado; pendiente de contrato final.
- Errores esperados: Situación inválida, práctica inexistente/ocupada, mensaje inválido/fuera de contexto, límite de mensaje/prácticas/tiempo, evaluador/huésped no disponible o respuesta final vacía; sin detalles internos.
- Semántica de sesión: Dos sesiones privadas por práctica y transcripción privada en memoria; hasta tres prácticas pueden procesarse independientemente; no se exponen IDs del SDK.
- Secretos/configuración: Recursos explícitos aislados, `noTools: "all"`, sin `AGENTS.md`/skills/extensiones/prompts de desarrollo; credenciales nunca pasan por HTTP.

## Implementación autorizada

- Archivos permitidos: `.pi/coordination/tasks/PC-05/task-plan.md` y `.pi/coordination/tasks/PC-05/ledger.md` únicamente.
- Dependencias autorizadas: Ninguna.
- Archivos o rutas expresamente protegidos: Producto, scripts, README, package/lockfile, `.gitignore`, secretos, `auth.json`, `.vscode/`, `AGENTS.md` y `.pi/` fuera de PC-05.
- Cambios explícitamente no permitidos: Cualquier código, prompt en producto, llamada real al modelo, Git o modificación de credenciales.

## Criterios de finalización

- Sdk confirma o bloquea configuración de dos sesiones, cargadores aislados, `medium`, resultado de validación/final y cleanup.
- Orc presentó prompts y contrato HTTP concretos sin suposiciones.
- La persona responsable aprobó PC-06 como siguiente slice de implementación; PC-05 no implementa ni ejecuta QA humana.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente del ciclo: Sdk confirmó dos sesiones y `medium`; espera decisión humana de contrato, límites y prompts finales antes de implementación.
- Riesgos a comprobar: confundir mensajes con instrucciones, bloqueo excesivo, mezcla entre sesiones, coste, thinking no soportado y eliminación prematura de rutas existentes.
- Comandos de comprobación estática: Pendientes de Sdk; análisis no destructivo solamente.

## QA humana desde PowerShell

- Comando: No aplica en PC-05.
- Resultado esperado: No aplica.
- Resultado observado: Pendiente.
- Estado: no aplica

## Documentación

- Archivos autorizados: Ninguno.
- Contenido que solo podrá documentarse después de `QA OK`: No aplica en PC-05.
