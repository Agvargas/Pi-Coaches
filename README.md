# Pi-Coach

Servidor local de práctica HEART. Se ejecuta en `127.0.0.1:3000` y se usa desde un chat interactivo de PowerShell. El servidor crea dos sesiones internas aisladas por práctica: Guest (nivel `low`) y Evaluator (nivel `medium`).

## Requisitos e instalación

- Node.js 24 (comprobado).
- Autenticación local de Pi configurada para el SDK.
- Acceso de red al proveedor; cada llamada al modelo puede consumir cuota.

En la carpeta del proyecto:

```powershell
npm ci
npm start
```

Deja el servidor ejecutándose en esa consola. En otra, inicia el chat:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\chat.ps1
```

El script presenta estas situaciones: `air-conditioning`, `sofa-bed` y `missed-breakfast`. Guest inicia la práctica. Escribe `/help` para mostrar la ayuda o `/end` para finalizar y ver el feedback HEART.

## Flujo de práctica

El Evaluator valida el contexto mientras conversas. Solo bloquea mensajes claramente fuera de contexto (por ejemplo, pizza o fútbol); respuestas relevantes, incluso si son deficientes, se aceptan y se evalúan al finalizar. Para `missed-breakfast`, no se deben prometer free nights, giveaways, comida cooked-to-order o entregada en la habitación, descuentos superiores al 50% ni un room upgrade.

## API validada

Todas las rutas son locales y no requieren autenticación pública. Las entradas JSON deben coincidir exactamente con las indicadas.

- `GET /health` → `200` con `{ "status": "ok" }`.
- `POST /trainings` con `{ "scenarioId": "air-conditioning" }` (o `sofa-bed`/`missed-breakfast`) → `201` con `trainingId` y `openingMessage`.
- `POST /trainings/:trainingId/messages` con `{ "message": "..." }` → respuesta `accepted` con una respuesta del Guest, o `blocked` con el mensaje fijo de bloqueo.
- `POST /trainings/:trainingId/end` con `{}` → `200` con feedback HEART; la práctica finaliza y se elimina.

Errores públicos: `400` (entrada inválida), `404` (ruta o práctica inexistente), `409` (conflicto), `413` (mensaje demasiado grande), `429` (máximo de prácticas activas), `502` (fallo del proveedor), `503` (servidor no disponible) y `504` (tiempo agotado).

## Límites y privacidad

- Máximo 3 prácticas activas.
- Máximo 20 mensajes del Team Member por práctica.
- Cada mensaje admite hasta 4.000 caracteres.
- Cada llamada al modelo tiene un límite de 90 segundos.
- Las prácticas viven solo en memoria: se eliminan al finalizar y se pierden al reiniciar el servidor.
- No hay tools, persistencia, interfaz web ni autenticación pública. El modelo interno está fijado a `openai-codex/gpt-5.6-terra`.

Esta documentación refleja pruebas reales desde PowerShell. El uso depende de la red, del proveedor y de la cuota disponible; no es una configuración de producción.
