# Plan de tarea: PC-13

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: usuario responsable de Pi-Coach
- Creado: 2026-09-16T15:32:41Z
- Última actualización: 2026-09-16T15:45:14Z
- Aprobación vigente: `APROBADO PC-13` (2026-09-16T15:33:55Z), aprobación humana del README (2026-09-16T15:39:27Z) y Rev `APPROVE` ronda 1 (`ee9ef65`)

## Objetivo

Actualizar `README.md` para documentar el catálogo validado HEART/GROW y una guía precisa, no ejecutable, para añadir un nuevo paquete de framework compatible con el sistema actual.

## Alcance

### Incluido

- Reemplazar la descripción centrada solo en HEART por la descripción confirmada de motor local con catálogo de frameworks.
- Documentar GROW: sus cuatro escenarios públicos, inicio `user-opens-with-context`, selección de ambos modos de feedback y protección de contexto privado.
- Corregir administración de contenido para explicar HEART y GROW bajo `training-content/frameworks/`.
- Añadir guía para un framework nuevo basada en el loader y paquetes actuales: árbol de archivos, manifest/schema cerrado, IDs/rutas permitidas, prompts/datos requeridos, escenarios/contextos públicos/privados, modos de inicio y feedback, validación al arranque, reinicio y límites de compatibilidad.
- Declarar expresamente que añadir contenido no autoriza código ejecutable, modelo/proveedor/thinking/herramientas, recarga HTTP, edición por API, contenido privado en catálogo ni cambios de API/motor.
- Incluir pasos de verificación locales/documentales solo si ya están confirmados; no documentar hipótesis, métricas PC-12 ni optimizaciones de caché.

### Fuera de alcance

- Código de producto, tests, scripts, contenido de entrenamiento, API, SDK, modelo, dependencias, manifiestos, nuevas capacidades, cambios de contrato o implementación de un framework adicional.
- Traducir todo el README, publicar secretos o garantizar que cualquier paquete no validado funcionará.

## Evidencia de Sdk

- No aplica: cambio documental basado exclusivamente en comportamiento PC-10 ya validado por QA humana.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-09-16 | Solicita completar README con GROW y estructura segura para futuros frameworks. | Crear tarea documental acotada; no cambiar producto. |

## Contrato técnico

- Método y ruta: no aplica; no hay cambios HTTP.
- Secretos/configuración: nunca documentar o exponer credenciales, rutas locales privadas, prompts privados, contextos privados, modelo, thinking o herramientas configurables.

## Implementación autorizada

- Archivos permitidos: `README.md`, `.git/` para commit/push no forzado; `.pi/coordination/tasks/PC-13/` solo Orc.
- Dependencias autorizadas: ninguna.
- Archivos protegidos: todo archivo de producto, `package*.json`, `.gitignore`, `AGENTS.md`, `.vscode/`, contenido de entrenamiento y coordinación ajena a PC-13.
- Cambios no permitidos: producto/API, ejemplos que llamen proveedor, nuevas instrucciones operativas no validadas, afirmaciones de QA no ocurrida.

## Criterios de finalización

- README identifica HEART y GROW correctamente y enumera sus comportamientos públicos confirmados.
- Guía de nuevo framework refleja el schema/loader real y no permite incompatibilidades conocidas ni configuraciones fuera de alcance.
- Revisión estática confirma que solo cambió README y que no expone contenido privado/secreto ni contradice API/PC-10.
- Cambios publicados tras confirmación Doc y revisión autorizada.

## Revisión técnica

- Iteración QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente: documentación posterior a `QA OK PC-10`; ninguna modificación de producto autorizada.
- Riesgos a comprobar: datos privados, afirmaciones no confirmadas, schema/rutas inexactos, guía que implique soporte de plugins/modelos/hot reload.
- Comandos de comprobación estática: `git diff --check`, inspección de diff y `git status --short`.

## QA humana desde PowerShell

- No aplica: documentación de comportamiento ya validado en PC-10; no se modifica producto.

## Documentación

- Archivo autorizado: `README.md`.
- Contenido que solo puede documentarse: comportamiento público confirmado por `QA OK PC-10` y schema actual leído de código/contenido.
