# Pi-Coach

Servidor local de conversaciones de Coach mediante la API de Pi. La interfaz validada actualmente es un chat interactivo de PowerShell.

## Requisitos

- Node.js 24 (comprobado).
- Una autenticación local válida de Pi; el SDK la utiliza para conectarse al proveedor.
- Acceso de red al proveedor. La cuenta local de Pi es solo para pruebas y cada mensaje puede consumir cuota.

## Instalación y arranque

En la carpeta del proyecto:

```powershell
npm ci
npm start
```

Mantén el servidor iniciado en esa consola. En otra consola, ejecuta el chat:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\chat.ps1
```

El chat crea una sesión y permite enviar mensajes. Escribe `/ayuda` para ver la ayuda y `/salir` para terminar.

## API validada

El servidor escucha únicamente en loopback.

- `GET /health` — devuelve `200` cuando el servidor está disponible.
- `POST /v1/sessions` — crea una sesión y devuelve `201` con un `sessionId` opaco.
- `POST /v1/sessions/:sessionId/messages` — recibe un mensaje y devuelve `200` con un `reply`.

Los errores confirmados son `400` para entradas inválidas, `404` para una sesión o ruta inexistente, `409` para un conflicto de sesión y `502` cuando falla el proveedor.

## Límites actuales

- Las sesiones se mantienen solo en memoria y se pierden al reiniciar el servidor.
- No hay interfaz web, persistencia ni autenticación pública.
- El funcionamiento depende de la red, del proveedor de Pi y de la cuota disponible.
- Esta configuración está destinada a pruebas locales, no a producción.
