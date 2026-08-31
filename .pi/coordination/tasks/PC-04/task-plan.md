# Plan de tarea: PC-04

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `IMPLEMENTING`
- Persona responsable: aprobó `PC-04`
- Creado: 2026-08-31T19:49:00Z
- Última actualización: 2026-08-31T19:54:34Z
- Aprobación vigente: `APROBADO PC-04` (2026-08-31T19:54:34Z)

## Objetivo

Ofrecer una forma práctica de conversar desde PowerShell: un script interactivo que comprueba el servidor local, crea una sesión Coach, envía cada mensaje escrito y muestra la respuesta completa hasta que la persona escriba `/salir`.

## Alcance

### Incluido

- Crear `scripts/chat.ps1` sin dependencias adicionales.
- Verificar `GET /health` antes de iniciar y dar un mensaje claro si el servidor no está disponible.
- Crear una sesión con `POST /v1/sessions`, leer mensajes mediante `Read-Host` y enviarlos a la ruta de PC-03.
- Mostrar la propiedad `reply` completa, no como tabla truncada; aceptar `/salir` y `/ayuda` localmente.
- Validar localmente mensajes vacíos y mayores a 4.000 caracteres antes de solicitar al servidor.
- Mostrar errores HTTP del contrato como mensajes breves sin secretos ni detalles internos.
- Tras QA OK, autorizar a Doc a actualizar `README.md` con inicio local, uso del script, rutas actuales, límites y advertencia de consumo de cuota.
- Commit/push no forzados del slice, incluidos los cambios de coordinación autorizados.

### Fuera de alcance

- Cambiar `src/server.mjs`, contrato HTTP, SDK, modelo, prompt, pensamiento, aislamiento, credenciales, herramientas, persistencia, streaming, interfaz web, autenticación pública, login, dependencia nueva o iniciar/detener el servidor automáticamente.

## Evidencia de Sdk

- API o clase del SDK confirmada: No aplica; el script consume el contrato HTTP ya validado de PC-02/PC-03.
- Autenticación y modelo: No aplica; el script nunca accede a autenticación ni configuración de Pi.
- Semántica de sesión: El script crea un ID opaco por ejecución y lo reutiliza para cada mensaje hasta `/salir` o cierre del script.
- Riesgos y límites: Cada mensaje llama al proveedor a través del servidor y puede consumir cuota; la sesión se pierde si el servidor se reinicia.
- No aplica porque: No modifica el uso del SDK ni las decisiones cubiertas por PC-00 a PC-03.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-08-31 | Crear un chat interactivo PowerShell. | PC-04 implementa un cliente de terminal simple, no una interfaz web. |
| 2026-08-31 | El servidor y API existentes son la fuente única de conversación. | El script no contiene SDK, prompt ni credenciales. |

## Contrato técnico

- Método y ruta: Cliente PowerShell contra `GET /health`, `POST /v1/sessions` y `POST /v1/sessions/:sessionId/messages` existentes; no modifica servidor.
- Entrada JSON: El script genera `{}` y `{ "message": "<texto>" }`; no pide ni acepta modelo, prompt, claves o administración.
- Salida: Consola muestra `Coach: <reply completo>`; `/salir` cierra limpiamente; `/ayuda` muestra comandos locales.
- Errores esperados: Servidor no disponible, sesión no creada, respuesta HTTP 400/404/409/502 o error de red; mensaje claro y no sensible en consola.
- Semántica de sesión: Una sesión opaca por ejecución del script; contexto en memoria hasta salir o reiniciar servidor.
- Secretos/configuración: No leer, imprimir, solicitar, guardar ni modificar secretos/credenciales.

## Implementación autorizada

- Archivos permitidos: `scripts/chat.ps1`, `.pi/coordination/tasks/PC-03/{task-plan.md,ledger.md}`, `.pi/coordination/tasks/PC-04/{task-plan.md,ledger.md}` y `.git/` mediante Git. `README.md` queda reservado exclusivamente para Doc después de `QA OK`.
- Dependencias autorizadas: Ninguna.
- Archivos o rutas expresamente protegidos: `src/server.mjs`, package/lockfile, `.gitignore`, secretos, `auth.json`, `.vscode/`, `AGENTS.md` y `.pi/` fuera de PC-03/PC-04.
- Cambios explícitamente no permitidos: Cambios de servidor/API/SDK/configuración, login, web, persistencia, comandos para administrar Pi o push forzado.

## Criterios de finalización

- El script funciona desde PowerShell normal con el servidor ya iniciado; no usa terminales de agentes.
- Muestra respuestas completas y conserva el mismo ID de sesión durante la ejecución.
- Maneja `/salir`, `/ayuda`, mensaje vacío, mensaje largo y servidor no disponible sin exponer detalles internos.
- Cod confirma/push; Rev aprueba; persona responsable mantiene una conversación real desde PowerShell.
- Tras `QA OK`, Doc actualiza solo `README.md` y confirma; entonces PC-04 queda DONE.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente del ciclo: PC-04 aprobado; Cod implementa solo cliente PowerShell y entrega a Rev en ronda 0.
- Riesgos a comprobar: truncar respuesta, mostrar secretos/detalles de error, no reutilizar sesión, manejar mal PowerShell/UTF-8, crear servidor adicional.
- Comandos de comprobación estática: validación de sintaxis PowerShell sin ejecutar el bucle, revisión de rutas/secretos y Git sin secretos.

## QA humana desde PowerShell

- Comando: Con `npm start` en una consola normal: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\chat.ps1` en otra.
- Resultado esperado: Muestra ayuda/inicio, permite enviar varios mensajes, imprime respuestas completas y `/salir` termina; puede consumir cuota.
- Resultado observado: Pendiente.
- Estado: pendiente

## Documentación

- Archivos autorizados: `README.md`, solo tras `QA OK` y solo por Doc.
- Contenido que solo podrá documentarse después de `QA OK`: requisitos Node/Pi, inicio de servidor, comando del chat, comandos `/ayuda` y `/salir`, rutas actuales, límite de sesión en memoria, cuota y ausencia de interfaz web.
