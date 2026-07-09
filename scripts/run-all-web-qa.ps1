$ErrorActionPreference = "Stop"

$webRoot = Split-Path -Parent $PSScriptRoot
$reportsDir = Join-Path $webRoot "qa\reports"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$reportPath = Join-Path $reportsDir "web-qa-full-$timestamp.md"
$port = if ($env:WEB_TEST_PORT) { [int]$env:WEB_TEST_PORT } else { 8877 }
$env:WEB_TEST_BASE = "http://127.0.0.1:$port"

New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null

Push-Location $webRoot
$serverProcess = $null
$results = @()

function Add-Result($Name, $Status, $Command, $DurationSec, $Detail) {
    $script:results += [PSCustomObject]@{
        Name = $Name
        Status = $Status
        Command = $Command
        DurationSec = $DurationSec
        Detail = $Detail
    }
}

function Run-NodeTest($Name, $ScriptRel, $NeedsServer) {
    $started = Get-Date
    $status = "PASS"
    $detail = ""
    try {
        if ($NeedsServer -and (-not $serverProcess -or $serverProcess.HasExited)) {
            throw "Local HTTP server is not running on port $port"
        }
        node (Join-Path $webRoot $ScriptRel)
        if ($LASTEXITCODE -ne 0) { throw "Exit code $LASTEXITCODE" }
    } catch {
        $status = "FAIL"
        $detail = $_.Exception.Message
    }
    $ended = Get-Date
    Add-Result $Name $status "node $ScriptRel" ([math]::Round(($ended - $started).TotalSeconds, 1)) $detail
}

try {
    if (-not (Test-Path (Join-Path $webRoot "node_modules"))) {
        npm install
    }

    if (-not (Test-Path (Join-Path $webRoot "node_modules\playwright"))) {
        npm install -D playwright
        npx playwright install chromium
    }

    $serverUp = $false
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) { $serverUp = $true }
    } catch {}

    if (-not $serverUp) {
        $serverProcess = Start-Process `
            -FilePath "python" `
            -ArgumentList @("-m", "http.server", "$port") `
            -WorkingDirectory $webRoot `
            -PassThru `
            -WindowStyle Hidden

        Start-Sleep -Seconds 2

        $deadline = (Get-Date).AddSeconds(15)
        while ((Get-Date) -lt $deadline) {
            try {
                $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 2
                if ($r.StatusCode -eq 200) { $serverUp = $true; break }
            } catch {}
            Start-Sleep -Milliseconds 500
        }
    }
    if (-not $serverUp) { throw "Could not reach local server on port $port" }

    Run-NodeTest "Web static phase1" "scripts\test-phase1-static.mjs" $true
    Run-NodeTest "Web Playwright phase1" "scripts\test-phase1.mjs" $true
    Run-NodeTest "Web code audit phase2" "scripts\test-phase2-web-audit.mjs" $false
    Run-NodeTest "Android native/Play Store audit" "scripts\test-android-native-audit.mjs" $false
} finally {
    if ($serverProcess -and -not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Pop-Location
}

$passed = @($results | Where-Object { $_.Status -eq "PASS" }).Count
$failed = @($results | Where-Object { $_.Status -eq "FAIL" }).Count

$lines = @(
    "# Web QA Full Report",
    "",
    "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "Local server: http://127.0.0.1:$port",
    "Production data: read-only checks only (app_public/web)",
    "",
    "## Summary",
    "",
    "- Tests: $($results.Count)",
    "- Passed: $passed",
    "- Failed: $failed",
    "",
    "## Results",
    ""
)

foreach ($row in $results) {
    $lines += "### $($row.Name) - $($row.Status)"
    $lines += ""
    $lines += "- Command: ``$($row.Command)``"
    $lines += "- Duration: $($row.DurationSec)s"
    if ($row.Detail) { $lines += "- Detail: $($row.Detail)" }
    $lines += ""
}

$lines += "## Coverage"
$lines += ""
$lines += "- Landing page CTA, hero, no SW on marketing site"
$lines += "- /app boot, maintenance/prep screen, asset availability"
$lines += "- Firestore app_public/web read safety (no writes from web boot)"
$lines += ""
$lines += "## Manual gaps"
$lines += ""
$lines += "- Full logged-in web flows (login, poslovi, chat) when app_public enabled"
$lines += "- Cross-browser Safari/Firefox"
$lines += "- PWA install/update on real devices"
$lines += ""

$lines | Set-Content -Encoding UTF8 $reportPath
Write-Host ""
Write-Host "Report: $reportPath"
Write-Host ""

foreach ($row in $results) {
    Write-Host ("[{0}] {1} ({2}s)" -f $row.Status, $row.Name, $row.DurationSec)
}

if ($failed -gt 0) {
    throw "Web QA finished with $failed failed test(s). See $reportPath"
}
