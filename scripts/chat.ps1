$ErrorActionPreference = "Stop"
$apiBaseUri = "http://127.0.0.1:3000"
function Write-ApiError([System.Exception] $Exception) { $code = 0; if ($null -ne $Exception.Response) { try { $code = [int]$Exception.Response.StatusCode } catch {} }; $text = switch ($code) { 400 { "The request was not valid." } 404 { "This training is no longer available." } 409 { "This training is busy. Please wait and try again." } 413 { "The training message or limit is too large." } 429 { "Too many active trainings. Please try again later." } 502 { "The practice was closed because the Coach is unavailable. Start a new practice; do not restart the server." } 503 { "The server is unavailable. Start it with npm start in another console." } 504 { "The practice was closed because the Coach timed out. Start a new practice; do not restart the server." } default { "Cannot contact the local server. Start it with npm start in another console." } }; Write-Host $text }
try { $health = Invoke-RestMethod -Method Get -Uri "$apiBaseUri/health"; $catalog = Invoke-RestMethod -Method Get -Uri "$apiBaseUri/frameworks"; if ($health.status -ne "ok") { throw "health" } } catch { Write-ApiError $_.Exception; return }
$selected = $false
:framework while (-not $selected) {
    while ($true) {
        Write-Host "Select a framework:"; Write-Host "0. Exit"
        for ($i=0; $i -lt $catalog.frameworks.Count; $i++) { Write-Host ("{0}. {1}" -f ($i+1), $catalog.frameworks[$i].displayName) }
        $choice = Read-Host "Choice"
        if ($choice -eq "0") { return }
        if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $catalog.frameworks.Count) { $framework = $catalog.frameworks[[int]$choice-1]; break }
        Write-Host "Select a listed framework, or 0 to exit."
    }
    $backToFramework = $false
    :scenarioStage while ($true) {
        while ($true) {
            Write-Host "Select a scenario:"; Write-Host "0. Back"
            for ($i=0; $i -lt $framework.scenarios.Count; $i++) { Write-Host ("{0}. {1}" -f ($i+1), $framework.scenarios[$i].displayName) }
            $choice = Read-Host "Choice"
            if ($choice -eq "0") { $backToFramework = $true; break }
            if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $framework.scenarios.Count) { $scenario = $framework.scenarios[[int]$choice-1]; break }
            Write-Host "Select a listed scenario, or 0 to go back."
        }
        if ($backToFramework) { break scenarioStage }
        while ($true) {
            Write-Host "Select feedback:"; Write-Host "1. Final"; Write-Host "2. Immediate and final"; Write-Host "0. Back"
            $choice = Read-Host "Choice"
            if ($choice -eq "0") { continue scenarioStage }
            if ($choice -eq "1") { $mode = "final"; break }
            if ($choice -eq "2") { $mode = "immediate-and-final"; break }
            Write-Host "Select 1 or 2, or 0 to go back."
        }
        $selected = $true; break framework
    }
}
try { $training = Invoke-RestMethod -Method Post -Uri "$apiBaseUri/trainings" -ContentType "application/json" -Body (@{frameworkId=$framework.id;scenarioId=$scenario.id;feedbackMode=$mode}|ConvertTo-Json -Compress) } catch { Write-ApiError $_.Exception; return }; $id=[string]$training.trainingId; if ($training.startMode -eq "character-opens") { Write-Host ("Character: "+$training.openingMessage) } else { Write-Host ("Context:`n"+$training.publicContext) }; Write-Host "Commands: /help, /end"
while ($true) { $message=Read-Host "You"; if ($message.Trim() -eq "/help") { Write-Host "Commands: /help, /end"; continue }; if ($message.Trim() -eq "/end") { try { $result=Invoke-RestMethod -Method Post -Uri "$apiBaseUri/trainings/$([uri]::EscapeDataString($id))/end" -ContentType "application/json" -Body "{}"; Write-Host ("`nFeedback:`n"+$result.feedback) } catch { Write-ApiError $_.Exception }; break }; if ([string]::IsNullOrWhiteSpace($message) -or $message.Length -gt 4000) { Write-Host "Enter a message between 1 and 4,000 characters."; continue }; try { $result=Invoke-RestMethod -Method Post -Uri "$apiBaseUri/trainings/$([uri]::EscapeDataString($id))/messages" -ContentType "application/json" -Body (@{message=$message}|ConvertTo-Json -Compress); if ($result.status -eq "blocked") { Write-Host ("Coach: "+$result.message) } else { Write-Host ("Character: "+$result.reply); if ($null -ne $result.feedback) { Write-Host ("Feedback:`n"+$result.feedback) } } } catch { Write-ApiError $_.Exception; break } }
