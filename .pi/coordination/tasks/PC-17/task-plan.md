# Plan de tarea: PC-17

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: responsable de Pi-Coach
- Creado: 2026-10-13T18:09:59Z
- Última actualización: 2026-10-14T00:53:26Z
- Aprobación vigente: solicitud humana explícita PC-17, Sdk→Cod→Rev APPROVE ciclo1/ronda0 y `QA OK PC-17` comunicado por la persona responsable el 2026-10-14. Implementación y registro previo publicados en origin/master en commits `86f3cedf5abf7aa293999f8713dd68c3ad84ac54` y `e7a1dec2b30099278deb58a60a8eec39f5c21c82` según confirmación humana. Registro de cierre preparado para commit exclusivo PC-17; el estado `DONE` no depende del hash de ese commit.

## Objetivo

En prácticas nuevas, Character usa `openai-codex/gpt-6-luna` con thinking `low`, y Evaluator usa `openai-codex/gpt-6-sol` con thinking `medium`. Mantener contrato HTTP, aislamiento de sesiones y todo lo demás.

## Alcance

### Incluido

- Sdk verifica en SDK instalado 1.0.1 disponibilidad de ambos modelos y forma correcta de elegirlos en `createAgentSession`, sin alterar autenticación, configuración de proveedor ni modelos globales.
- Cod implementa mínimos cambios en factory/llamadas de creación de sesión y pruebas offline de selección por rol y fallo de modelo no disponible, según análisis Sdk.
- Rev revisa modelo/thinking correcto en ambas sesiones y regresiones de API/errores/herramientas, diff y secretos. Smoke local HTTP sin proveedor, sin afirmar conversación validada; QA manual humana posterior.
- Commit/push de solo archivos PC-17 tras revisión aprobada y comprobaciones técnicas; registrar hash/ref y stage explícito. No incluir otros cambios locales. Push no implica QA OK ni DONE.

### Fuera de alcance

- Autenticación, proveedor distinto de openai-codex, API HTTP, contenido/frameworks/escenarios, otros defaults, dependencias, PC-15/PC-16/research, `.gitignore`, `README.md` o configuración local.
- No llamadas al proveedor para comprobar por cuenta de agentes sin autorización específica; metadata/disponibilidad de modelo no prueba auth ni calidad conversacional. No cambiar runtime pi-link.

## Evidencia Sdk

- API SDK/modelos: Sdk confirma en catálogo instalado pi-ai 1.2.0 ambos IDs `openai-codex/gpt-6-luna` y `gpt-6-sol`, type chat/reasoning y mapas low/medium respectivos. ModelRuntime.getModel/getModels leen catálogo sin comprobar auth; mantener `getAvailable(provider)` preflight existente, seleccionar ambos IDs exactos y fallar si falta cualquiera.
- Autenticación/modelo: conservar ModelRuntime.create/getAvailable como están; no inspeccionar/loguear credenciales, fallback, refresh ni proveedor. Catálogo no garantiza acceso real; QA futura.
- Semántica de sesión: añadir role explícito `character`/`evaluator` a createSession, validar rol+nivel; cada sesión inMemory con noTools all, loader flags y compaction disabled como hoy.
- Límites: initializationError existente mapea indisponibilidad a service_unavailable sin exposición de detalles; comprobarlo, no HTTP nuevo.

## Decisiones confirmadas

| Fecha | Decisión humana | Impacto |
| --- | --- | --- |
| 2026-10-13 | Character = openai-codex/gpt-6-luna, thinking low; Evaluator = openai-codex/gpt-6-sol, thinking medium. | Solo defaults por rol, sin otros cambios. |
| 2026-10-13 | Autoriza commit/push exclusivamente de archivos PC-17 tras comprobaciones técnicas y revisión, antes de QA manual. | Stage explícito y verificación; push no cierra tarea ni acredita conversación. |
| 2026-10-13 | QA manual posterior pendiente. | No QA OK, DONE ni Doc antes de confirmación humana. |

## Contrato técnico

- HTTP: métodos, rutas, entradas/salidas, códigos y sesiones opacas sin cambio (`src/server.mjs`).
- Creación: pasar `role:'character', thinkingLevel:'low'` y `role:'evaluator', thinkingLevel:'medium'` desde TrainingService; factory mapa cerrado de IDs/niveles y preflight `getAvailable` de ambos modelos exactos antes de devolver factory. Rechazar role/level desconocido o discordante antes de crear sesión/loader, sin fallback ni aceptar modelo/rol desde HTTP. Inicialización fallida mantiene error sanitizado `service_unavailable`.
- Errores: conservar comportamiento del producto ante inicialización/modelo no disponible, sin ampliar superficie HTTP; verificar `503` si initializationError y que fallos en create cancelen/liberen sesiones conforme comportamiento existente.
- Secretos/configuración: no leer, imprimir ni cambiar auth.json, keys, variables sensibles, provider config, modelos globales ni prompts de producto.

## Implementación autorizada

- Archivos autorizados: `src/sdk-session-factory.mjs`, `src/training-service.mjs`, `test/training-service.test.mjs` y, si una prueba de contrato SDK puede añadirse sin exponer/injectar APIs administrativas en producto, `test/sdk-session-factory.test.mjs` nuevo. Si requiere modificar API pública o mock complejo que implique configuración sensible, consultar Orc antes de hacerlo. Ningún otro archivo producto/doc/deps.
- Dependencias: ninguna.
- Rutas protegidas: `.gitignore`, `README.md`, `.pi/coordination/tasks/PC-15/`, `.pi/coordination/tasks/PC-16/`, research untracked, auth/config, package.json/lock.
- Git: APPROVE Rev y comprobaciones técnicas reportadas. Persona responsable validará stage y hará commit/push en destino actual `origin/master` bajo autorización original aclarada; no otra solicitud de aprobación. Stage explícito de seis archivos: `src/sdk-session-factory.mjs`, `src/training-service.mjs`, `test/training-service.test.mjs`, `test/sdk-session-factory.test.mjs`, `.pi/coordination/tasks/PC-17/task-plan.md`, `.pi/coordination/tasks/PC-17/ledger.md`. Solo Orc edita los dos registros; persona los incluye en Git tras validar. Revisar diff staged completo y que no haya otros archivos, sin force/tags/merge ni stash/reset/clean ajenos. Commit/push no significa QA OK ni DONE.

## Criterios de finalización técnica

- Tests offline comprueban creación de sesiones con roles/levels en orden, aislamiento y cleanup ante fallo del segundo rol; selección exacta de IDs/fallo por falta de modelo comprobados mediante test de factory sin llamadas proveedor si viable o inspección estática/catalog más test de servicio con dobles y limitación explícita. No añadir inyección administrativa al producto solo para test. Factory conserva noTools/loader/manager y sin fallback.
- `npm run check`, `node --test`, import ESM, arranque/GET health/catalog y errores negativos HTTP sin proveedor cuando puerto libre, `git diff --check`; manifest/audit solo lectura si necesario.
- Rev APPROVE ciclo1/ronda0 emitido con revisión API SDK/contratos/sesiones/secretos y tests focalizados 10/10, checks Cod/persona 35/35 y smoke sin proveedor reportados. Commit/push exclusivo de los seis archivos PC-17 a `origin/master` ya autorizado tras verificación humana del stage; ninguno es QA OK.

## Revisión técnica

- Iteración QA: `0`
- Ciclo técnico: `1`
- Ronda técnica: `0`
- Fuente: solicitud humana PC-17; Cod entregó REVIEW REQUEST ciclo1/ronda0 y Rev emitió APPROVE independiente tras reanudación por límite de uso. Persona responsable confirmó `QA OK PC-17` el 2026-10-14 tras validación manual. Los commits PC-17 fueron publicados por la persona en `origin/master`; Orc no ejecutó Git remoto.
- Comandos: `npm run check`, `node --test`, `git diff --check`, inspección de diffs/estado, smoke local controlado sin proveedor.

## QA humana desde PowerShell

- Comando propuesto: PowerShell desde raíz, servidor propio `node .\src\server.mjs`; en otra terminal GET `/health` y `/frameworks`, luego `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\chat.ps1` para prácticas nuevas HEART immediate-and-final y GROW final. Evitar publicar transcript/credenciales.
- Resultado esperado: funcionamiento conversacional con los defaults solicitados sin regresiones observadas; identidad/nivel no son visibles por HTTP y se verificaron por código/SDK en revisión.
- Resultado observado: la persona responsable comunicó expresamente «QA ok» el 2026-10-14 tras la validación manual pendiente. No facilitó transcript ni desglose adicional; no inferir cobertura exhaustiva ni atribuir su QA a tests automáticos.
- Estado: `QA OK` humano; tarea cerrada.

## Documentación

- Archivos autorizados: ninguno para documentación del producto en PC-17, incluso tras QA OK; README y demás docs permanecen fuera de alcance.
- Doc: no se despacha al no existir cambio documental autorizado/solicitado. Si la persona quiere documentar defaults, abrir autorización documental separada; el cierre de PC-17 no depende de ella.
