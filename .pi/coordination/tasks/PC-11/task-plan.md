# Plan de tarea: PC-11

> Solo `Orc` actualiza este archivo.

## Estado

- Estado actual: `DONE`
- Persona responsable: usuario responsable de Pi-Coach
- Creado: 2026-09-15T18:32:37Z
- Última actualización: 2026-09-15T20:48:00Z
- Aprobación vigente: `APROBADO PC-11` (2026-09-15T18:34:54Z); investigación Sdk consolidada sin implementación

## Objetivo

Investigar el significado del indicador CH de la terminal Pi y la viabilidad de aprovechar prompt caching para reducir coste y latencia de VALIDATE en Pi-Coach, con evidencia verificable y sin implementar cambios.

## Alcance

### Incluido

- Sdk investiga documentación oficial y código instalado; distinguir versión global de Pi y SDK usado por Pi-Coach.
- Identificar el componente que muestra CH, su fórmula, periodo de agregación y significado de 0.0%; no asumir que es un indicador estándar del SDK.
- Distinguir caché de prefijos de entrada, reutilización de respuestas y métricas estimadas de coste.
- Verificar soporte del proveedor/adaptador actual sin abrir credenciales: activación automática o configurable, prefijos estables, mínimos, retención, claves de caché y métricas disponibles.
- Revisar Character/Evaluator, historial repetido y orden secuencial de PC-10 para identificar oportunidades sin perder contexto ni privacidad.
- Diferenciar ahorro de tokens facturados, cómputo de entrada, tiempo de generación y cuota de suscripción; no equipararlos sin evidencia.
- Proponer experimento posterior: mismo conjunto de casos, caché fría/caliente, repeticiones, latencia por etapa, tokens cacheados, calidad y presupuesto pendiente de aprobación.

### Fuera de alcance

- Implementación, cambio de modelo/proveedor, instalación, cambios de configuración, lectura de auth.json o secretos, llamadas reales al modelo, pruebas pagadas, persistencia, cambios HTTP o publicación Git.
- Prometer un porcentaje de ahorro o aceleración sin mediciones.

## Evidencia de Sdk

- Pendiente: fuentes exactas, versión, rutas y conclusiones; límites de documentación externa si no es accesible.

## Decisiones confirmadas

| Fecha | Decisión de la persona responsable | Impacto |
| --- | --- | --- |
| 2026-09-15 | Solicita investigación sobre cache hit/CH0.0% y viabilidad en Pi-Coach. | Preparar alcance de investigación, sin implementación. |

## Contrato técnico

- Sin cambios HTTP, sesiones o configuración.
- No leer, copiar ni publicar secretos o razonamiento privado.

## Implementación autorizada

- Ninguna. Sdk solo lectura; Orc registra informe bajo `.pi/coordination/`.
- Sin dependencias nuevas ni ejecución de proveedor.

## Criterios de finalización

- Explicar CH con evidencia o declarar explícitamente que su origen no pudo confirmarse.
- Determinar si Pi-Coach ya solicita/recibe caché, si el soporte está disponible pero no medido, o si requiere cambios.
- Informe de viabilidad, riesgos, límites y siguiente experimento propuesto, sin prometer beneficios no observados.

## Revisión técnica

- Iteración de QA: 0
- Ciclo técnico: 1
- Ronda: 0
- Análisis Sdk obligatorio; no despacho Cod.

## QA humana desde PowerShell

- No aplica a investigación documental. Experimentos reales requieren presupuesto y autorización posteriores.

## Documentación

- Informe local: `.pi/coordination/research/evaluator-prompt-cache-viability.md`.
- Sin README de producto ni publicación autorizada.
