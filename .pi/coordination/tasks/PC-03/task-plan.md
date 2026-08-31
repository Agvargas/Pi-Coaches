# Plan de tarea: PC-03

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: aprobó y validó QA de `PC-03`
- Creado: 2026-08-31T19:20:57Z
- Última actualización: 2026-08-31T19:49:00Z
- Aprobación vigente: `APROBADO PC-03` (2026-08-31T19:22:44Z); `QA OK PC-03` (2026-08-31T19:49:00Z)

## Objetivo

Añadir una conversación Coach real no streaming: enviar un mensaje a una sesión creada por PC-02 y devolver el último texto del asistente desde el SDK de Pi.

## Alcance

### Incluido

- Añadir `POST /v1/sessions/:sessionId/messages` al servidor existente.
- Validar un cuerpo JSON exacto `{ "message": "<texto no vacío>" }`, con mensaje de 1 a 4.000 caracteres.
- Usar la `AgentSession` privada ya asociada al ID opaco: `await session.prompt(message)` y `session.getLastAssistantText()`.
- Serializar una petición activa por sesión y devolver conflicto si llega otra mientras la primera está en curso.
- Devolver respuesta textual no streaming y errores controlados sin detalles del SDK.
- Ejecutar comprobaciones, commit/push no forzados del slice y QA humana con una petición real que puede consumir cuota de la cuenta de pruebas.

### Fuera de alcance

- Streaming, `steer`, `followUp`, edición del prompt/modelo/pensamiento desde HTTP, nuevas herramientas, persistencia, historial tras reinicio, web, autenticación pública, login, cambio de cuenta, dependencias nuevas y documentación antes de QA OK.

## Evidencia de Sdk

- API o clase del SDK confirmada: `session.prompt(text)` espera la ejecución aceptada; `getLastAssistantText()` obtiene el texto final; ausencia de texto y rechazo de `prompt()` son fallos controlados.
- Autenticación y modelo: modelo interno de PC-02, `openai-codex/gpt-5.6-terra`, pensamiento `low`; cuenta local actual solo para pruebas.
- Semántica de sesión: reutilizar la misma `AgentSession` privada creada en PC-02; no usar `session.sessionId` como ID HTTP. Si está ocupada, responder 409, no convertir HTTP en `steer`/`followUp`.
- Riesgos y límites: la prueba realmente invoca el proveedor y puede fallar por red, cupo o proveedor; no persiste tras reiniciar.
- No aplica porque: Sdk ya confirmó las APIs exactas en PC-00; no cambia modelo, autenticación, sesiones ni persistencia.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-08-31 | Implementar el siguiente slice de conversación. | PC-03 propone mensajes no streaming sobre sesiones de PC-02. |
| 2026-08-31 | Modelo, prompt, aislamiento y cuenta de pruebas de PC-00/PC-02 se conservan. | No se aceptan parámetros administrativos ni credenciales desde HTTP. |

## Contrato técnico

- Método y ruta: `POST /v1/sessions/:sessionId/messages`.
- Entrada JSON: exactamente `{ "message": "<texto>" }`; 1–4.000 caracteres; no se permiten otras claves.
- Salida JSON: `200 { "sessionId": "<id-opaco>", "reply": "<texto-no-vacío>" }`.
- Errores esperados: `400 {"error":"invalid_request"}` por ruta, JSON, claves o mensaje inválidos; `404 {"error":"session_not_found"}` por ID desconocido; `409 {"error":"session_busy"}` por solicitud concurrente; `502 {"error":"coach_unavailable"}` por fallo de `prompt()` o respuesta final vacía. Sin detalles internos/secretos.
- Semántica de sesión: usa la sesión existente y conserva contexto durante la vida del proceso; no hay streaming; una solicitud por sesión a la vez.
- Secretos/configuración: nunca en entrada/salida/logs; modelo/prompt/pensamiento internos.

## Implementación autorizada

- Archivos permitidos: `src/server.mjs`, `.pi/coordination/tasks/PC-02/{task-plan.md,ledger.md}`, `.pi/coordination/tasks/PC-03/{task-plan.md,ledger.md}` y `.git/` mediante Git.
- Dependencias autorizadas: Ninguna adicional.
- Archivos o rutas expresamente protegidos: `package.json`, `package-lock.json`, `.gitignore`, secretos, `auth.json`, `.vscode/`, `AGENTS.md`, `.pi/` fuera de PC-02/PC-03.
- Cambios explícitamente no permitidos: cambios a modelo/prompt/pensamiento/ResourceLoader/noTools, persistencia, streaming, login o push forzado.

## Criterios de finalización

- La ruta cumple el contrato y usa una sesión SDK existente; no crea sesiones ni expone identificador interno.
- Peticiones concurrentes por sesión reciben 409; fallos SDK y respuesta vacía reciben 502 sin detalles.
- No se añaden dependencias ni se cambia el aislamiento de PC-02.
- Commit/push no forzados y revisión estática aprobada.
- La persona responsable prueba una conversación real desde PowerShell y confirma respuesta no vacía antes de documentación.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente del ciclo: Rev aprobó QA 0/ronda 0; commit `a753ec4a0085b8cf5a5f3133f605858eb155600c` está en `origin/master`. QA humana debe ejecutar la primera llamada real.
- Riesgos a comprobar: llamada concurrente, ID desconocido, fuga de detalles SDK, llamada sobre sesión inexistente, falta de respuesta y consumo de cuota.
- Comandos de comprobación estática: `node --check src/server.mjs`, `npm ls @earendil-works/pi-coding-agent`, comprobaciones HTTP locales de validación sin prompt y Git sin secretos.

## QA humana desde PowerShell

- Comando: Con `npm start` en otra consola: `$s = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/v1/sessions -ContentType 'application/json' -Body '{}'; Invoke-RestMethod -Method Post -Uri ("http://127.0.0.1:3000/v1/sessions/$($s.sessionId)/messages") -ContentType 'application/json' -Body (@{ message = 'Hola. Ayúdame a definir un próximo paso sencillo.' } | ConvertTo-Json)`.
- Resultado esperado: objeto con el mismo `sessionId` opaco y `reply` textual no vacío. Esta prueba hace una llamada real al proveedor y puede consumir cuota.
- Resultado observado: `QA OK PC-03` comunicado por la persona responsable.
- Estado: aprobada

## Documentación

- Archivos autorizados: Pendiente de decisión posterior a `QA OK`.
- Contenido que solo podrá documentarse después de `QA OK`: Inicio local, creación de sesión, envío de mensaje, errores y límites confirmados. No se despachó a Doc porque no había archivos de documentación autorizados.
