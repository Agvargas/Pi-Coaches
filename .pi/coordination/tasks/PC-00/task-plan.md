# Plan de tarea: PC-00

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: aprobó y confirmó decisiones de `PC-00`
- Creado: 2026-08-31T17:47:03Z
- Última actualización: 2026-08-31T18:50:41Z
- Aprobación vigente: `APROBADO PC-00` (2026-08-31T18:24:43Z); pruebas con cuenta local actual autorizadas; cuenta dedicada independiente requerida para un slice futuro

## Objetivo

Confirmar requisitos mínimos verificables antes de implementar el servidor Node.js local de Pi-Coach: versiones de Node.js y npm, disponibilidad de un modelo de Pi autenticado sin revelar secretos, APIs mínimas del SDK para una conversación real y una propuesta de comprobación posterior desde PowerShell.

## Alcance

### Incluido

- Comprobar versiones de Node.js y npm.
- Confirmar que Pi dispone de un modelo autenticado, sin mostrar ni registrar secretos.
- Investigar el paquete y las APIs mínimas del SDK de Pi para una conversación real.
- Proponer un comando de comprobación posterior desde PowerShell.

### Fuera de alcance

- Crear código del servidor.
- Instalar dependencias.
- Modificar configuración de autenticación.
- Despachar trabajo antes de la aprobación humana.

## Evidencia de Sdk

- API o clase del SDK confirmada: `ModelRuntime.create()`, `getAvailable()`, `createAgentSession()`, `SessionManager.inMemory()`, `session.prompt()`, `getLastAssistantText()` y `dispose()`; evidencia en `docs/sdk.md` y tipos instalados.
- Autenticación y modelo: `pi auth check --provider openai-codex --model gpt-5.6-terra --no-refresh` devolvió `ready`, sin refrescar ni mostrar credenciales; la documentación instalada clasifica `openai-codex` como OAuth de suscripción ChatGPT Plus o Pro. PC-02 debe fijar el modelo interno y comprobarlo con `getAvailable()`; no aceptar modelo desde HTTP.
- Semántica de sesión: mapa privado `ID opaco -> AgentSession` con `SessionManager.inMemory()`; mensajes posteriores usan `session.prompt(text)`; no persiste tras reinicio; solicitudes concurrentes se serializan o devuelven sesión ocupada.
- Riesgos y límites: por defecto el SDK descubre recursos de desarrollo; PC-02 usará cargador explícito aislado y `noTools: "all"`. `prompt()` y disponibilidad del modelo pueden fallar; se requiere error HTTP controlado y `dispose()` al cerrar.
- No aplica porque: no aplica; este slice investiga el SDK y exige análisis de Sdk tras aprobación.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-08-31 | No implementar servidor, instalar dependencias ni modificar autenticación en PC-00. | Investigación y comprobaciones no destructivas únicamente. |
| 2026-08-31 | Usar cargador explícito aislado, sin descubrimiento de recursos de desarrollo y con `noTools: "all"`. | PC-02 no heredará `AGENTS.md`, skills, extensiones ni herramientas de desarrollo. |
| 2026-08-31 | Usar inicialmente un Coach genérico, sencillo y sin complejidades; el prompt específico llegará después. | Prompt confirmado: “Eres un coach de apoyo general. Ayuda a la persona a aclarar objetivos y próximos pasos mediante preguntas breves. Sé respetuoso, práctico y honesto sobre tus límites. No ejecutes acciones externas ni solicites o reveles credenciales.” |
| 2026-08-31 | Usar modelo interno `openai-codex/gpt-5.6-terra` con pensamiento `low`. | Se validará en `getAvailable()` al iniciar; no se aceptará modelo ni pensamiento desde HTTP. |
| 2026-08-31 | Usar la cuenta Plus/Pro local actual solo para pruebas de PC-02. | El servidor local se ejecutará bajo el mismo usuario y reutilizará su credencial de Pi, sin exponerla. |
| 2026-08-31 | Configurar posteriormente una cuenta exclusiva e independiente para el servidor. | Requisito para un slice futuro de identidad/despliegue; se investigará un contexto aislado (preferiblemente usuario/perfil de sistema separado) sin añadir login HTTP. |

## Contrato técnico

- Método y ruta: No aplica; no se crea API en PC-00.
- Entrada JSON: No aplica.
- Salida JSON: Informe de requisitos y propuesta de contrato para PC-02.
- Errores esperados: Herramienta no disponible, versión no detectable, modelo no disponible, fallo de `prompt()` o sesión ocupada; se informarán sin secretos.
- Semántica de sesión: Confirmada para futura implementación; no se implementa en PC-00.
- Secretos/configuración: No leer, mostrar, registrar ni modificar tokens, claves, `auth.json` ni variables de entorno sensibles.

## Implementación autorizada

- Archivos permitidos: Solo `.pi/coordination/tasks/PC-00/task-plan.md` y `.pi/coordination/tasks/PC-00/ledger.md` hasta aprobación; después, el análisis no autoriza cambios de producto.
- Dependencias autorizadas: Ninguna.
- Archivos o rutas expresamente protegidos: Código del producto, configuración de autenticación, secretos, `auth.json` y variables de entorno sensibles.
- Cambios explícitamente no permitidos: Servidor, dependencias, configuración de autenticación y despachos antes de `APROBADO PC-00`.

## Criterios de finalización

- La evidencia registra Node v24.14.1, npm 11.16.0 y SDK 0.84.4 (requiere Node >=22.19.0).
- Sdk confirmó proveedor listo y catálogo local autenticado sin exponer secretos.
- Sdk identificó APIs, sesiones, aislamiento, errores, cleanup y límites de conversación real.
- Se presenta una propuesta de comprobación PowerShell condicionada al contrato de PC-02.
- La persona responsable confirmó prompt, modelo interno, pensamiento y el uso temporal de la cuenta local para pruebas; PC-00 está listo para cerrar.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente del ciclo: PC-00 completada. La futura cuenta independiente requerirá contexto de usuario/perfil aislado y autenticación interactiva fuera de la API.
- Riesgos a comprobar: exposición accidental de secretos; confundir disponibilidad local con autenticación válida; inferir APIs sin evidencia del SDK.
- Comandos de comprobación estática: Pendientes de propuesta de Sdk; no se ejecutarán comandos que revelen secretos.

## QA humana desde PowerShell

- Comando: Pendiente de propuesta de Sdk después de la aprobación; no se presupone una ruta HTTP sin servidor ni contrato autorizado.
- Resultado esperado: Pendiente.
- Resultado observado: Pendiente.
- Estado: pendiente

## Documentación

- Archivos autorizados: Ninguno.
- Contenido que solo podrá documentarse después de `QA OK`: No aplica; no hay documentación autorizada en PC-00.
