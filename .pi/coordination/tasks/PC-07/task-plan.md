# Plan de tarea: PC-07

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: solicitó README en inglés y publicación de la nota de investigación
- Creado: 2026-09-02T00:10:04Z
- Última actualización: 2026-09-02T16:59:11Z
- Aprobación vigente: `APROBADO PC-07` (2026-09-02T16:37:47Z); documentation completed and approved for publication

## Objetivo

Publicar un `README.md` íntegramente en inglés, sin cambiar los comportamientos HEART ya validados, y versionar la nota de investigación en inglés sobre viabilidad de voz/audio bidireccional.

## Alcance

### Incluido

- Traducir al inglés el contenido existente y confirmado de `README.md`, preservando los comandos, rutas, contrato y límites ya documentados.
- Publicar sin cambios sustantivos `.pi/coordination/research/realtime-audio-feasibility.md`, que ya está redactada en inglés como investigación no autorizada para implementación.
- Comprobaciones estáticas y commit/push no forzado.

### Fuera de alcance

- Código de producto, scripts, API, SDK, modelo, sesiones, dependencias, autenticación, secretos, interfaz de voz/audio o cambios de comportamiento.
- Documentar hipótesis como funcionalidades existentes.

## Evidencia de Sdk

- No aplica: tarea de traducción/publicación; no cambia el uso de Pi SDK, autenticación, modelo, sesiones ni persistencia.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-09-02 | README debe quedar en inglés; publicar también la nota de investigación. | Documentación solamente; sin cambio funcional. |

## Contrato técnico

- No aplica. El contrato HEART existente se conserva literalmente en significado; no se modifican rutas, entradas, salidas, errores ni sesiones.
- Secretos/configuración: no añadir ni exponer.

## Implementación autorizada

- Archivos permitidos: `README.md`, `.pi/coordination/research/realtime-audio-feasibility.md`, `.pi/coordination/tasks/PC-07/{task-plan.md,ledger.md}`, `.git/` por Git.
- Dependencias autorizadas: ninguna.
- Archivos o rutas expresamente protegidos: todo archivo de producto, `package*.json`, `.gitignore`, `AGENTS.md`, `.vscode/`, `.pi/` fuera de PC-07 y la nota de investigación indicada.
- Cambios explícitamente no permitidos: modificar comportamiento, añadir capacidades de voz/realtime, claves, tokens, URLs de credenciales o afirmaciones no verificadas.

## Criterios de finalización

- README íntegramente en inglés y limitado a comportamientos HEART confirmados por QA de PC-06.
- La nota de investigación queda publicada tal como investigación, sin presentarse como plan aprobado ni producto existente.
- `git diff --check` pasa; commit/push no forzado publicado.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente del ciclo: Doc completed the English README checks; Orc publishes README, the research note, and PC-07 coordination records.
- Riesgos a comprobar: traducción que cambie semántica técnica, inclusión de secretos, o confusión entre investigación y funcionalidad.
- Comandos de comprobación estática: `git diff --check`, revisión del diff, `git status --short` y comprobación Git.

## QA humana desde PowerShell

- No aplica: no cambia producto ni comandos.
- Estado: no requerida.

## Documentación

- Archivos autorizados: `README.md` y `.pi/coordination/research/realtime-audio-feasibility.md`.
- Contenido que solo podrá documentarse después de `QA OK`: El README conserva únicamente el flujo HEART ya validado por `QA OK PC-06`.
