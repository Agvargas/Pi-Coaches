# Plan de tarea: PC-01

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: aprobó y validó QA de `PC-01`
- Creado: 2026-08-31T17:58:57Z
- Última actualización: 2026-08-31T18:11:59Z
- Aprobación vigente: `APROBADO PC-01` (2026-08-31T18:05:12Z); HTTPS autorizado el 2026-08-31T18:07:40Z; `QA OK PC-01` (2026-08-31T18:11:59Z)

## Objetivo

Publicar en el remoto GitLab proporcionado el estado actual del directorio local `C:\Users\andgu\OneDrive\Documents\Pi-Coach`, conservando el `README` ya existente en el remoto y evitando subir archivos exclusivamente locales.

## Alcance

### Incluido

- Configurar `origin` con `https://example.invalid/private-project.git` como transporte autorizado.
- Consultar y recuperar de forma no destructiva la referencia remota para conservar su `README`.
- Crear o actualizar el `.gitignore` de la raíz con exclusiones justificadas para artefactos locales.
- Preparar un commit con los archivos permitidos del estado local y fusionarlo con la historia remota si el remoto contiene únicamente el `README` indicado.
- Enviar el resultado a la rama predeterminada remota, una vez que Git y SSH permitan la operación.
- Informar hashes, rama y estado final sin incluir credenciales.

### Fuera de alcance

- Modificar código del producto o comportamiento del servidor.
- Instalar dependencias o modificar autenticación de Pi.
- Forzar actualizaciones remotas, borrar ramas, reescribir historia o sobrescribir el `README` remoto.
- Mostrar, registrar o modificar claves SSH, tokens, `auth.json` o variables de entorno sensibles.
- Incluir cambios no presentes en el directorio local ni resolver conflictos de contenido no previstos sin decisión humana.

## Evidencia de Sdk

- API o clase del SDK confirmada: No aplica; tarea de control de versiones.
- Autenticación y modelo: No aplica; no se modifica la autenticación de Pi.
- Semántica de sesión: No aplica.
- Riesgos y límites: La autenticación SSH y el contenido remoto se comprobarán sin revelar secretos.
- No aplica porque: No toca SDK, modelos, sesiones ni persistencia de Pi.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-08-31 | El remoto indicado está, según la persona responsable, inicializado solo con un `README`; ese `README` se conservará para el proyecto. | No se hará push forzado ni se reemplazará la historia remota. |
| 2026-08-31 | Excluir todas las rutas dentro de `.pi/`, excepto `.pi/coordination/`; excluir también `.vscode/` y `AGENTS.md`. | El `.gitignore` raíz incluirá reglas de exclusión con excepciones explícitas para versionar `.pi/coordination/` y su contenido; no se subirán `.vscode/` ni `AGENTS.md`. |
| 2026-08-31 | Usar HTTPS como transporte remoto tras el timeout de SSH. | `origin` se cambiará a `https://example.invalid/private-project.git`; no se incluirán credenciales en la URL ni en registros. |

## Contrato técnico

- Método y ruta: No aplica; tarea de Git local/remoto.
- Entrada JSON: No aplica.
- Salida JSON: Repositorio local vinculado, `.gitignore` versionado, `README` remoto conservado y commit enviado; o bloqueo documentado.
- Errores esperados: SSH no autenticado, remoto inaccesible, rama predeterminada inesperada, contenido remoto adicional o conflicto de fusión; se detendrá antes de una acción destructiva.
- Semántica de sesión: No aplica.
- Secretos/configuración: La URL HTTPS autorizada no contiene secreto; no se mostrarán ni modificarán credenciales, tokens ni configuraciones de autenticación de Pi.

## Implementación autorizada

- Archivos permitidos: `.gitignore` en la raíz (nuevo o actualizado) y metadatos locales `.git/` creados por Git; los demás archivos existentes solo pueden añadirse al commit, no editarse. El `.gitignore` excluirá `.pi/*`, re-incluirá `.pi/coordination/` y su contenido, y excluirá `.vscode/` y `AGENTS.md`.
- Dependencias autorizadas: Ninguna.
- Archivos o rutas expresamente protegidos: Claves SSH, tokens, `auth.json`, variables de entorno sensibles y configuración de autenticación de Pi.
- Cambios explícitamente no permitidos: `git push --force`, borrado de ramas, rebase o reset destructivo, modificación del `README` remoto, cambios de producto y resolución silenciosa de conflictos.

## Criterios de finalización

- Git local queda inicializado y `origin` apunta al remoto indicado.
- El `README` remoto se conserva y forma parte de la historia local resultante.
- El `.gitignore` raíz excluye `.pi/*`, re-incluye `.pi/coordination/` y su contenido, y excluye `.vscode/` y `AGENTS.md`.
- Los archivos locales permitidos se confirman y se envían sin operación forzada.
- Se informa rama, hash del commit y resultado de `git status --short --branch` y comprobación del remoto, sin secretos.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente del ciclo: Rev aprobó la integración HTTPS: `master` y `origin/master` coinciden en `e2dad6b798ed039e67fdb8add2159206c12de9c6`; pendiente de QA humana.
- Riesgos a comprobar: acceso de red/SSH al puerto 22 no disponible; historia remota no relacionada; remoto con más contenido que el `README`; una regla de negación de `.gitignore` que no re-incluya correctamente `.pi/coordination/`.
- Comandos de comprobación estática: `git status --short --branch`, `git remote -v`, `git log --oneline --decorate -n 5`, `git ls-remote --heads origin` y revisión de reglas `.gitignore`; no se imprimirán datos sensibles.

## QA humana desde PowerShell

- Comando: `git -C 'C:\Users\andgu\OneDrive\Documents\Pi-Coach' status --short --branch; git -C 'C:\Users\andgu\OneDrive\Documents\Pi-Coach' log --oneline --decorate -n 3`
- Resultado esperado: Rama vinculada a `origin`, árbol de trabajo limpio tras el commit y el historial contiene el `README` remoto y el commit local.
- Resultado observado: `QA OK PC-01` comunicado por la persona responsable.
- Estado: aprobada

## Documentación

- Archivos autorizados: No aplica.
- Contenido que solo podrá documentarse después de `QA OK`: No aplica; no se despachó a Doc porque no había documentación autorizada.
