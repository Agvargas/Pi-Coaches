$ErrorActionPreference = "Stop"
$apiBaseUri = "http://127.0.0.1:3000"
function Write-ApiError([System.Exception] $Exception) { $code = 0; if ($null -ne $Exception.Response) { try { $code = [int]$Exception.Response.StatusCode } catch {} }; $text = switch ($code) { 400 { "The request was not valid." } 404 { "This training is no longer available." } 409 { "This training is busy. Please wait and try again." } 413 { "The training message or limit is too large." } 429 { "Too many active trainings. Please try again later." } 502 { "The practice was closed because the Coach is unavailable. Start a new practice; do not restart the server." } 503 { "The server is unavailable. Start it with npm start in another console." } 504 { "The practice was closed because the Coach timed out. Start a new practice; do not restart the server." } default { "Cannot contact the local server. Start it with npm start in another console." } }; Write-Host $text }
try { $health = Invoke-RestMethod -Method Get -Uri "$apiBaseUri/health"; $catalog = Invoke-RestMethod -Method Get -Uri "$apiBaseUri/frameworks"; if ($health.status -ne "ok") { throw "health" } } catch { Write-ApiError $_.Exception; return }
while ($true) {
    $selected = $false
    :framework while (-not $selected) {
        $frameworkHelp = $catalog.frameworks.Count + 1
        while ($true) {
            Write-Host "Select a framework:"; Write-Host "0. Exit"
            for ($i=0; $i -lt $catalog.frameworks.Count; $i++) { Write-Host ("{0}. {1}" -f ($i+1), $catalog.frameworks[$i].displayName) }
            Write-Host ("{0}. Help" -f $frameworkHelp); $choice = Read-Host "Choice"
            if ($choice -eq "0") { return }; if ($choice -eq "$frameworkHelp") { Write-Host "Choose a framework to start. 0 exits this client."; continue }
            if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $catalog.frameworks.Count) { $framework = $catalog.frameworks[[int]$choice-1]; break }
            Write-Host "Select a listed framework, 0 to exit, or Help."
        }
        $backToFramework = $false
        :scenarioStage while ($true) {
            $scenarioHelp = $framework.scenarios.Count + 1; $scenarioBack = $framework.scenarios.Count + 2
            while ($true) {
                Write-Host "Select a scenario:"; Write-Host "0. Exit"
                for ($i=0; $i -lt $framework.scenarios.Count; $i++) { Write-Host ("{0}. {1}" -f ($i+1), $framework.scenarios[$i].displayName) }
                Write-Host ("{0}. Help" -f $scenarioHelp); Write-Host ("{0}. Back" -f $scenarioBack); $choice = Read-Host "Choice"
                if ($choice -eq "0") { return }; if ($choice -eq "$scenarioBack") { $backToFramework = $true; break }; if ($choice -eq "$scenarioHelp") { Write-Host "Choose a scenario. 0 exits; Back returns to frameworks."; continue }
                if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $framework.scenarios.Count) { $scenario = $framework.scenarios[[int]$choice-1]; break }
                Write-Host "Select a listed scenario, 0 to exit, Help, or Back."
            }
            if ($backToFramework) { break scenarioStage }
            while ($true) {
                Write-Host "Select feedback:"; Write-Host "0. Exit"; Write-Host "1. Final"; Write-Host "2. Immediate and final"; Write-Host "3. Help"; Write-Host "4. Back"; $choice = Read-Host "Choice"
                if ($choice -eq "0") { return }; if ($choice -eq "4") { continue scenarioStage }; if ($choice -eq "3") { Write-Host "Final feedback is shown at the end. Immediate feedback also follows each accepted message. 0 exits; Back returns to scenarios."; continue }
                if ($choice -eq "1") { $mode = "final"; break }; if ($choice -eq "2") { $mode = "immediate-and-final"; break }; Write-Host "Select 1 or 2, 0 to exit, Help, or Back."
            }
            $selected = $true; break framework
        }
    }
    try { $training = Invoke-RestMethod -Method Post -Uri "$apiBaseUri/trainings" -ContentType "application/json" -Body (@{frameworkId=$framework.id;scenarioId=$scenario.id;feedbackMode=$mode}|ConvertTo-Json -Compress) } catch { Write-ApiError $_.Exception; continue }
    $id = [string]$training.trainingId; if ($training.startMode -eq "character-opens") { Write-Host ("Character: "+$training.openingMessage) } else { Write-Host ("Context:`n"+$training.publicContext) }; Write-Host "Commands: /help, /end, /exit"
    $active = $true
    while ($active) {
        $message = Read-Host "You"; $command = $message.Trim()
        if ($command -eq "/help") { Write-Host "Write a coaching message for the situation. /end gets final feedback and returns to selection. /exit cancels without feedback and exits."; continue }
        if ($command -eq "/exit") { try { Invoke-RestMethod -Method Delete -Uri "$apiBaseUri/trainings/$([uri]::EscapeDataString($id))" | Out-Null; return } catch { $code=0; try { $code=[int]$_.Exception.Response.StatusCode } catch {}; if ($code -eq 404) { return }; Write-ApiError $_.Exception; continue } }
        if ($command -eq "/end") { try { $result=Invoke-RestMethod -Method Post -Uri "$apiBaseUri/trainings/$([uri]::EscapeDataString($id))/end" -ContentType "application/json" -Body "{}"; Write-Host ("`nFeedback:`n"+$result.feedback); $active=$false } catch { Write-ApiError $_.Exception }; continue }
        if ([string]::IsNullOrWhiteSpace($message) -or $message.Length -gt 4000) { Write-Host "Enter a message between 1 and 4,000 characters."; continue }
        try { $result=Invoke-RestMethod -Method Post -Uri "$apiBaseUri/trainings/$([uri]::EscapeDataString($id))/messages" -ContentType "application/json" -Body (@{message=$message}|ConvertTo-Json -Compress); if ($result.status -eq "blocked") { Write-Host ("Coach: "+$result.message) } else { Write-Host ("Character: "+$result.reply); if ($null -ne $result.feedback) { Write-Host ("Feedback:`n"+$result.feedback) } } } catch { Write-ApiError $_.Exception; break }
    }
}
