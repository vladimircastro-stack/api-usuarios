#Requires -Version 5.1

$taskName = "VC-DistribuidorPro-AutoInicio"
$startupShortcut = Join-Path ([Environment]::GetFolderPath("Startup")) "VC DistribuidorPro.lnk"
$launcherVbs = "C:\VC-DistribuidorPro\arranque-automatico.vbs"

try {
    schtasks /Delete /TN $taskName /F 2>$null | Out-Null
} catch {}

try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
} catch {}

if (Test-Path $startupShortcut) {
    Remove-Item $startupShortcut -Force
}

if (Test-Path $launcherVbs) {
    Remove-Item $launcherVbs -Force
}

Write-Host "Arranque automatico desactivado." -ForegroundColor Green
