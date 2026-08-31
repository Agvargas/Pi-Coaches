# Ledger de tarea: PC-01

> Solo `Orc` actualiza este archivo. Registra eventos cuando ocurren.

## Bindings

| Rol | Terminal | Cwd | Estado inicial |
| --- | --- | --- | --- |
| Orc | Orc | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | activo |
| Sdk | Sdk | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | idle |
| Cod | Cod | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | idle |
| Rev | Rev | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | idle |
| Doc | Doc | `C:\Users\andgu\OneDrive\Documents\Pi-Coach` | idle |

Terminales comprobadas mediante `link_list` el 2026-08-31T18:05:12Z y de nuevo el 2026-08-31T18:07:40Z antes de cada despacho: Orc, Sdk, Cod, Rev y Doc en `C:\Users\andgu\OneDrive\Documents\Pi-Coach`; Cod estaba `idle`.

## Transiciones

| Fecha/hora | Estado | Emisor o receptor | Evento/callback | Siguiente paso |
| --- | --- | --- | --- | --- |
| 2026-08-31T17:58:57Z | DRAFT | Orc | Plan y ledger creados para vincular y publicar el repositorio local en GitLab. | Esperar `APROBADO PC-01`. |
| 2026-08-31T18:05:12Z | APPROVED | Persona responsable | `APROBADO PC-01` recibido. | Pasar a implementación; Sdk no aplica (tarea de Git). |
| 2026-08-31T18:05:12Z | IMPLEMENTING | Orc → Cod | Despacho autorizado para operación Git acotada. | Esperar `REVIEW REQUEST` de Cod a Rev. |
| 2026-08-31T18:06:40Z | BLOCKED | Cod → Orc | `git ls-remote --symref origin HEAD` agotó el tiempo de espera al conectar a `private-git.example.invalid:22`. | Esperar acceso SSH/red operativo o una decisión humana que autorice un transporte alternativo. |
| 2026-08-31T18:07:40Z | IMPLEMENTING | Persona responsable → Orc → Cod | `DECISIÓN PC-01: usar HTTPS`; reanudación con URL HTTPS autorizada. | Esperar `REVIEW REQUEST` de Cod a Rev o bloqueo. |

## Decisiones

| Fecha/hora | Estado | Pregunta y evidencia | Decisión humana | Agente notificado |
| --- | --- | --- | --- | --- |
| 2026-08-31T17:58:57Z | DRAFT | El directorio local no es repositorio Git; la persona responsable indica que el remoto solo contiene un `README`. | Conservar el `README` remoto y publicar el estado local sin forzar. | Ninguno; no hay despacho. |
| 2026-08-31T17:58:57Z | DRAFT | La persona responsable especifica exclusiones: todo `.pi/` salvo `.pi/coordination/`, además de `.vscode/` y `AGENTS.md`. | El `.gitignore` raíz usará `.pi/*`, `!.pi/coordination/`, `!.pi/coordination/**`, `.vscode/` y `AGENTS.md`; aprobado mediante `APROBADO PC-01`. | Cod tras despacho. |
| 2026-08-31T18:07:40Z | BLOCKED | Timeout de SSH al puerto 22. | Usar `https://example.invalid/private-project.git` como transporte remoto; no registrar credenciales. | Cod reanudado. |

## Ciclos técnicos

| Iteración QA | Ciclo | Fuente y aclaración sustantiva | Contexto actualizado | Acción |
| --- | --- | --- | --- | --- |
| 0 | 1 | La persona responsable autorizó HTTPS tras el timeout SSH. | IMPLEMENTING; `.git/` inicializado y `origin` debe cambiarse a HTTPS antes de reintentar inspección. | Cod reanudado; entrega a Rev o bloqueo. |

## Rondas de revisión

| Iteración QA | Ciclo | Ronda | Entrega de Cod | Hallazgo de Rev | Acción |
| --- | --- | --- | --- | --- | --- |
| 0 | 1 | 0 | pendiente | pendiente | Sin acción hasta aprobación y entrega. |

## QA humana

| Fecha/hora | Comando PowerShell | Resultado observado | Acción |
| --- | --- | --- | --- |
| | `git -C 'C:\Users\andgu\OneDrive\Documents\Pi-Coach' status --short --branch; git -C 'C:\Users\andgu\OneDrive\Documents\Pi-Coach' log --oneline --decorate -n 3` | pendiente | Ejecutar solo tras revisión técnica. |

## Cierre

- Documentación enviada a Doc: No aplica; no autorizada.
- Confirmación de documentación: No aplica.
- Estado final: pendiente.
- Riesgos residuales: Acceso SSH por puerto 22 no disponible; contenido real del remoto y rama predeterminada no comprobados. No se creó `.gitignore`, commit ni push.
