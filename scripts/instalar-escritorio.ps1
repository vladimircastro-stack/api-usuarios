#Requires -Version 5.1
# Crea la aplicacion de escritorio (sin navegador) en C:\VC-DistribuidorPro\app

$ErrorActionPreference = "Stop"
$Destino = "C:\VC-DistribuidorPro"
$origenApi = Split-Path -Parent $PSScriptRoot
$origenDesktop = Join-Path (Split-Path -Parent $origenApi) "desktop"
$destinoDesktop = Join-Path $Destino "desktop"
$exeFolder = Join-Path $Destino "app\VC DistribuidorPro-win32-x64"
$exePath = Join-Path $exeFolder "VC DistribuidorPro.exe"

Write-Host "=== VC DistribuidorPro - App de escritorio ===" -ForegroundColor Green

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Instala Node.js desde https://nodejs.org"
}

if (-not (Test-Path (Join-Path $Destino "api-usuarios\.env"))) {
    throw "Primero ejecuta: npm run instalar:demo"
}

Write-Host "Copiando launcher de escritorio..."
robocopy $origenDesktop $destinoDesktop /E /XD node_modules /NFL /NDL /NJH /NJS /NC /NS | Out-Null

Set-Location $destinoDesktop
Write-Host "Instalando Electron (puede tardar unos minutos)..."
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
npm install 2>&1 | Out-Null
if ($LASTEXITCODE -gt 0) { $ErrorActionPreference = $prevEap; throw "npm install fallo en desktop" }

Write-Host "Generando ejecutable..."
npm run pack 2>&1 | Out-Null
if ($LASTEXITCODE -gt 0) { $ErrorActionPreference = $prevEap; throw "electron-packager fallo" }
$ErrorActionPreference = $prevEap

if (-not (Test-Path $exePath)) {
    throw "No se encontro el ejecutable en $exePath"
}

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "VC DistribuidorPro.lnk"
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $exePath
$Shortcut.WorkingDirectory = $exeFolder
$Shortcut.Description = "RYV Frutas del Caribe - VC DistribuidorPro"
$Shortcut.Save()

$startMenuPrograms = Join-Path ([Environment]::GetFolderPath("StartMenu")) "Programs"
$startShortcutPath = Join-Path $startMenuPrograms "VC DistribuidorPro.lnk"
$StartShortcut = $WshShell.CreateShortcut($startShortcutPath)
$StartShortcut.TargetPath = $exePath
$StartShortcut.WorkingDirectory = $exeFolder
$StartShortcut.Description = "RYV Frutas del Caribe - VC DistribuidorPro"
$StartShortcut.Save()

Write-Host ""
Write-Host "LISTO - Aplicacion de escritorio instalada" -ForegroundColor Green
Write-Host "  Ejecutable: $exePath"
Write-Host "  Escritorio: VC DistribuidorPro.lnk"
Write-Host "  Menu Inicio: VC DistribuidorPro"
Write-Host ""
Write-Host "Abre el icono del Escritorio. Ya no se abrira el navegador." -ForegroundColor Cyan
