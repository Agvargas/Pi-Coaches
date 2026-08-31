# Protocolo de coordinación de Pi-Coach

Este documento es el contrato entre las terminales Pi del proyecto. `pi-link` transporta mensajes en `localhost`; los planes, decisiones, estados y entregables se guardan en `.pi/coordination/` porque los mensajes de `pi-link` son efímeros.

## Roles

| Rol | Responsabilidad | No puede hacer |
| --- | --- | --- |
| `Orc` | Único contacto con la persona responsable; planifica, autoriza, registra estado y consolida resultados. | Modificar el producto o declarar una prueba humana aprobada. |
| `Sdk` | Analiza el uso correcto del SDK de Pi, autenticación, modelos, sesiones y límites técnicos. | Implementar código del producto o decidir arquitectura no confirmada. |
| `Cod` | Implementa únicamente el cambio autorizado. | Cambiar alcance, estado de tarea o exponer secretos. |
| `Rev` | Revisa estáticamente el código y sus contratos. | Editar archivos, instalar dependencias o declarar QA humana aprobada. |
| `Doc` | Documenta solo comportamientos ya confirmados por QA humana. | Documentar hipótesis o cambiar código. |
| Persona responsable | Define alcance, resuelve decisiones y ejecuta pruebas reales desde PowerShell. | No necesita coordinar directamente a los agentes. |

## Flujo

```text
Persona responsable <-> Orc
                        -> Sdk -> Orc
                        -> Cod -> Rev
                                 -> APPROVE -> Orc -> QA humana
                                 -> CHANGES_NEEDED -> Cod -> Rev
Persona responsable <-> Orc
                        -> Doc -> Orc
```

`Sdk` es obligatorio cuando el slice introduce o modifica el uso de Pi SDK, autenticación, modelos, sesiones o persistencia. Para cambios ya cubiertos por una decisión y evidencia existentes, `Orc` puede justificar que no aplica.

`Cod` y `Rev` solo pueden intercambiar un handoff de implementación y correcciones técnicas dentro del alcance autorizado. Las dudas sobre comportamiento, seguridad, arquitectura, modelo, credenciales o ampliación de alcance van a `Orc` como `QUESTION`.

Un **ciclo técnico** es una secuencia de revisión con el mismo contexto autorizado. Cada iteración de QA comienza en ciclo técnico `1`, ronda técnica `0`. La ronda `0` es la primera entrega de Cod a Rev; un `CHANGES_NEEDED` permite como máximo las entregas corregidas de las rondas `1` y `2`. Si Rev encuentra problemas que exigirían una tercera corrección, no la solicita: informa `QUESTION` o `BLOCKED` a Orc.

Orc inicia un nuevo ciclo técnico, con ronda `0`, únicamente cuando registra y despacha una aclaración sustantiva que cambie el alcance autorizado, contrato HTTP/SDK, decisión técnica confirmada, criterio de finalización o evidencia que cambie la implementación o revisión. La aclaración debe identificar su fuente. Mensajes administrativos, recordatorios, relecturas o peticiones de reintento sin cambio de contexto no reinician el ciclo.

## Estados

```text
DRAFT -> APPROVED -> ANALYZING -> IMPLEMENTING -> REVIEWING -> QA_PENDING -> DOCUMENTING -> DONE
                                  ^                 |
                                  |---- REWORKING ---|

Cualquier estado puede pasar a DECISION_PENDING o BLOCKED.
```

Solo `Orc` cambia el estado persistente. Un `QA FAIL` conserva el mismo ID de tarea, inicia una nueva iteración de QA y devuelve el trabajo a `IMPLEMENTING` con ciclo técnico `1`, ronda técnica `0`.

## Archivos persistentes

Para cada tarea, `Orc` crea:

```text
.pi/coordination/tasks/<TASK-ID>/task-plan.md
.pi/coordination/tasks/<TASK-ID>/ledger.md
```

- El plan contiene objetivo, alcance, contrato técnico, decisiones, archivos permitidos y criterios de finalización.
- El ledger registra cada transición, callback, decisión, ronda de revisión y resultado de QA.
- Los trabajadores no editan estos archivos salvo que una tarea lo autorice expresamente; normalmente nunca lo hace.

## Reglas de despacho

Antes de despachar, `Orc` debe comprobar `link_list` y registrar nombres de terminales y directorio de trabajo en el ledger.

Las tareas asíncronas se envían con `link_send(..., triggerTurn: true)`. Un acuse, plan parcial o actualización de progreso no completa una tarea. `Orc` espera el callback previsto; no usa `link_prompt` para vigilar a un agente ocupado.

Si un agente queda idle sin callback tras el umbral acordado, `Orc` registra el hecho y envía una única reanudación autocontenida. Si vuelve a quedar idle sin resultado, pasa la tarea a `BLOCKED` y te informa.

## Formato de tarea

```text
TASK: <PC-XX>
FROM: Orc
TO: Sdk | Cod | Rev | Doc
STATE: ANALYZING | IMPLEMENTING | REVIEWING | DOCUMENTING

Objetivo:
Contexto mínimo:
Decisiones confirmadas:
Alcance permitido:
Fuera de alcance:
Archivos permitidos:
Contrato técnico: No aplica | ruta, método, entrada, salida, errores, semántica de sesión
Evidencia de Sdk: No aplica | rutas y conclusiones verificables
Criterio de finalización:
Comprobaciones requeridas:
Prueba humana requerida:
Iteración de QA: <n>
Ciclo técnico: <n>
Ronda técnica: <0|1|2>
Ruta de callback:
```

Toda tarea debe ser autocontenida: las terminales no comparten memoria.

## Callbacks obligatorios

### Informe de Sdk o Doc

```text
DONE
TASK: <id>
Resultado:
Evidencia:
Riesgos o límites:
Siguiente paso sugerido:
```

### Entrega de Cod a Rev

```text
REVIEW REQUEST
TASK: <id>
AUTHORIZED BY: Orc
Iteración de QA: <n>
Ciclo técnico: <n>
Ronda técnica: <0|1|2>
Objetivo y alcance:
Decisiones y evidencia de Sdk:
Archivos modificados:
Contrato HTTP o de SDK comprobado:
Comprobaciones ejecutadas y resultado:
Secretos y configuración:
Riesgos y prueba humana pendiente:
```

### Resultado de Rev

```text
APPROVE
TASK: <id>
Iteración de QA: <n>
Ciclo técnico: <n>
Ronda técnica: <0|1|2>
Comprobaciones estáticas:
Prueba humana solicitada:
Riesgos residuales:
```

O bien:

```text
CHANGES_NEEDED
TASK: <id>
Iteración de QA: <n>
Ciclo técnico: <n>
Ronda técnica: <0|1>
- [CRITICO|ALTO|MEDIO] <archivo>: <problema concreto>
  Motivo:
  Cambio solicitado:
```

### Bloqueo o decisión

```text
QUESTION
TASK: <id>
Decisión necesaria:
Evidencia:
Opciones:
- A:
- B:
Recomendación:
Impacto:
```

```text
BLOCKED
TASK: <id>
Motivo:
Información o acceso necesario:
Impacto:
```

## Gates humanos

La persona responsable responde solo a `Orc`:

```text
APROBADO PC-XX
DECISIÓN PC-XX: <decisión>
QA OK PC-XX
QA FAIL PC-XX: <resultado observado>
BLOQUEADO PC-XX: <motivo>
```

`QA OK` solo se emite después de ejecutar el comando de PowerShell documentado para el slice. `Doc` recibe trabajo únicamente después de ese resultado.
