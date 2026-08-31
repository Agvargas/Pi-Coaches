# Plan de tarea: PC-02

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: aprobó y validó QA de `PC-02`
- Creado: 2026-08-31T18:17:23Z
- Última actualización: 2026-08-31T19:18:18Z
- Aprobación vigente: `APROBADO PC-02` (2026-08-31T18:54:54Z); higiene Git aprobada por Rev en ronda 1; `QA OK PC-02` (2026-08-31T19:18:18Z)

## Objetivo

Crear el primer servidor Node.js local de Pi-Coach: inicia en `127.0.0.1`, carga el SDK real de Pi en un entorno Coach aislado y permite crear una sesión Coach real con un ID opaco. No envía mensajes al modelo todavía; ese será el siguiente slice.

## Alcance

### Incluido

- Declarar localmente `@earendil-works/pi-coding-agent@0.84.4` y usar únicamente HTTP nativo de Node.js, sin framework adicional.
- Crear un servidor local con `GET /health` y `POST /v1/sessions`.
- Inicializar `ModelRuntime`, validar internamente `openai-codex/gpt-5.6-terra` mediante `getAvailable()` y usar pensamiento `low`.
- Crear cada sesión mediante `createAgentSession()` con `SessionManager.inMemory()`, recursos explícitos aislados, prompt Coach confirmado y `noTools: "all"`.
- Generar y exponer solo un ID opaco del servidor; conservar el mapa privado `ID opaco -> AgentSession` y liberar sesiones en apagado.
- Comprobar el contrato desde PowerShell y publicar el commit del slice, incluidos sus cambios autorizados de coordinación, sin push forzado.

### Fuera de alcance

- Enviar mensajes o producir respuestas de Coach; streaming; persistencia; sesión entre reinicios; interfaz web; autenticación pública; configuración de modelo/pensamiento/rutas desde HTTP.
- Login, logout, copia o exposición de credenciales; cuenta independiente de producción; herramientas del agente; carga de `AGENTS.md`, skills, extensiones o prompts de desarrollo.
- Dependencias distintas del SDK autorizado, frameworks HTTP, base de datos o cambios administrativos de Git separados del slice.

## Evidencia de Sdk

- API o clase del SDK confirmada: `ModelRuntime.create()`, `getAvailable()`, `createAgentSession()`, `SessionManager.inMemory()`, `dispose()` y recursos aislados con `noTools: "all"`.
- Autenticación y modelo: `openai-codex/gpt-5.6-terra` con pensamiento `low`, validado al iniciar; `pi auth check --provider openai-codex --model gpt-5.6-terra --no-refresh` dio `ready` sin secretos. Cuenta local actual solo para pruebas.
- Semántica de sesión: mapa privado `ID opaco -> AgentSession`; no persiste tras reiniciar; `session.sessionId` nunca se expone.
- Riesgos y límites: `ready` no garantiza red/cupo; sesión creada no prueba aún una respuesta real del modelo; cuenta independiente será un slice futuro.
- No aplica porque: no aplica.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-08-31 | Coach aislado: cargador explícito, sin recursos de desarrollo y `noTools: "all"`. | La API no hereda instrucciones ni herramientas de Pi-Coach. |
| 2026-08-31 | Prompt inicial: “Eres un coach de apoyo general. Ayuda a la persona a aclarar objetivos y próximos pasos mediante preguntas breves. Sé respetuoso, práctico y honesto sobre tus límites. No ejecutes acciones externas ni solicites o reveles credenciales.” | Prompt interno, no recibible por HTTP. |
| 2026-08-31 | Modelo interno `openai-codex/gpt-5.6-terra`, pensamiento `low`. | Se fija en servidor y se valida al inicio; no hay selección desde API. |
| 2026-08-31 | Usar la cuenta local actual para pruebas. | El servidor corre bajo el mismo usuario; futura cuenta independiente queda fuera de PC-02. |
| 2026-08-31 | No crear tareas solo para push. | El commit/push del slice incluye cambios autorizados de producto y coordinación. |

## Contrato técnico

- Método y ruta: `GET /health`; `POST /v1/sessions`.
- Entrada JSON: `POST /v1/sessions` acepta únicamente `{}`. No acepta modelo, prompt, proveedor, claves, rutas ni instrucciones administrativas.
- Salida JSON: `GET /health` → `200 {"status":"ok"}`. Creación → `201 {"sessionId":"<id-opaco>"}`.
- Errores esperados: `400 {"error":"invalid_request"}` por JSON/cuerpo inválido; `405 {"error":"method_not_allowed"}`; `503 {"error":"service_unavailable"}` si SDK/modelo no puede inicializarse o crear la sesión. No devolver detalles de credenciales ni internos.
- Semántica de sesión: un `POST` crea una `AgentSession` real aislada en memoria; el ID opaco pertenece al servidor, no al SDK; se pierde al reiniciar. No existe ruta de mensaje en este slice.
- Secretos/configuración: credencial Pi solo se resuelve localmente por el SDK; nunca en HTTP, código, logs ni Git.

## Implementación autorizada

- Archivos permitidos: `package.json`, `package-lock.json`, `src/server.mjs`, `.gitignore` y `.pi/coordination/tasks/PC-00/{task-plan.md,ledger.md}`, `.pi/coordination/tasks/PC-01/{task-plan.md,ledger.md}`, `.pi/coordination/tasks/PC-02/{task-plan.md,ledger.md}`. Se autoriza retirar el archivo local sin seguimiento `NUL`; Git puede modificar `.git/`.
- Dependencias autorizadas: `@earendil-works/pi-coding-agent@0.84.4` únicamente.
- Archivos o rutas expresamente protegidos: `auth.json`, secretos, variables sensibles, `.vscode/`, `AGENTS.md`, `.pi/` fuera de coordinación y contenido remoto previo.
- Cambios explícitamente no permitidos: Cualquier otra dependencia, framework web, login HTTP, cambios a credenciales, mensajes al modelo, persistencia, push forzado, rebase/reset destructivo o edición de rutas no autorizadas. La única regla nueva de `.gitignore` autorizada es `node_modules/`.

## Criterios de finalización

- `npm` declara e instala localmente el SDK autorizado y el servidor inicia con un comando documentado de `package.json`.
- Solo escucha en loopback; modelo interno disponible se valida sin exponer secretos.
- Ambas rutas cumplen exactamente el contrato, y crear sesión produce ID opaco sin exponer `session.sessionId`.
- Recursos de desarrollo y herramientas están aislados/desactivados; apagado dispone sesiones.
- Cod ejecuta comprobaciones, hace commit/push no forzados; Rev aprueba; la persona responsable ejecuta QA PowerShell.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `1`
- Contexto vigente del ciclo: Rev aprobó ronda 1; commit `0b9d36d6f7d4570690e1a486411ca604ee7544c4` está en `origin/master`, `node_modules/` está ignorado y `NUL` fue retirado. QA humana pendiente.
- Riesgos a comprobar: fuga de secretos, escucha no local, descubrimiento de recursos de desarrollo, ID SDK expuesto, dependencia no autorizada, endpoint que acepte administración/modelo desde HTTP. La higiene Git de `node_modules/` y `NUL` fue aprobada en ronda 1.
- Comandos de comprobación estática: `npm test` si se define; `node --check src/server.mjs`; inspección de `npm ls @earendil-works/pi-coding-agent`; comprobaciones de Git sin secretos.

## QA humana desde PowerShell

- Comando: En una consola, `npm start`. En otra: `Invoke-RestMethod http://127.0.0.1:3000/health; Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/v1/sessions -ContentType 'application/json' -Body '{}'`.
- Resultado esperado: salud `ok` y un `sessionId` no vacío, sin credenciales ni ID interno de Pi. No se espera todavía respuesta conversacional.
- Resultado observado: `QA OK PC-02` comunicado por la persona responsable.
- Estado: aprobada

## Documentación

- Archivos autorizados: Ninguno.
- Contenido que solo podrá documentarse después de `QA OK`: No aplica; no se despachó a Doc porque no había documentación autorizada.
