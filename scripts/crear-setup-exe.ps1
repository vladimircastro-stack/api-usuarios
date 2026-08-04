#Requires -Version 5.1
# Genera VC-DistribuidorPro-Setup.exe (instalador grafico tipo juegos/programas)
# Ejecutar: npm run crear:setup

$ErrorActionPreference = "Stop"

$apiRoot = Split-Path -Parent $PSScriptRoot
$projectRoot = Split-Path -Parent $apiRoot
$scriptsDir = $PSScriptRoot
$issFile = Join-Path $scriptsDir "instalador.iss"

$stagingDir = Join-Path $projectRoot "VC-DistribuidorPro-Instalador"
$outputDir = Join-Path $projectRoot "dist-setup"
$setupExe = Join-Path $outputDir "VC-DistribuidorPro-Setup.exe"

function Find-InnoCompiler {
    $paths = @(
        "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
        "$env:ProgramFiles\Inno Setup 6\ISCC.exe",
        "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
    )
    foreach ($p in $paths) {
        if (Test-Path $p) { return $p }
    }
    $cmd = Get-Command iscc -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

function Ensure-InnoSetup {
    $iscc = Find-InnoCompiler
    if ($iscc) { return $iscc }

    Write-Host "Inno Setup no encontrado. Instalando (gratis, una sola vez)..." -ForegroundColor Yellow
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install --id JRSoftware.InnoSetup -e --accept-source-agreements --accept-package-agreements --silent
        Start-Sleep -Seconds 5
        $iscc = Find-InnoCompiler
        if ($iscc) { return $iscc }
    }

    throw @"
No se pudo instalar Inno Setup automaticamente.

Instale manualmente (gratis, 2 minutos):
  https://jrsoftware.org/isdl.php

Luego ejecute de nuevo:  npm run crear:setup
"@
}

Write-Host "=== Generando instalador .exe ===" -ForegroundColor Green
Write-Host ""

Write-Host "[1/3] Preparando archivos del programa..."
& (Join-Path $scriptsDir "crear-instalador-portable.ps1") | Out-Host
if (-not (Test-Path $stagingDir)) {
    throw "No se genero la carpeta de staging: $stagingDir"
}

@'
@echo off
chcp 65001 >nul
title VC DistribuidorPro - Configurar
cd /d "%~dp0"
echo.
echo Configuracion de base de datos PostgreSQL
echo.
set /p DBPASS=Contraseña PostgreSQL (usuario postgres): 
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0api-usuarios\scripts\instalar-portable.ps1" -Destino "%~dp0" -DbPassword "%DBPASS%"
echo.
pause
'@ | Set-Content (Join-Path $stagingDir "CONFIGURAR.bat") -Encoding ASCII

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

Write-Host "[2/3] Buscando compilador Inno Setup..."
$iscc = Ensure-InnoSetup
Write-Host "  $iscc"

$iconPath = Join-Path $projectRoot "desktop\icon.ico"
if (-not (Test-Path $iconPath)) {
    $iconPath = "C:\VC-DistribuidorPro\desktop\icon.ico"
}

$licenseFile = Join-Path $scriptsDir "instalador-licencia.txt"
$infoFile = Join-Path $scriptsDir "instalador-info-antes.txt"

$defines = @(
    "/DStagingDir=$stagingDir",
    "/DOutputDir=$outputDir",
    "/DLicenseFile=$licenseFile",
    "/DInfoBeforeFile=$infoFile"
)

if (Test-Path $iconPath) {
    $defines += "/DSetupIcon=$iconPath"
    Write-Host "  Icono: $iconPath"
} else {
    $defines += "/DSetupIcon="
    Write-Host "  Icono: predeterminado de Windows" -ForegroundColor Yellow
}

Write-Host "[3/3] Compilando VC-DistribuidorPro-Setup.exe ..."
$argList = @($issFile) + $defines
& $iscc @argList
if ($LASTEXITCODE -ne 0) {
    throw "La compilacion del instalador fallo (codigo $LASTEXITCODE)"
}

if (-not (Test-Path $setupExe)) {
    throw "No se encontro el ejecutable generado"
}

$sizeMb = [math]::Round((Get-Item $setupExe).Length / 1MB, 2)

Write-Host ""
Write-Host "LISTO - Instalador tipo programa comercial" -ForegroundColor Green
Write-Host ('  Archivo:  ' + $setupExe + '  (' + $sizeMb + ' MB)')
Write-Host ""
Write-Host "Copie ese .exe a USB o envielo por correo." -ForegroundColor Cyan
Write-Host "En la PC nueva: doble clic, Siguiente, Instalar."
