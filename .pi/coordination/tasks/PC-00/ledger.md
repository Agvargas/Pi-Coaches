# Ledger de tarea: PC-00

> Solo `Orc` actualiza este archivo. Registra eventos cuando ocurren.

## Bindings

| Rol | Terminal | Cwd | Estado inicial |
| --- | --- | --- | --- |
| Orc | Orc | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | activo |
| Sdk | Sdk | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | idle |
| Cod | Cod | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | idle |
| Rev | Rev | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | idle |
| Doc | Doc | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | idle |

Terminales comprobadas con `link_list` el 2026-08-31T17:47:03Z y el 2026-08-31T18:24:43Z. Antes del despacho: Orc, Sdk, Cod, Rev y Doc en `C:\Users\andgu\OneDrive\Documents\Pi-Coach`; Sdk estaba `idle`.

## Transiciones

| Fecha/hora | Estado | Emisor o receptor | Evento/callback | Siguiente paso |
| --- | --- | --- | --- | --- |
| 2026-08-31T17:47:03Z | DRAFT | Orc | Plan y ledger creados a solicitud de la persona responsable. | Esperar `APROBADO PC-00`. |
| 2026-08-31T18:24:43Z | APPROVED | Persona responsable | `APROBADO PC-00` recibido. | Pasar a análisis obligatorio de Sdk. |
| 2026-08-31T18:24:43Z | ANALYZING | Orc → Sdk | Despacho de análisis no destructivo. | Esperar `DONE` de Sdk. |
| 2026-08-31T18:27:21Z | DECISION_PENDING | Sdk → Orc | `QUESTION`: `createAgentSession()` descubre recursos de desarrollo por defecto; se requiere decidir aislamiento y prompt Coach. | Esperar `DECISIÓN PC-00`. |
| 2026-08-31T18:31:45Z | ANALYZING | Persona responsable → Orc → Sdk | `DECISIÓN PC-00: A`; aislamiento explícito y `noTools: "all"` confirmados. | Sdk completa informe; prompt genérico propuesto pendiente de redacción final. |
| 2026-08-31T18:33:03Z | DECISION_PENDING | Sdk → Orc | `DONE` recibido: APIs, versiones, modelo autenticado, sesiones in-memory, aislamiento, errores y cleanup confirmados. | Esperar confirmación humana del prompt y del modelo interno fijo. |
| 2026-08-31T18:37:57Z | DECISION_PENDING | Persona responsable → Orc | Prompt, `openai-codex/gpt-5.6-terra` y pensamiento `low` aprobados; pregunta sobre cuenta/login. | Verificar flujo de autenticación sin inspeccionar credenciales; esperar política de cuenta. |
| 2026-08-31T18:40:06Z | DECISION_PENDING | Sdk → Orc | `DONE`: `openai-codex` usa OAuth de suscripción ChatGPT Plus/Pro; comprobación no sensible del modelo devolvió `ready`. | Esperar confirmación humana de cuenta Plus/Pro autorizada. |
| 2026-08-31T18:50:41Z | DONE | Persona responsable → Orc | Autoriza usar cuenta local actual para pruebas y exige cuenta independiente para futuro. | Cerrar PC-00; preparar PC-02 local con requisito futuro registrado. |
| 2026-08-31T18:44:15Z | DECISION_PENDING | Persona responsable → Orc | Pregunta cómo reutilizar la cuenta local actual y cambiar a una cuenta distinta para futuro local/producción. | Aclarar aislamiento por usuario/configuración; no añadir login HTTP ni cambiar credenciales en PC-00. |

## Decisiones

| Fecha/hora | Estado | Pregunta y evidencia | Decisión humana | Agente notificado |
| --- | --- | --- | --- | --- |
| 2026-08-31T17:47:03Z | DRAFT | Alcance inicial: investigación no destructiva; no servidor, dependencias ni autenticación. | Confirmado en la solicitud de creación. | Ninguno; no hay despacho. |
| 2026-08-31T18:27:21Z | DECISION_PENDING | Sdk evidencia: por defecto `createAgentSession()` descubre `AGENTS.md`, skills, extensiones y prompts; `noTools: "all"` desactiva herramientas. | Pendiente: elegir cargador explícito aislado y definir/autorizar prompt Coach, o aceptar descubrimiento por defecto. | Sdk espera decisión. |
| 2026-08-31T18:31:45Z | ANALYZING | La persona responsable elige A y pide un Coach genérico inicial. | Cargador explícito aislado y `noTools: "all"`; el prompt breve se propondrá para confirmación. | Sdk reanudado. |
| 2026-08-31T18:33:03Z | DECISION_PENDING | Sdk confirma `ModelRuntime`, `SessionManager.inMemory`, `createAgentSession`, `prompt`, respuesta final y `dispose`; versiones Node 24.14.1/npm 11.16.0/SDK 0.84.4. | Pendiente fijar prompt literal y proveedor/modelo interno; la API no los recibirá. | Orc consulta a persona responsable. |
| 2026-08-31T18:37:57Z | DECISION_PENDING | Persona responsable aprueba prompt, modelo y pensamiento; consulta cuenta/plan de OpenAI. | Pendiente: autorizar uso de la credencial local ya lista o preparar una cuenta dedicada mediante flujo documentado. | Sdk verifica documentación; no se consulta identidad ni secretos. |
| 2026-08-31T18:40:06Z | DECISION_PENDING | Sdk evidencia: `openai-codex` requiere ChatGPT Plus o Pro según docs locales; `/login` interactivo guarda tokens fuera del proyecto; `ready` no prueba cupo/red. | Pendiente: persona responsable confirma cuenta autorizada Plus/Pro y acepta términos/costes/límites vigentes. | Orc consulta a persona responsable. |
| 2026-08-31T18:44:15Z | DECISION_PENDING | Pregunta sobre reutilizar cuenta local y futura cuenta distinta en producción. | Para PC-02 local, el proceso reutilizará solo la credencial del mismo usuario/entorno Pi; no habrá login por HTTP. Aislamiento/credenciales de producción quedan fuera de alcance para una tarea futura. | Persona responsable decide cuenta de pruebas. |
| 2026-08-31T18:50:41Z | DONE | La persona responsable confirma cuenta local actual para pruebas, condicionada a una futura cuenta independiente. | PC-02 usará credencial del mismo usuario solo para pruebas; futuro slice definirá aislamiento de identidad, preferiblemente otro usuario/perfil, sin credenciales en código/Git/API. | Ninguno; PC-00 cerrado. |

## Ciclos técnicos

| Iteración QA | Ciclo | Fuente y aclaración sustantiva | Contexto actualizado | Acción |
| --- | --- | --- | --- | --- |
| 0 | 1 | Persona responsable confirma uso temporal de cuenta local y requisito futuro de identidad independiente. | PC-00 DONE; evidencia y decisiones listas para PC-02. | Redactar PC-02 y esperar su aprobación. |

## Rondas de revisión

| Iteración QA | Ciclo | Ronda | Entrega de Cod | Hallazgo de Rev | Acción |
| --- | --- | --- | --- | --- | --- |
| 0 | 1 | 0 | No aplica: no hay implementación autorizada. | No aplica. | Sin acción hasta posible tarea posterior de implementación. |

## QA humana

| Fecha/hora | Comando PowerShell | Resultado observado | Acción |
| --- | --- | --- | --- |
| | Pendiente de propuesta de Sdk. | pendiente | No ejecutar QA en DRAFT. |

## Cierre

- Documentación enviada a Doc: No aplica; no autorizada.
- Confirmación de documentación: No aplica.
- Estado final: DONE (2026-08-31T18:50:41Z).
- Riesgos residuales: `ready` no garantiza cupo/red; la cuenta local es solo para pruebas. La configuración de cuenta independiente queda explícitamente para un slice futuro.
