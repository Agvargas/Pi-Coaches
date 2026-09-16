# Ledger de tarea: PC-12

> Solo `Orc` actualiza este archivo.

## Bindings

| Rol | Terminal | Cwd | Estado inicial |
| --- | --- | --- | --- |
| Orc | Orc | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | activo |
| Sdk | Sdk | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | pendiente |
| Cod | Cod | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | pendiente |
| Rev | Rev | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | pendiente |

## Transiciones

| Fecha/hora | Estado | Emisor o receptor | Evento/callback | Siguiente paso |
| --- | --- | --- | --- | --- |
| 2026-09-15T21:35:41Z | DRAFT | Persona responsable → Orc | Solicita documentos para medir baseline de VALIDATE antes de optimizar cache. | Esperar `APROBADO PC-12`. |
| 2026-09-15T21:38:36Z | APPROVED | Persona responsable → Orc | `APROBADO PC-12`; solicita compactar Sdk y Rev antes de análisis/implementación. | Compactar ambos; luego verificar terminales y despachar Sdk. |
| 2026-09-15T21:42:24Z | ANALYZING | Orc → Sdk | `link_compact` completó Sdk/Rev; `link_list` confirma Sdk idle y cwd correcto. | Recibir diseño de instrumentación/métricas sin llamadas reales. |
| 2026-09-15T21:45:26Z | DECISION_PENDING | Sdk → Orc | `DONE`: hook opcional/allowlist seguro viable; corpus 8×3 excede límite 60 y retries/timeout impiden prometer techo duro actual. | Solicitar decisión humana de presupuesto/cobertura, límites best-effort/configuración y retención del artefacto antes de Cod. |
| 2026-09-15T22:04:28Z | DECISION_PENDING | Persona responsable → Orc | Decisiones parciales PC-12: 1B (8 casos × 3 repeticiones) y 3B (JSON saneado bajo research; no publicar). | Explicar/decidir política de reintentos y límite antes de Cod. |
| 2026-09-15T22:07:07Z | IMPLEMENTING | Persona responsable → Orc → Cod | Decisiones PC-12: 1B (8 propiedades × 3 repeticiones, 150 llamadas/2M tokens/60 min best-effort); 2A (reintentos actuales); 3B (JSON saneado bajo research, no publicar). `link_list` confirmó Cod idle/cwd correcto. | Implementar hook/harness fake; no ejecutar proveedor hasta revisión y autorización explícita. |
| 2026-09-15T22:12:02Z | DECISION_PENDING | Cod → Orc | `QUESTION`: corpus real, definición/denominador de exactitud/CH y ruta de artefacto no están autorizados; pide decidir runner real o harness fake inyectable. | Solicitar decisión humana; no inventar corpus/métricas/ruta ni ejecutar baseline. |
| 2026-09-15T22:12:42Z | DECISION_PENDING | Rev → Orc | `CHANGES_NEEDED` ronda 0 sobre entrega parcial: runner no implementa baseline; observación no es opt-in/allowlisted ni registra decisión VALIDATE; faltan pruebas fake. Rev también exige escalar corpus si no está autorizado. | Esperar decisión B/A; luego Cod corrige alcance/defectos en ronda 1. |
| 2026-09-15T22:25:13Z | CORPUS_REVIEW | Persona responsable → Orc | Elige opción A (runner real preparado). Orc crea propuesta de corpus ficticio, criterios y contrato de artefacto. | Esperar `APROBADO CORPUS PC-12`; luego Cod corrige ronda 1 sin ejecutar proveedor. |
| 2026-09-15T22:32:13Z | CORPUS_REVIEW | Persona responsable → Orc | Solicita mayor peso BLOCK para validar velocidad y exactitud sin retirar ALLOW. Orc revisa propuesta a 10 BLOCK/9 ALLOW por repetición y separa agregados por expectativa. | Revisar corpus reequilibrado; esperar aprobación humana. |
| 2026-09-15T22:33:08Z | IMPLEMENTING | Persona responsable → Orc → Cod | `APROBADO CORPUS PC-12`; `link_list` confirma Cod idle/cwd correcto. | Corregir CHANGES_NEEDED ronda 0 e implementar runner/corpus aprobado sin ejecutar proveedor; solicitar revisión ronda 1. |
| 2026-09-15T22:48:48Z | IMPLEMENTING | Pi-Training → Orc → Cod | Auditoría autorizada actualizó skill/launcher Cod; no ejecutó producto/coordinación. `link_list` confirma Cod idle, cwd correcto y ~34% contexto. | Despacho de recuperación: releer instrucciones desde disco, inventariar cambios parciales y completar ronda 1. |
| 2026-09-15T22:49:25Z | BLOCKED | Cod → Orc | Recuperación termina sin error/callback: «No puedo completar íntegramente la recuperación PC-12 en esta respuesta». Evidencia JSONL auditada por Pi-Training: sí leyó AGENTS, protocolo, skills, plan/ledger/propuesta y código/harness, pero no ejecutó implementación. | No reintentar automáticamente; esperar decisión humana. |
| 2026-09-15T22:53:00Z | MODEL_SWITCH_PENDING | Persona responsable → Pi-Training → Orc | Autoriza prueba controlada: cambiar solo Cod de `openai-codex/gpt-5.6-terra` a `openai-codex/gpt-5.6-sol`, thinking medium; conservar sesión, rol, alcance, cambios parciales y contadores QA 0/ciclo 1/ronda 1. | Esperar confirmación de modelo/nivel; luego un único despacho acotado, sin baseline/proveedor. |
| 2026-09-15T22:54:17Z | IMPLEMENTING | Persona responsable → Pi-Training → Orc → Cod | Persona responsable confirma Sol/medium; `link_list` confirma Cod idle/cwd correcto (modelo no verificable por link). | Único despacho de recuperación controlada; si falla, registrar BLOCKED sin reintento automático. |
| 2026-09-15T23:00:33Z | IMPLEMENTING | Cod → Rev → Orc | Ronda 1 entregada/pushed `9a8bc5d` y REVIEW REQUEST aceptado. Rev ronda 1: CHANGES_NEEDED (5): usage por retries, práctica retirada/cobertura, clasificación auth SDK, cobertura/retries transporte, escritura exclusiva. | Cod corrige ronda 2 con fakes/checks, sin proveedor; solicitar revisión ronda 2. |
| 2026-09-16T14:10:50Z | BLOCKED → ANALYZING | Rev → Orc → Sdk | Rev `BLOCKED` ronda 2 en `9f9f62a`: preflight auth real se clasifica provider-failures; `usageComplete` no es booleano allowlisted; presupuesto descarta consumo conocido con usage incompleta. `link_list` confirma Sdk idle/cwd correcto. | Sdk debe aportar evidencia/contrato seguro; luego Orc presenta decisión de política de usage y abre ciclo nuevo solo con aclaración sustantiva. |
| 2026-09-16T14:13:07Z | DECISION_PENDING | Sdk → Orc | `DONE`: clasificación auth preflight acotada a dos prefijos SDK con 0 completions; usageComplete derivado; lower bound conocido. Recomienda parada estricta `usage-incomplete`, inconclusive y limitVerified false. | Pedir decisión humana strict-stop vs continuar inconcluso antes de ciclo 2/ronda 0. |
| 2026-09-16T14:33:38Z | IMPLEMENTING | Persona responsable → Orc → Cod | `DECISIÓN PC-12: B, priorizar latencia`: completar corpus aunque usage parcial; tokens/coste solo comparables/observados; `knownTokenLowerBound`, cobertura y `limitVerified:false`. `link_list` confirma Cod idle/cwd correcto. | Aclaración sustantiva registrada; abrir ciclo 2/ronda 0 y despachar Cod, sin proveedor. |
| 2026-09-16T14:36:41Z | REWORKING | Cod → Rev → Cod | Ronda 0 ciclo 2 entregada/pushed `4621c2e`; Rev `CHANGES_NEEDED`: lower bound conocido se pierde al nullificar DTO y faltan regresiones preflight/sanitizer/lower bound. `link_list` muestra Cod thinking, por lo que Rev ya entregó corrección técnica directa. | Esperar REVIEW REQUEST de Cod en ronda 1; no relé técnico de Orc. |
| 2026-09-16T14:37:47Z | REWORKING | Rev → Cod | Ronda 1 ciclo 2, commit `12e2645`: Rev confirma corregido el lower bound alto, pero `CHANGES_NEEDED` por regresiones faltantes; exige pruebas de valor/stop, preflight, sanitizer y parcial bajo límite. `link_list` confirma Cod thinking/cwd correcto. | Esperar REVIEW REQUEST de Cod en ronda 2; no relé técnico de Orc. |
| 2026-09-16T14:55:50Z | REWORKING | Persona responsable → Orc → Cod | Persona responsable solicita continuar hasta finalizar; Cod fue compactado y `link_list` confirma idle/cwd correcto. | Reanudar ronda 2 autocontenida; completar pruebas/checks/REVIEW REQUEST o BLOCKED con evidencia. |
| 2026-09-16T14:58:06Z | QA_PENDING | Cod → Rev → Orc | Ronda 2 ciclo 2 entregada/pushed `d365251`; Rev `APPROVE` tras 26/26 tests, revisión de lower bound/preflight/sanitizer/budget y privacidad. | Esperar mandato humano `EJECUTAR BASELINE PC-12`; no ejecutar proveedor sin él. |
| 2026-09-16T15:03:32Z | QA_PENDING | Persona responsable → Orc | `EJECUTAR BASELINE PC-12` recibido. | Persona responsable ejecuta comando PowerShell; Orc revisa artefacto saneado/resultados y consolida. |
| 2026-09-16T15:12:59Z | QA_PENDING | Persona responsable → Orc | PowerShell informó `$LASTEXITCODE=0` y artefacto existente. Orc revisó JSON saneado y creó informe agregado interno. | Esperar aceptación humana de baseline como referencia (`QA OK PC-12`) o resultado observado. |
| 2026-09-16T15:26:18Z | DONE | Persona responsable → Orc | `QA OK PC-12`; solicita traducción al inglés de informe/propuesta/investigación PC-11, cierre y publicación de cambios PC-11/PC-12 con baseline. | Traducir archivos solicitados, commit/push limitado y confirmar cierre. |

## Decisiones

- PC-11 recomienda baseline contra futura candidata A, pero no autoriza ejecución real, configuración de caché ni optimización.
- `APROBADO PC-12` recibido el 2026-09-15T21:38:36Z.
- El presupuesto y los textos exactos del corpus siguen pendientes de aprobación antes de llamadas reales.
- Sdk propone hook temporal, artifact JSON saneado local y pruebas fake primero; ejecución real bloqueada hasta decisiones de límite, cobertura y retención.
- Decisiones vigentes: 1B (8 propiedades × 3 repeticiones; 150 llamadas/2M tokens/60 min best-effort), 2A (reintentos actuales; no techo duro), 3B (JSON saneado bajo research, no publicar), A (runner real preparado, no ejecutado). Corpus y contrato: `baseline-corpus-and-runner-proposal.md`, aprobado por `APROBADO CORPUS PC-12`.
- Recuperación Cod Terra falló tras lectura efectiva, sin callback. La persona responsable autorizó una única prueba controlada con Cod Sol/medium; no cambia rol, alcance, launcher permanente, sesión, cambios parciales ni contadores.
- Sdk 2026-09-16: auth preflight puede categorizarse internamente con dos prefijos exactos y cero completions; no se exporta error.
- `DECISIÓN PC-12: B, priorizar latencia`: completar corpus con usage parcial; preservar mínimo conocido, reportar solo tokens/coste comparables, usar `usageCoverage`/`limitVerified:false` y no afirmar gasto total o cumplimiento del tope. Esta aclaración sustantiva abre ciclo técnico 2/ronda 0.

## Ciclos técnicos

| Iteración QA | Ciclo | Fuente y aclaración | Contexto actualizado | Acción |
| --- | --- | --- | --- | --- |
| 0 | 1 | Plan baseline creado; Sdk entregó diseño seguro y decisiones 1B/2A/3B recibidas. | IMPLEMENTING: hook/harness fake; proveedor bloqueado hasta revisión/autorización. | Cod en ronda 0. |
| 0 | 2 | `DECISIÓN PC-12: B, priorizar latencia` y evidencia Sdk de preflight/usage. | Continuar corpus con usage parcial, lower bound y límite no verificable; contrato de artefacto actualizado. | Cod en ronda 0 del ciclo 2. |

## Rondas de revisión

| Iteración QA | Ciclo | Ronda | Entrega de Cod | Hallazgo de Rev | Acción |
| --- | --- | --- | --- | --- | --- |
| 0 | 1 | 0 | Entrega parcial revisada. | CHANGES_NEEDED: runner incompleto, observación no opt-in/allowlist, faltan pruebas fake. | Esperar decisión de corpus; luego Cod corrige ronda 1. |
| 0 | 1 | 1 | `9a8bc5d` entregado; checks 17/17, sin proveedor. | CHANGES_NEEDED: acumulación usage, retiro/cobertura, auth SDK, cobertura/retries transporte, escritura exclusiva. | Cod corrige ronda 2. |
| 0 | 1 | 2 | `9f9f62a` entregado; checks 22/22, sin proveedor. | BLOCKED: auth preflight, `usageComplete` allowlist y presupuesto con usage parcial. | Sdk analiza; no tercera corrección automática. |
| 0 | 2 | 0 | `4621c2e` entregado; checks 22/22, sin proveedor. | CHANGES_NEEDED: known lower bound se pierde con usage parcial; faltan regresiones ciclo 2. | Cod corrige ronda 1 directamente desde Rev. |
| 0 | 2 | 1 | `12e2645` entregado; checks 22/22, sin proveedor. | CHANGES_NEEDED: regresiones de lower bound, preflight, sanitizer y usage parcial faltantes. | Cod corrige ronda 2 directamente desde Rev. |
| 0 | 2 | 2 | `d365251` entregado; checks 26/26, sin proveedor. | APPROVE: contratos de auth/preflight, usage parcial/lower bound, serializer, stop y pruebas fake. | QA humana: autorizar y ejecutar baseline real por PowerShell. |

## QA humana

- Rev aprobó estáticamente `d365251`; la baseline real fue ejecutada por la persona responsable con éxito y aceptada mediante `QA OK PC-12`.
- Comando usado: `node .\scripts\baseline-harness.mjs --approved-baseline --execute-baseline`; no se usó `--replace-existing`.

## Cierre

- Estado final: `DONE` (2026-09-16T15:26:18Z).
- Resultado: baseline completada (57/57 validaciones correctas), aceptada como referencia; informe y artefacto saneado bajo research.
- Riesgos residuales: baseline no demuestra que una futura optimización reduzca latencia/coste; transporte desconocido y coste SDK estimado.
