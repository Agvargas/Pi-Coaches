# Plan de tarea: PC-12

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: usuario responsable de Pi-Coach
- Creado: 2026-09-15T21:35:41Z
- Última actualización: 2026-09-16T15:26:18Z
- Aprobación vigente: `APROBADO PC-12` (2026-09-15T21:38:36Z), `APROBADO CORPUS PC-12` (2026-09-15T22:33:08Z), `DECISIÓN PC-12: B, priorizar latencia`, `EJECUTAR BASELINE PC-12` y `QA OK PC-12`; baseline aceptada como referencia

## Objetivo

Crear una medición reproducible de línea base para la etapa `VALIDATE` del Evaluator, revisar su seguridad y exactitud, y ejecutar la medición real solo con presupuesto explícitamente aprobado. No optimizar caché ni modificar prompts, thinking, modelo, historial o sesiones hasta que la comparación baseline haya sido revisada.

## Secuencia obligatoria

```text
1. Sdk diseña instrumentación/uso seguro de usage y cache.
2. Cod implementa instrumentación mínima y harness/corpus aprobado.
3. Rev revisa contrato, privacidad y ausencia de cambios de comportamiento.
4. Persona responsable aprueba presupuesto y ejecuta/autoriza baseline real.
5. Orc consolida resultados; persona responsable decide una única candidata.
6. Nueva tarea separada implementa candidata, repite batería y compara.
```

Una tasa CH no es criterio de aceptación por sí sola. No se autoriza una candidata en esta tarea.

## Alcance

### Incluido

- Instrumentación interna u opt-in para registrar por `VALIDATE`: duración monotónica, etapa, turno, framework, modalidad, `input`, `cacheRead`, `cacheWrite`, `output`, coste estimado si el SDK lo proporciona, resultado ALLOW/BLOCK, error/timeout/retry.
- Todos los registros usan ID de caso, no mensajes, prompts, transcript, razonamiento, IDs de sesión, headers, claves o datos privados.
- Harness controlado que usa el flujo real del servicio/SDK y genera artefacto local de métricas agregadas y casos observados; no endpoint HTTP de métricas, no persistencia de producto.
- Corpus ficticio fijo con expectativas humanas y secuencias de varios turnos para relevancia contextual.
- Revisión estática antes de llamadas reales y consolidación posterior de baseline.

### Fuera de alcance

- Cualquier optimización de prompt caching, eliminación de instrucciones, cambio de thinking/modelo/proveedor, sesión adicional, recorte/resumen de historial, cambios de contrato HTTP, caché local, telemetría pública, base de datos, secretos, transcripciones, ejecución automática periódica o publicación de métricas.
- Prometer ahorro, latencia, hit rate o equivalencia con cuota de suscripción.

## Diseño de corpus baseline

Cada caso tiene solo ID, framework, modalidad, posición de turno, texto ficticio aprobado, expectativa y propiedad contextual. Los textos concretos se guardarán en un archivo de pruebas no público y no se incluirán en informes.

| ID lógico | Propiedad | Resultado esperado |
| --- | --- | --- |
| unrelated | Claramente ajeno al ejercicio | BLOCK |
| greeting | Saludo pertinente | ALLOW |
| weak-relevant | Intervención breve/débil pero relacionada | ALLOW |
| open-question | Pregunta abierta relevante | ALLOW |
| immediate-reference | Referencia a respuesta del turno previo | ALLOW |
| earlier-reference | Referencia a decisión de varios turnos atrás | ALLOW |
| long-relevant | Mensaje largo relacionado | ALLOW |
| late-unrelated | Ajeno tras conversación relevante | BLOCK |

Cobertura: HEART y GROW; `final` e `immediate-and-final`; secuencias reales para observar sesión continuada. El harness no debe evaluar calidad pedagógica libre: compara las decisiones con estas etiquetas humanas.

## Protocolo de comparación

La baseline y una candidata futura usarán el mismo commit de contenido, modelo, transporte, corpus, orden interno, límites y número de repeticiones. Las ejecuciones se intercalarán cuando exista candidata; no comparar solamente contra una prueba realizada otro día.

- Candidata fría: primera validación de una sesión nueva; no se afirma que el proveedor haya vaciado caché.
- Candidata caliente: continuación inmediata de la misma sesión con prefijo/historial real.
- Agregados: suma de `cacheRead` / suma de (`input` + `cacheRead` + `cacheWrite`), tokens absolutos, mediana y p95 descriptivo. No media simple de CH.
- Exactitud: falsos BLOCK de casos ALLOW y falsos ALLOW de casos BLOCK.

## Presupuesto y parada pendientes de decisión humana

Decisión humana vigente:

- Máximo de mejor esfuerzo: 150 llamadas de proveedor, incluyendo reintentos, Character, feedback y evaluación final. El harness deja de iniciar operaciones nuevas al alcanzar límite, pero no puede cancelar una operación/reintento ya iniciado.
- Máximo de mejor esfuerzo: 2M tokens agregados y 60 minutos, con la misma limitación de operación ya iniciada. Con `DECISIÓN PC-12: B, priorizar latencia`, se continúa si usage es incompleta, se conserva el mínimo conocido y se marca `limitVerified:false`; no se afirma cumplimiento del tope ni gasto total.
- No se establece equivalencia a cuota de suscripción; el informe muestra solo tokens/coste comparables y observados, separa cobertura parcial y se detiene según llamadas/tokens/tiempo cuando sean verificables.
- Detener al primer límite, error de autenticación, dos fallos consecutivos de proveedor, timeout repetido o regresión en `immediate-reference`/`earlier-reference`.
- El harness no reintenta automáticamente.

Si el corpus/cobertura exige más llamadas, reducir cobertura o solicitar una nueva decisión; no sobrepasar el límite.

## Evidencia de Sdk

- PC-11: CH es tasa de caché de la última respuesta assistant de la TUI, no cuota ni promedio; Codex puede usar sessionId como prompt_cache_key, pero hits/TTL/beneficio para Terra no están confirmados.
- PC-12: hook opcional interno recomendado en `prompt(session, value, observation?)`; listener temporal de `message_end` assistant y `auto_retry_start`, allowlist de números/etiquetas, unsubscribe en `finally`, recorder síncrono que nunca altera el flujo.
- Métrica VALIDATE segura: etapa/turno/framework/modalidad, duración, outcome, decisión, conteos de completions/reintentos observados y usage nullable. No IDs, payloads, prompts, transcript, error textual, reasoning, headers ni claves.
- Un máximo de 60 llamadas no garantiza ocho casos × tres repeticiones: el mínimo aislado de 22 por repetición lleva a 66 sin precursores; retries AgentSession por defecto y timeout de 90s impiden techo duro sin nueva decisión de configuración.
- Sdk confirmó que el artefacto debe ser JSON local, saneado, fuera de Git, y con retención/borrado decidido por la persona responsable.
- Decisiones PC-12: 1B (8 propiedades × 3 repeticiones, presupuesto ampliado); 2A (límites de mejor esfuerzo con reintentos actuales); 3B (JSON saneado bajo `.pi/coordination/research/`, no publicar sin decisión).

## Contrato técnico

- No hay cambios en la API de producto.
- La instrumentación no altera prompt, order `VALIDATE → Character → feedback`, decisiones ALLOW/BLOCK, sesiones, locks, errores o cleanup.
- El informe no debe incluir transcript, prompts, contexto privado, credenciales, IDs de sesión, headers, razonamiento ni configuración sensible.

## Implementación autorizada tras aprobación

- Inicialmente Sdk solo análisis.
- Tras evidencia Sdk y despacho Cod: `src/` solo para hook/instrumentación mínima necesaria; `scripts/` para harness explícitamente autorizado; `test/` para casos falsos; artefactos temporales fuera de Git o bajo ruta de coordinación autorizada.
- Prohibidos: `package*.json`, dependencias, README hasta resultados humanos confirmados, API/servidor público, configuración SDK/modelo y contenido de entrenamiento.

## Criterios de finalización

- Revisión técnica confirma que la instrumentación es opt-in/local, no registra contenido sensible y no cambia comportamiento.
- La persona responsable autoriza explícitamente el presupuesto antes de cualquier llamada real.
- Baseline real produce informe agregado reproducible o resultado inconcluso documentado.
- No se implementa candidata de caché dentro de PC-12.

## Revisión técnica

- Iteración QA actual: `0`
- Ciclo técnico actual: `2`
- Ronda actual: `0`
- Contexto vigente: baseline e instrumentación; decisión humana de completar corpus para latencia aun con usage parcial; ninguna optimización autorizada.

## QA humana desde PowerShell

- No aplica antes del baseline. Si se autoriza ejecución real, la persona responsable confirma presupuesto y revisa el informe; no equivale a QA de una optimización.

## Documentación

- Informe de baseline local de coordinación: `.pi/coordination/research/pc-12-baseline-report.md`.
- Sin README de producto hasta que una optimización separada tenga QA OK.
