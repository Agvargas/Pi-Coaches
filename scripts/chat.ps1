$ErrorActionPreference = "Stop"
$apiBaseUri = "http://127.0.0.1:3000"

function Write-ApiError([System.Exception] $Exception) {
    $statusCode = 0
    if ($null -ne $Exception.Response) {
        try {
            $statusCode = [int]$Exception.Response.StatusCode
        } catch {
            $statusCode = 0
        }
    }

    switch ($statusCode) {
        400 { Write-Host "La solicitud no es valida." }
        404 { Write-Host "La sesion ya no esta disponible." }
        409 { Write-Host "El Coach esta ocupado. Espera e intentalo de nuevo." }
        502 { Write-Host "El Coach no esta disponible ahora. Intentalo de nuevo." }
        503 { Write-Host "El servidor no esta disponible ahora." }
        default { Write-Host "No se pudo contactar al servidor local. Inicialo con npm start en otra consola." }
    }
}

try {
    $health = Invoke-RestMethod -Method Get -Uri "$apiBaseUri/health"
    if ($health.status -ne "ok") {
        throw "health_check_failed"
    }

    $createdSession = Invoke-RestMethod -Method Post -Uri "$apiBaseUri/v1/sessions" -ContentType "application/json" -Body "{}"
    $sessionId = [string]$createdSession.sessionId
    if ([string]::IsNullOrWhiteSpace($sessionId)) {
        throw "session_creation_failed"
    }
} catch {
    Write-ApiError $_.Exception
    return
}

Write-Host "Chat Coach listo. Escribe /ayuda para ver los comandos."

while ($true) {
    $message = Read-Host "Tu"
    $command = $message.Trim()

    if ($command -eq "/salir") {
        Write-Host "Hasta luego."
        break
    }

    if ($command -eq "/ayuda") {
        Write-Host "Comandos locales: /ayuda, /salir"
        Write-Host "Escribe un mensaje de 1 a 4.000 caracteres para hablar con el Coach."
        continue
    }

    if ([string]::IsNullOrWhiteSpace($message)) {
        Write-Host "Escribe un mensaje no vacio."
        continue
    }

    if ($message.Length -gt 4000) {
        Write-Host "El mensaje no puede superar 4.000 caracteres."
        continue
    }

    try {
        $body = @{ message = $message } | ConvertTo-Json -Compress
        $messageUri = "$apiBaseUri/v1/sessions/$([uri]::EscapeDataString($sessionId))/messages"
        $result = Invoke-RestMethod -Method Post -Uri $messageUri -ContentType "application/json" -Body $body
        $reply = [string]$result.reply
        if ([string]::IsNullOrEmpty($reply)) {
            throw "empty_reply"
        }
        Write-Host ("Coach: " + $reply)
    } catch {
        Write-ApiError $_.Exception
    }
}
