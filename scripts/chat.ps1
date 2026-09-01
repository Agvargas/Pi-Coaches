$ErrorActionPreference = "Stop"
$apiBaseUri = "http://127.0.0.1:3000"
$scenarios = @(
    @{ Id = "air-conditioning"; Label = "Air conditioning problem" },
    @{ Id = "sofa-bed"; Label = "Sofa bed problem" },
    @{ Id = "missed-breakfast"; Label = "Missed breakfast" }
)

function Write-ApiError([System.Exception] $Exception) {
    $statusCode = 0
    if ($null -ne $Exception.Response) {
        try { $statusCode = [int]$Exception.Response.StatusCode } catch { $statusCode = 0 }
    }
    switch ($statusCode) {
        400 { Write-Host "The request was not valid." }
        404 { Write-Host "This training is no longer available." }
        409 { Write-Host "This training is busy. Please wait and try again." }
        413 { Write-Host "The training message or limit is too large." }
        429 { Write-Host "Too many active trainings. Please try again later." }
        502 { Write-Host "The Coach is unavailable. Please try again." }
        503 { Write-Host "The server is unavailable. Start it with npm start in another console." }
        504 { Write-Host "The Coach timed out. Please try again." }
        default { Write-Host "Cannot contact the local server. Start it with npm start in another console." }
    }
}

try {
    $health = Invoke-RestMethod -Method Get -Uri "$apiBaseUri/health"
    if ($health.status -ne "ok") { throw "health_check_failed" }
} catch {
    Write-ApiError $_.Exception
    return
}

Write-Host "Select a guest situation:"
for ($index = 0; $index -lt $scenarios.Count; $index += 1) {
    Write-Host ("{0}. {1}" -f ($index + 1), $scenarios[$index].Label)
}

$selection = Read-Host "Choice (1-3)"
if ($selection -notmatch '^[1-3]$') {
    Write-Host "Please run the chat again and select 1, 2, or 3."
    return
}

try {
    $scenarioId = $scenarios[[int]$selection - 1].Id
    $training = Invoke-RestMethod -Method Post -Uri "$apiBaseUri/trainings" -ContentType "application/json" -Body (@{ scenarioId = $scenarioId } | ConvertTo-Json -Compress)
    $trainingId = [string]$training.trainingId
    $openingMessage = [string]$training.openingMessage
    if ([string]::IsNullOrWhiteSpace($trainingId) -or [string]::IsNullOrEmpty($openingMessage)) { throw "training_creation_failed" }
} catch {
    Write-ApiError $_.Exception
    return
}

Write-Host ("Guest: " + $openingMessage)
Write-Host "Commands: /help, /end"

while ($true) {
    $message = Read-Host "You"
    $command = $message.Trim()
    if ($command -eq "/help") {
        Write-Host "Commands: /help shows this help. /end finishes the training and shows HEART feedback."
        continue
    }

    if ($command -eq "/end") {
        try {
            $endUri = "$apiBaseUri/trainings/$([uri]::EscapeDataString($trainingId))/end"
            $result = Invoke-RestMethod -Method Post -Uri $endUri -ContentType "application/json" -Body "{}"
            $feedback = [string]$result.feedback
            if ([string]::IsNullOrEmpty($feedback)) { throw "empty_feedback" }
            Write-Host ("`nFeedback:`n" + $feedback)
        } catch {
            Write-ApiError $_.Exception
        }
        break
    }

    if ([string]::IsNullOrWhiteSpace($message)) {
        Write-Host "Enter a message between 1 and 4,000 characters."
        continue
    }
    if ($message.Length -gt 4000) {
        Write-Host "The message cannot exceed 4,000 characters."
        continue
    }

    try {
        $messageUri = "$apiBaseUri/trainings/$([uri]::EscapeDataString($trainingId))/messages"
        $result = Invoke-RestMethod -Method Post -Uri $messageUri -ContentType "application/json" -Body (@{ message = $message } | ConvertTo-Json -Compress)
        if ($result.status -eq "blocked") {
            Write-Host ("Coach: " + [string]$result.message)
        } elseif ($result.status -eq "accepted" -and -not [string]::IsNullOrEmpty([string]$result.reply)) {
            Write-Host ("Guest: " + [string]$result.reply)
        } else {
            Write-Host "The Coach returned an unavailable response."
        }
    } catch {
        Write-ApiError $_.Exception
    }
}
