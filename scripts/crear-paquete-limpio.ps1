# Genera ZIP completo VC DistribuidorPro (api-usuarios + frontend) para instalar en otra PC

$ErrorActionPreference = "Stop"

$apiRoot = Split-Path -Parent $PSScriptRoot
$projectRoot = Split-Path -Parent $apiRoot
$frontendRoot = Join-Path $projectRoot "frontend"
$outputZip = Join-Path $projectRoot "VC-DistribuidorPro-instalacion.zip"

$tempDir = Join-Path $env:TEMP "vc-distribuidorpro-paquete-$(Get-Date -Format 'yyyyMMddHHmmss')"
$stagingDir = Join-Path $tempDir "VC-DistribuidorPro"

Write-Host "=== Generando paquete VC DistribuidorPro ===" -ForegroundColor Green
Write-Host "Salida: $outputZip"

New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

$excludeDirs = @('node_modules', '.git', 'backups')
$excludeFiles = @('.env', '.env.local')

function Copy-Project($origen, $destino) {
    if (-not (Test-Path $origen)) {
        throw "No se encontró: $origen"
    }
    New-Item -ItemType Directory -Path $destino -Force | Out-Null
    Get-ChildItem -Path $origen -Force | ForEach-Object {
        if ($excludeDirs -contains $_.Name) {
            Write-Host "  Omitido: $($_.Name)/"
            return
        }
        if ($excludeFiles -contains $_.Name) {
            Write-Host "  Omitido: $($_.Name)"
            return
        }
        Copy-Item -Path $_.FullName -Destination (Join-Path $destino $_.Name) -Recurse -Force
        Write-Host "  Incluido: $($_.Name)"
    }
}

Write-Host "Copiando api-usuarios..."
Copy-Project $apiRoot (Join-Path $stagingDir "api-usuarios")

Write-Host "Copiando frontend..."
Copy-Project $frontendRoot (Join-Path $stagingDir "frontend")

@'
VC DistribuidorPro - Gestión para distribuidoras
================================================

INSTALACION EN PC NUEVA
-----------------------

1. Instalar Node.js 18+ (https://nodejs.org)
2. Instalar PostgreSQL (https://postgresql.org/download/windows/)
3. Descomprimir este ZIP en C:\VC-DistribuidorPro (o la ruta que prefieras)
4. Doble clic en INSTALAR.bat
   - Pedira la contraseña de PostgreSQL
5. Al terminar, doble clic en Iniciar-DistribuidorPro.bat
6. Abrir http://localhost:3000

PRIMER USUARIO
--------------
Si la base de datos esta vacia, registra un usuario.
Luego en PostgreSQL ejecuta:
  UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';

USO DIARIO
----------
Doble clic en Iniciar-DistribuidorPro.bat

RESPALDO
--------
En PowerShell, desde api-usuarios:
  npm run backup

'@ | Set-Content (Join-Path $stagingDir "LEEME-INSTALACION.txt") -Encoding UTF8

@'
@echo off
title VC DistribuidorPro - Instalador
cd /d "%~dp0"
echo.
echo ========================================
echo   INSTALADOR VC DistribuidorPro
echo ========================================
echo.
set /p DBPASS=Contraseña de PostgreSQL (usuario postgres): 
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0api-usuarios\scripts\instalar.ps1" -Destino "%~dp0" -DbPassword "%DBPASS%"
echo.
pause
'@ | Set-Content (Join-Path $stagingDir "INSTALAR.bat") -Encoding ASCII

@'
@echo off
title VC DistribuidorPro
cd /d "%~dp0api-usuarios"
echo Iniciando VC DistribuidorPro...
start http://localhost:3000
node src/server.js
pause
'@ | Set-Content (Join-Path $stagingDir "Iniciar-DistribuidorPro.bat") -Encoding ASCII

if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
}

Compress-Archive -Path $stagingDir -DestinationPath $outputZip -Force
Remove-Item $tempDir -Recurse -Force

$sizeMb = [math]::Round((Get-Item $outputZip).Length / 1MB, 2)
Write-Host ""
Write-Host "LISTO: $outputZip ($sizeMb MB)" -ForegroundColor Green
Write-Host "Copia este archivo a la PC de la empresa (USB, correo, etc.)"
Write-Host "En destino: descomprimir y ejecutar INSTALAR.bat"
