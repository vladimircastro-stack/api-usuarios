#Requires -Version 5.1
# Programa VC DistribuidorPro para abrir solo al iniciar sesion en Windows.

$ErrorActionPreference = "Stop"
$taskName = "VC-DistribuidorPro-AutoInicio"
$exePath = "C:\VC-DistribuidorPro\app\VC DistribuidorPro-win32-x64\VC DistribuidorPro.exe"
$workDir = Split-Path $exePath -Parent
$installRoot = "C:\VC-DistribuidorPro"
$launcherVbs = Join-Path $installRoot "arranque-automatico.vbs"
$startupFolder = [Environment]::GetFolderPath("Startup")
$startupShortcut = Join-Path $startupFolder "VC DistribuidorPro.lnk"

Write-Host "=== Arranque automatico - VC DistribuidorPro ===" -ForegroundColor Green

if (-not (Test-Path $exePath)) {
    throw "No se encontro la app de escritorio. Ejecuta primero: npm run instalar:escritorio"
}

$vbsContent = @"
' Espera 60 segundos para que PostgreSQL este listo, luego abre la app
WScript.Sleep 60000
Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "$workDir"
shell.Run """$exePath""", 1, False
"@
$vbsContent | Set-Content $launcherVbs -Encoding ASCII

try {
    schtasks /Delete /TN $taskName /F 2>$null | Out-Null
} catch {}

$taskOk = $false
try {
    $action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$launcherVbs`""
    $trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
    $trigger.Delay = "PT1M"
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -RunLevel Limited -Force | Out-Null
    $taskOk = $true
    Write-Host "Tarea programada creada (1 minuto despues de iniciar sesion)."
} catch {
    Write-Host "Tarea programada no disponible, usando carpeta Inicio de Windows." -ForegroundColor Yellow
}

if (-not $taskOk) {
    if (Test-Path $startupShortcut) {
        Remove-Item $startupShortcut -Force
    }

    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($startupShortcut)
    $Shortcut.TargetPath = "wscript.exe"
    $Shortcut.Arguments = "`"$launcherVbs`""
    $Shortcut.WorkingDirectory = $installRoot
    $Shortcut.Description = "VC DistribuidorPro - arranque automatico"
    $Shortcut.Save()

    Write-Host "Acceso directo en Inicio: $startupShortcut"
}

$pgServices = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgServices) {
    foreach ($svc in $pgServices) {
        Write-Host ""
        Write-Host "PostgreSQL: $($svc.Name) - estado $($svc.Status), inicio $($svc.StartType)"
        if ($svc.StartType -ne "Automatic") {
            Write-Host "  Configurando PostgreSQL en automatico..." -ForegroundColor Yellow
            try {
                Set-Service -Name $svc.Name -StartupType Automatic -ErrorAction Stop
                if ($svc.Status -ne "Running") {
                    Start-Service -Name $svc.Name -ErrorAction Stop
                }
                Write-Host "  PostgreSQL listo para arrancar con la PC." -ForegroundColor Green
            } catch {
                Write-Host "  No se pudo cambiar PostgreSQL (ejecuta como Administrador)." -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host ""
    Write-Host "Verifica que PostgreSQL arranque con la PC." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "LISTO" -ForegroundColor Green
Write-Host "  Al encender la PC e iniciar sesion, VC DistribuidorPro se abrira solo."
Write-Host "  Espera unos 60 segundos despues del inicio de sesion."
Write-Host ""
Write-Host "  Para desactivar: npm run quitar:autoinicio"
