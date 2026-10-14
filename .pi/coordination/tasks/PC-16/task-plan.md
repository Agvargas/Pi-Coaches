# Plan de tarea: PC-16

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: persona responsable de Pi-Coach
- Creado: 2026-10-12T17:02:54Z
- Última actualización: 2026-10-14T01:01:10Z
- Aprobación vigente: autorización inicial PC-16 y `DECISIÓN PC-16: AUTORIZAR SDK 1.0.1`; probar pin exacto, audit/tests/arranque/API local, detener ante incompatibilidad. No push ni cambios preventivos de auth/modelo.

## Objetivo

Subsanar los avisos actuales de `npm audit` con la remediación más pequeña y segura compatible con la aplicación, preservando contratos SDK/HTTP y preparando QA humana PowerShell. No afirmar QA OK antes de prueba humana.

## Alcance

### Incluido

- Análisis Sdk del árbol de dependencias, advisories, fixes disponibles y compatibilidad de SDK; comparar solución mínima frente a salto mayor 0.84.4→1.1.0.
- Cambios estrictamente necesarios en manifiesto/lockfile y, solo si son indispensables y autorizados tras análisis, adaptación del producto/test dentro del contrato actual.
- Verificar `npm audit`, `npm run check`, `node --test`, arranque y contratos HTTP sin proveedor ni secretos en salida; si la verificación de arranque requiere proveedor, limitarse a `/health` y rutas de error sin conversación real, y declararlo.
- Revisión Rev de árbol y cambios; instrucción PowerShell concreta para QA humana.

### Fuera de alcance

- PC-15 y su carpeta sin seguimiento, investigación no relacionada, `.gitignore` modificado, `.codex_tmp/`, autenticación/modelos, proveedor real, nuevas funciones, UI, pushes/publicación/remoto.
- No `npm audit fix` indiscriminado ni cambiar el major SDK sin decisión humana ante impacto sustantivo; no sobrescribir artefactos locales preexistentes. No confundir 3 paquetes afectados con 3 advisories independientes.

## Evidencia de Sdk

- API o clase del SDK confirmada: para 0.84.4 instalado, createAgentSession, DefaultResourceLoader, ModelRuntime, SessionManager, SettingsManager y session.subscribe/prompt/getLastAssistantText/abort/dispose en factory/service; metadata no certifica firmas/comportamiento de 0.86.0. Cod contrasta exports/types/docs instalados sin provider.
- Autenticación y modelo: preservar mecanismo y modelo Terra actual; no inspeccionar/mostrar credenciales ni cambiar defaults.
- Semántica de sesión: preservar sesión SDK inMemory por práctica y errores HTTP vigentes.
- Riesgos y límites: SDK 1.0.1 autorizado deja brace 5.0.12/undici 8.10.2, pero npm resuelve codemode 1.2.0 por ^1.0.1 y rompe imports SDK; Sdk verificó tarballs: codemode 1.0.1–1.1.0 conservan exports, 1.2.0 no. Probar pin solo lock codemode 1.0.1 dentro del rango, npm ci/import/tests/audit. Futuro npm install puede re-resolver incompatible; sin override ni cambio auth/modelo.
- No aplica porque: Sdk obligatorio: se modifica dependencia SDK/transitivas.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-10-12 | Autoriza iniciar y ejecutar PC-16; pide consulta solo ante decisión sustantiva nueva. | Sdk → Orc → Cod → Rev → QA humana; sin push ni retomar PC-15. |
| 2026-10-12 | Evidencia inicial: SDK 0.84.4, undici 8.9.0, brace-expansion 5.0.9; audit 3 paquetes (1 moderado/2 altos); dry-run propone SDK 1.1.0 para undici. | Verificar, no asumir que major upgrade es compatible o inevitable. |
| 2026-10-12 | `DECISIÓN PC-16: AUTORIZAR SDK 1.0.1`. | Autoriza probar pin exacto major, audit/tests/arranque/API local; stop ante incompatibilidad. Sin push ni cambios preventivos de auth/modelo. |

## Contrato técnico

- Método y ruta: mantener rutas/métodos actuales sin ampliación.
- Entrada JSON: sin cambios.
- Salida JSON: sin cambios.
- Errores esperados: preservar status y esquema actuales, incluida ruta de arranque/health; tests deben comprobarlo.
- Semántica de sesión: sin cambios, evitar proveedor real en pruebas automáticas no autorizadas.
- Secretos/configuración: no leer, imprimir, modificar ni incorporar secretos, auth, modelos o variables sensibles.

## Implementación autorizada

- Archivos permitidos: exclusivamente `package.json`, `package-lock.json` para esta entrega. Si hay incompatibilidad que requiera producto/tests, Cod detiene y pregunta a Orc antes de editarlos.
- Dependencias autorizadas: SDK exacto 1.0.1, y pin transitivo codemode 1.0.1 exclusivamente en lock dentro de SDK ^1.0.1, además de brace 5.0.12/undici 8.10.2. Manifest/raíz lock mantienen solo SDK como dependencia raíz; sin override, 1.1.0, fix --force ni actualización ajena. Tras fallo comprobado de lock-only npm, se autoriza edición manual única de `node_modules/@earendil-works/pi-codemode` exclusivamente version/resolved/integrity verificados del registry; no otras entradas ni patch de código. npm ci reproducible y tests/import necesarios; si npm revierte/no cumple, QUESTION. Inventariar diff completo.
- Archivos o rutas expresamente protegidos: `.gitignore`, `.pi/coordination/tasks/PC-15/`, demás untracked/preexistentes; archivos de auth y configuración local.
- Cambios explícitamente no permitidos: push, publicacion/remoto, cambio de autenticación/modelos, actualizaciones generales no relacionadas, borrar/stash/reset/clean de trabajo local.

## Criterios de finalización

- `npm audit` deja de reportar avisos actuales o se consulta a humano si remediación segura requiere una decisión nueva; conservar reporte reproducible sin datos sensibles.
- `npm run check` y `node --test` correctos; arranque y contratos HTTP verificados en entorno controlado, sin llamar modelo.
- Sdk documenta compatibilidad; Rev revisa diff/lockfile y ausencia de efectos ajenos; QA humana PowerShell pendiente hasta que persona pruebe.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `4`
- Ronda actual: `0`
- Contexto vigente del ciclo: APPROVE Rev ciclo4/ronda0 confirma manifests/lock 120 entradas/integrities, API usada estáticamente, diff limitado y pruebas Cod audit0/import/check/tests31/HTTP negativo sin proveedor. QA humana PowerShell pendiente, sin conversación SDK real validada.
- Riesgos a comprobar: SDK 1.0.1 declara codemode ^1.0.1 y 1.2.0 rompe exports; lock fija 1.0.1 y npm ci lo reproduce. Un `npm install` normal sin cambios debe respetar lock compatible según docs npm, pero updates, cambios de dependencia o regeneración pueden re-resolver 1.2.0. Antes de futuras actualizaciones, evaluar override acotado o SDK corregido con aprobación separada; repetir npm ls/import ESM/tests/audit. Asistente reportó pruebas reales breves autorizadas de 14 combinaciones y dos conversaciones extra, no evaluación cualitativa exhaustiva ni QA humana.
- Comandos de comprobación estática: `npm audit`, `npm run check`, `node --test`, `git diff --check`, arranque/HTTP sin proveedor y `git status --short` para preservar locales.

## QA humana desde PowerShell

- Comando: PowerShell en raíz del proyecto: `npm audit`; `npm ls @earendil-works/pi-coding-agent @earendil-works/pi-codemode undici brace-expansion --all`; `npm run check`; `node --test`; `node --input-type=module -e "import('@earendil-works/pi-coding-agent').then(() => console.log('sdk_import_ok'))"`. Smoke adicional: con puerto 3000 libre, iniciar child Node propio, GET `/health` y `/frameworks`, detener exclusivamente ese child.
- Resultado esperado: audit 0, SDK/codemode 1.0.1, undici 8.10.2, brace 5.0.12, check/tests/import OK; health/catalog 200.
- Resultado observado: verificaciones PowerShell previas del asistente (audit 0, árbol esperado, check, tests 31/31, import ESM y diff --check); smoke HTTP propio health/catalog 200 y negativos 405/400. Con autorización humana reportada, asistente recorrió 14 combinaciones GROW/HEART y dos conversaciones extra de dos turnos con create/message/end/feedback esperado. No se publicaron transcripciones ni credenciales. Esas verificaciones no fueron QA humana ni evaluación cualitativa exhaustiva. La persona responsable confirmó expresamente `QA OK PC-16` el 2026-10-13 tras recibir resultados PowerShell y conversaciones reales; se registra esa aceptación humana, no se atribuye al asistente.
- Estado: QA humana OK; tarea cerrada. README documental publicado por la persona en `origin/master` (commit `6cad6b1a265fab877d52cc559c49b87e75875ae3`); los registros de cierre se preparan para commit exclusivo PC-16. El estado `DONE` no depende del hash de ese commit de coordinación.

## Documentación

- Autorización humana posterior al QA OK: documentar lo pendiente y útil de PC-16 mediante Doc; fase documental acotada, no se reabre implementación ni QA.
- Archivo autorizado para Doc: `README.md` exclusivamente, breve nota junto a `npm ci` bajo instalación; sin modificar código, package.json, lock, .gitignore, PC-15, auth/modelos ni otros docs.
- Contenido confirmado: SDK root 1.0.1 y codemode transitivo 1.0.1 fijado por lock; SDK declara ^1.0.1 y codemode 1.2.0 rompe imports. `npm ci` fue reproducible. Un `npm install` normal sin cambios debe respetar lock compatible; updates/cambios/regeneración pueden re-resolver incompatible. Recomendar npm ci y comprobaciones npm ls/import ESM/tests/audit después de modificar dependencias; evaluar SDK corregido u override acotado solo en futura tarea aprobada, no indicar aplicarlo ahora. QA humana PC-16 OK, pruebas conversacionales breves no certifican calidad general.
- Resultado documental: Doc entregó DONE; Orc confirmó diff limitado a 10 líneas en `README.md` bajo instalación, contenido preciso sin secretos y `git diff --check -- README.md` OK. Persona publicó README en `origin/master` mediante `6cad6b1a265fab877d52cc559c49b87e75875ae3`, con coincidencia remota reportada y HEAD local verificado. QA OK del producto permanece separada; no se ejecutó QA adicional por la nota.
