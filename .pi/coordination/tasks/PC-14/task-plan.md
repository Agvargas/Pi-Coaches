# Plan de tarea: PC-14

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: usuario responsable de Pi-Coach
- Creado: 2026-09-16T15:45:52Z
- Última actualización: 2026-09-16T20:58:50Z
- Aprobación vigente: `APROBADO PC-14` (2026-09-16T15:59:03Z), ejecución humana y aceptación de candidata registradas; Rev `APPROVE` técnico ronda 2 (`6af22ac`) y documental ronda 1 (`f1bf068`)

## Objetivo

Aplicar una única candidata de reducción de contexto en `VALIDATE` y medirla contra la baseline aceptada PC-12, sin cambiar semántica, modelo, thinking, sesiones, historial, corpus ni API.

## Candidata única

Quitar solo la copia de `framework.evaluatorPrompt` del cuerpo enviado a `evaluatorSession` durante `MODE: VALIDATE`.

Se conserva sin cambios:

- `framework.evaluatorPrompt` como system prompt de Evaluator al crear su sesión.
- `MODE: VALIDATE`, situación, transcript, mensaje, orden `VALIDATE → Character → feedback`, sesiones, locks, timeout, cleanup y decisiones.
- Prompts de `IMMEDIATE_FEEDBACK` y `FINAL_FEEDBACK`.

Evidencia: `src/training-service.mjs` crea Evaluator con `systemPrompt: framework.evaluatorPrompt` y vuelve a interpolar ese mismo texto solo en el cuerpo de VALIDATE. PC-11 recomendó exactamente esta candidata.

## Alcance

### Incluido

- Cambio mínimo de la construcción de prompt VALIDATE.
- Pruebas sin proveedor que demuestren: system prompt preservado; cuerpo VALIDATE no contiene copia evaluatorPrompt; conserva modo/situación/transcript/mensaje; BLOCK/ALLOW y orden permanecen.
- Hacer el runner PC-12 reutilizable para escribir artefactos saneados por variante, sin sobrescribir baseline PC-12, mediante etiqueta/ruta explícita y validada de CLI.
- Añadir selección interna y no expuesta por API de cuerpo VALIDATE `original`/`candidate`, usada solo por el runner: servidor conserva candidata como comportamiento por defecto; el runner puede medir ambas contra las mismas sesiones/factory.
- Ejecutar la misma batería aprobada PC-12 en cuatro corridas intercaladas, solo tras revisión estática y mandato humano explícito: `original-1 → candidate-1 → candidate-2 → original-2`.
- Informe de comparación agregado original/candidata: exactitud, latencia total/BLOCK/ALLOW, input/cache/output/coste estimado comparables, cobertura, errores/reintentos, efecto de orden y limitaciones.

### Fuera de alcance

- Thinking/modelo/proveedor/configuración SDK, cambios de sesión/cacheRetention, recorte/resumen de historial, paralelismo, otra candidata, cambios de prompts de contenido, API/HTTP, dependencias, reintentos, persistencia, telemetría pública o optimización adicional.
- Prometer hit de caché, ahorro facturado/cuota, causalidad absoluta o mejora sin la ejecución controlada.

## Comparación

- Referencia inmutable: `.pi/coordination/research/pc-12-baseline.json` y `pc-12-baseline-report.md`.
- Artefactos propuestos: `.pi/coordination/research/pc-14-original-1.json`, `pc-14-candidate-1.json`, `pc-14-candidate-2.json` y `pc-14-original-2.json`; nunca usar `--replace-existing` sobre baseline.
- Mismo corpus, tres repeticiones, framework/modo/orden interno, modelo, thinking, límites y rutas de código salvo el cuerpo VALIDATE elegido.
- Agregar globalmente, por expectativa BLOCK/ALLOW, por variante y por posición de ejecución. Comparar medianas/p95 como descriptivos, tokens absolutos y ratio cache ponderado; no promediar CH.
- Si uso es parcial, conservar política PC-12 B: latencia/decisiones comparables, tokens/coste solo cuando observados y `limitVerified:false` cuando corresponda.
- Resultado es observacional: ejecuciones separadas pueden variar por carga del proveedor. Una mejora requiere sin regresiones de exactitud y señal coherente en varios agregados; no se declara causalidad solo por una cifra.

## Presupuesto y parada

- Propuesta pendiente de aprobación: máximo de mejor esfuerzo 500 operaciones, 2M tokens y 60 minutos. Cuatro corridas requieren aproximadamente 444 operaciones antes de reintentos; PC-12 observó 215,722 tokens por corrida, por lo que cuatro equivalen aproximadamente a 862,888 tokens conocidos. No iniciar operaciones nuevas al alcanzar un límite, sin cancelar operación/reintento ya iniciado.
- Detener en auth, dos fallos consecutivos de proveedor, timeout repetido o regresión de `immediate-reference`/`earlier-reference`.
- La persona responsable autoriza por separado `EJECUTAR CANDIDATA PC-14` antes de proveedor.

## Evidencia de Sdk

- PC-11/PC-12: sessionId puede actuar como `prompt_cache_key`, pero hit/TTL/beneficio no garantizados; cache no reutiliza respuesta ni elimina generación.
- No se cambia el uso SDK, modelo, settings, sesiones ni observador PC-12; no se requiere nueva decisión SDK salvo que análisis detecte contradicción.

## Contrato técnico

- Sin cambios HTTP/API ni contenido público/privado.
- La nueva opción de salida es exclusiva del script local de benchmark, requiere ruta permitida bajo `.pi/coordination/research/`, no acepta rutas arbitrarias ni sobrescribe por defecto.
- Artefactos siguen sin mensajes, prompts, transcript, IDs de sesión, headers, credenciales o razonamiento.

## Implementación autorizada tras aprobación

- Producto/tests: `src/training-service.mjs`, `scripts/baseline-harness.mjs`, `test/training-service.test.mjs`, `test/training-observation.test.mjs`, `test/baseline-harness.test.mjs` solo si necesario.
- Coordinación: `.pi/coordination/tasks/PC-14/` solo Orc; informe/artefacto PC-14 solo tras ejecución humana autorizada.
- Prohibidos: `package*.json`, dependencias, server/API, factory/settings/modelo, contenido de entrenamiento, README hasta QA humana de candidata.

## Criterios de finalización

- Review confirma la candidata mínima y que no cambia semántica/privacidad/API.
- Baseline PC-12 preservada; artefacto candidato separado y saneado.
- Persona responsable ejecuta las cuatro corridas intercaladas desde PowerShell tras mandato explícito.
- Informe compara resultados, efecto de orden y limitaciones; persona responsable acepta o rechaza candidata.

## Revisión técnica

- Iteración QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente: candidata A PC-11, baseline PC-12 aceptada.
- Comprobaciones: `node --check`, `node --test test/*.test.mjs`, `npm ls`, `git diff --check`, inspección de prompt/API/secretos.

## QA humana desde PowerShell

- Ejecución completada por la persona responsable con `node .\scripts\baseline-harness.mjs --approved-candidate --execute-candidate`.
- Cuatro artefactos separados completados; la persona responsable aceptó la candidata con las limitaciones del informe.

## Documentación

- Informe interno de comparación bajo `.pi/coordination/research/` tras ejecución autorizada.
- No README hasta aceptación humana de una candidata.
