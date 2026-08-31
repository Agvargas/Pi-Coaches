# Plan de tarea: PC-00

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DRAFT`
- Persona responsable: pendiente de identificación
- Creado: 2026-08-31T17:47:03Z
- Última actualización: 2026-08-31T17:47:03Z
- Aprobación vigente: pendiente

## Objetivo

Confirmar requisitos mínimos verificables antes de implementar el servidor Node.js local de Pi-Coach: versiones de Node.js y npm, disponibilidad de un modelo de Pi autenticado sin revelar secretos, APIs mínimas del SDK para una conversación real y una propuesta de comprobación posterior desde PowerShell.

## Alcance

### Incluido

- Comprobar versiones de Node.js y npm.
- Confirmar que Pi dispone de un modelo autenticado, sin mostrar ni registrar secretos.
- Investigar el paquete y las APIs mínimas del SDK de Pi para una conversación real.
- Proponer un comando de comprobación posterior desde PowerShell.

### Fuera de alcance

- Crear código del servidor.
- Instalar dependencias.
- Modificar configuración de autenticación.
- Despachar trabajo antes de la aprobación humana.

## Evidencia de Sdk

- API o clase del SDK confirmada: pendiente; requerida tras aprobación.
- Autenticación y modelo: pendiente; verificar disponibilidad sin exponer secretos.
- Semántica de sesión: pendiente; requerida para la futura API.
- Riesgos y límites: pendiente.
- No aplica porque: no aplica; este slice investiga el SDK y exige análisis de Sdk tras aprobación.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-08-31 | No implementar servidor, instalar dependencias ni modificar autenticación en PC-00. | Investigación y comprobaciones no destructivas únicamente. |

## Contrato técnico

- Método y ruta: No aplica; no se crea API en PC-00.
- Entrada JSON: No aplica.
- Salida JSON: Informe de requisitos y propuesta de comando PowerShell.
- Errores esperados: Herramienta no disponible, versión no detectable o modelo autenticado no confirmable; se informarán sin secretos.
- Semántica de sesión: Se investigará, sin implementar.
- Secretos/configuración: No leer, mostrar, registrar ni modificar tokens, claves, `auth.json` ni variables de entorno sensibles.

## Implementación autorizada

- Archivos permitidos: Solo `.pi/coordination/tasks/PC-00/task-plan.md` y `.pi/coordination/tasks/PC-00/ledger.md` hasta aprobación; después, el análisis no autoriza cambios de producto.
- Dependencias autorizadas: Ninguna.
- Archivos o rutas expresamente protegidos: Código del producto, configuración de autenticación, secretos, `auth.json` y variables de entorno sensibles.
- Cambios explícitamente no permitidos: Servidor, dependencias, configuración de autenticación y despachos antes de `APROBADO PC-00`.

## Criterios de finalización

- La evidencia registra versiones de Node.js y npm.
- Sdk confirma o bloquea la disponibilidad de un modelo autenticado sin exponer secretos.
- Sdk identifica las APIs mínimas y límites del SDK para conversación real y sesión.
- Se presenta un comando de PowerShell propuesto para la comprobación posterior.
- La persona responsable recibe el resultado consolidado; no se declara QA humana ni implementación aprobada en este slice.

## Revisión técnica

- Iteración de QA actual: `0`
- Ciclo técnico actual: `1`
- Ronda actual: `0`
- Contexto vigente del ciclo: Plan DRAFT; no existe implementación que revisar.
- Riesgos a comprobar: exposición accidental de secretos; confundir disponibilidad local con autenticación válida; inferir APIs sin evidencia del SDK.
- Comandos de comprobación estática: Pendientes de propuesta de Sdk; no se ejecutarán comandos que revelen secretos.

## QA humana desde PowerShell

- Comando: Pendiente de propuesta de Sdk después de la aprobación; no se presupone una ruta HTTP sin servidor ni contrato autorizado.
- Resultado esperado: Pendiente.
- Resultado observado: Pendiente.
- Estado: pendiente

## Documentación

- Archivos autorizados: Ninguno.
- Contenido que solo podrá documentarse después de `QA OK`: No aplica; no hay documentación autorizada en PC-00.
