# Ledger de tarea: PC-14

> Solo `Orc` actualiza este archivo.

## Bindings

| Rol | Terminal | Cwd | Estado inicial |
| --- | --- | --- | --- |
| Orc | Orc | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | activo |
| Cod | Cod | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | pendiente |
| Rev | Rev | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | pendiente |

## Transiciones

| Fecha/hora | Estado | Emisor o receptor | Evento/callback | Siguiente paso |
| --- | --- | --- | --- | --- |
| 2026-09-16T15:45:52Z | DRAFT | Persona responsable → Orc | Solicita continuar con comparación contra baseline PC-12 después del cierre PC-13. | Esperar `APROBADO PC-14`. |
| 2026-09-16T15:55:35Z | DRAFT | Persona responsable → Orc | Acepta recomendación de comparar variantes intercaladas. Plan actualizado a original-1 → candidate-1 → candidate-2 → original-2; requiere ampliar presupuesto por cuatro corridas. | Esperar aprobación explícita de PC-14 con 500 operaciones/2M tokens/60 min best-effort. |
| 2026-09-16T15:59:03Z | IMPLEMENTING | Persona responsable → Orc → Cod | `APROBADO PC-14`; `link_list` confirma Cod idle/cwd correcto. Presupuesto/control aprobados para tarea; no hay mandato de proveedor. | Cod implementa candidata, selector interno de benchmark, salida saneada separada y pruebas; entrega REVIEW REQUEST a Rev. |
| 2026-09-16T16:02:54Z | IMPLEMENTING | Cod → Rev → Orc → Cod | `0afe498` entregado; Rev `CHANGES_NEEDED` ronda 0: presupuesto/parada se reinician por corrida y entrypoint permite baseline PC-12/replace con candidate. `link_list` confirma Cod trabajando. | Cod corrige ronda 1: presupuesto/stop globales entre cuatro corridas y bloqueo de baseline antes de runtime/escritura; añade pruebas fake; reenvía REVIEW REQUEST a Rev. |
| 2026-09-16T20:16:13Z | IMPLEMENTING | Cod → Rev → Orc → Cod | `a81cf0e` entregado; Rev `CHANGES_NEEDED` ronda 1: auth en end y fallos/timeout de create no propagan parada/counters globales; `link_list` confirma Cod trabajando en corrección. | Cod corrige ronda 2: estado/contadores globales en create/send/end y pruebas fake auth-end, dos create provider/timeout y orden sin errores; reenvía REVIEW REQUEST a Rev. |
| 2026-09-16T20:17:30Z | QA_PENDING | Cod → Rev → Orc | `6af22ac` entregado; Rev `APPROVE` ronda 2: candidata, presupuesto/parada global, rutas y 31/31 pruebas correctas. | Esperar mandato humano `EJECUTAR CANDIDATA PC-14`; después PowerShell ejecuta comparación y Orc consolida informe. |
| 2026-09-16T20:49:01Z | DOCUMENTING | Persona responsable → Orc → Doc | Persona responsable confirma que terminó la ejecución y solicita informe inglés para cerrar; cuatro artefactos PC-14 están presentes y no trackeados; `link_list` confirma Doc idle/cwd correcto. | Doc redacta informe sano basado solo en artefactos; Rev revisa informe/artefactos antes de cierre y publicación. |
| 2026-09-16T20:53:09Z | REVIEWING | Doc → Orc → Rev | Doc entregó/pushed `93bd063`: cuatro artefactos saneados e informe inglés; `git show --stat` confirma cinco archivos de research y `link_list` confirma Rev idle/cwd correcto. | Rev revisa exactitud de agregados, límites/conclusiones, privacidad y alcance antes de cierre. |
| 2026-09-16T20:54:51Z | DOCUMENTING | Rev → Orc → Doc | `CHANGES_NEEDED` documental ronda 0: informe omite desglose agregado por expectativa ALLOW/BLOCK requerido por plan; resto de datos, schema saneado, privacidad y cautelas correctos. `link_list` confirma Doc idle/cwd correcto. | Doc añade tabla exacta ALLOW/BLOCK a informe; Rev revisa ronda documental 1. |
| 2026-09-16T20:58:08Z | REVIEWING | Doc → Orc → Rev | Doc entregó/pushed `f1bf068`, un archivo/informe solamente; `git show --stat` y `link_list` confirman scope y Rev idle/cwd correcto. | Rev revisa tabla ALLOW/BLOCK y cautela interpretativa; cerrar si aprueba. |
| 2026-09-16T20:58:50Z | DONE | Rev → Orc | Rev `APPROVE` documental ronda 1: tabla ALLOW/BLOCK correcta, cautelas intactas, sin cambios fuera de informe; no requiere QA adicional. | Cerrar PC-14 y publicar registros de coordinación. |

## Decisiones

- Candidata propuesta: eliminar solo la interpolación redundante de `framework.evaluatorPrompt` en cuerpo VALIDATE; system prompt, contenido y flujo quedan intactos.
- Comparación propuesta: original-1 → candidate-1 → candidate-2 → original-2, con modo interno no expuesto por API y artefactos separados.
- Baseline aceptada: PC-12, 57/57 decisiones correctas, mediana 1,655 ms, p95 3,221 ms.
- Presupuesto propuesto: 500 operaciones, 2M tokens y 60 min best-effort; 444 operaciones mínimas antes de reintentos.
- Cualquier ejecución contra proveedor requiere mandato humano separado.

## Ciclos técnicos

| Iteración QA | Ciclo | Fuente y aclaración | Contexto actualizado | Acción |
| --- | --- | --- | --- | --- |
| 0 | 1 | PC-11 recomienda candidata A; PC-12 estableció baseline aceptada. | Comparación de una sola candidata, pendiente de aprobación. | Esperar aprobación; luego Cod. |

## Rondas de revisión

| Iteración QA | Ciclo | Ronda | Entrega de Cod | Hallazgo de Rev | Acción |
| --- | --- | --- | --- | --- | --- |
| 0 | 1 | 0 | `0afe498`: candidata mínima, selector y runner; checks/tests OK. | CHANGES_NEEDED: límites/parada por corrida y ruta legacy puede sobrescribir PC-12. | Cod corrige ronda 1. |
| 0 | 1 | 1 | `a81cf0e`: presupuesto compartido y bloqueo baseline; checks/tests OK. | CHANGES_NEEDED: parada global incompleta en create/end y contadores de error. | Cod corrige ronda 2. |
| 0 | 1 | 2 | `6af22ac`: auth/fallos/timeout globales corregidos; checks/tests OK. | APPROVE: runner/control/privacidad/candidata correctos. | Esperar QA humana de comparación real. |

## QA humana

- `APROBADO PC-14` recibido para implementación y presupuesto de comparación; Rev `APPROVE` ronda 2.
- Ejecución humana completada; cuatro artefactos candidate/original presentes, con estado completed/none según análisis Orc.
- Persona responsable acepta candidata para cierre condicionado a informe inglés/revisión estática.
- Comando ejecutado por la persona responsable: `node .\scripts\baseline-harness.mjs --approved-candidate --execute-candidate` (no usar replace por defecto).

## Cierre

- Estado final: `DONE` (2026-09-16T20:58:50Z).
- Riesgos residuales: variación externa de proveedor; la candidata reduce contexto y coste SDK estimado en este corpus, pero caching no garantiza menor latencia/coste ni resultados generales.
