#Requires -Version 5.1
# Genera carpeta + ZIP instalador para USB / otra PC
# Ejecutar: npm run crear:instalador

$ErrorActionPreference = "Stop"

$apiRoot = Split-Path -Parent $PSScriptRoot
$projectRoot = Split-Path -Parent $apiRoot
$frontendRoot = Join-Path $projectRoot "frontend"

$fecha = Get-Date -Format "yyyy-MM-dd"
$outputFolder = Join-Path $projectRoot "VC-DistribuidorPro-Instalador"
$outputZip = Join-Path $projectRoot "VC-DistribuidorPro-Instalador.zip"

$excludeDirs = @('node_modules', '.git', 'backups', 'android', '.cursor')
$excludeFiles = @('.env', '.env.local')

Write-Host "=== Generando instalador portable ===" -ForegroundColor Green
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Instale Node.js"
}

Write-Host "[1/4] Compilando interfaz..."
Set-Location $frontendRoot
if (-not (Test-Path "node_modules")) {
    npm install 2>&1 | Out-Null
}
npm run build
if ($LASTEXITCODE -gt 0) { throw "Build del frontend fallo" }

Set-Location $apiRoot

function Copy-Tree($origen, $destino) {
    if (-not (Test-Path $origen)) { throw "No existe: $origen" }
    New-Item -ItemType Directory -Path $destino -Force | Out-Null
    Get-ChildItem -Path $origen -Force | ForEach-Object {
        if ($excludeDirs -contains $_.Name) {
            Write-Host "  omitido: $($_.Name)/"
            return
        }
        if ($excludeFiles -contains $_.Name) {
            Write-Host "  omitido: $($_.Name)"
            return
        }
        Copy-Item -Path $_.FullName -Destination (Join-Path $destino $_.Name) -Recurse -Force
    }
}

Write-Host "[2/4] Preparando carpeta del instalador..."
if (Test-Path $outputFolder) {
    Remove-Item $outputFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null

Write-Host "  api-usuarios..."
Copy-Tree $apiRoot (Join-Path $outputFolder "api-usuarios")

Write-Host "  frontend..."
Copy-Tree $frontendRoot (Join-Path $outputFolder "frontend")

Write-Host "[3/4] Archivos de instalacion..."

Copy-Item (Join-Path $apiRoot "GUIA-ADMIN-INICIO.txt") (Join-Path $outputFolder "GUIA-ADMIN-INICIO.txt") -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $apiRoot "USUARIOS-EMPRESA.md") (Join-Path $outputFolder "USUARIOS-EMPRESA.md") -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $apiRoot "GUIA-OPERATIVA.md") (Join-Path $outputFolder "GUIA-OPERATIVA.md") -Force -ErrorAction SilentlyContinue

@'
VC DistribuidorPro — INSTALADOR PARA OTRA PC
============================================

Lleve esta carpeta en USB o copiela a la PC nueva.

REQUISITOS (instalar ANTES en la PC nueva)
------------------------------------------
1. Node.js 18 o superior
   https://nodejs.org  (version LTS, Next)

2. PostgreSQL 14 o superior
   https://www.postgresql.org/download/windows/
   Anote la contraseña del usuario "postgres" al instalar.

INSTALACION (5 minutos)
-----------------------
1. Copie toda la carpeta "VC-DistribuidorPro-Instalador" a:
      C:\VC-DistribuidorPro
   (o dejela en el USB y ejecute desde ahi — recomendado copiar a C:\)

2. Doble clic en:  INSTALAR.bat

3. Escriba la contraseña de PostgreSQL cuando la pida.

4. Al terminar, doble clic en:  Iniciar-DistribuidorPro.bat
   (tambien queda icono en el Escritorio)

5. Abra:  http://localhost:3000

USUARIOS INICIALES
------------------
Admin:      vladimirnuevo@gmail.com  /  RYVAdmin2026!
            admin@ryvfrutas.com      /  RYVAdmin2026!
Vendedor:   vendedor@ryvfrutas.com   /  RYVVende2026!
Repartidor: repartidor@ryvfrutas.com /  RYVReparto2026!
Almacen:    almacen@ryvfrutas.com    /  RYVStock2026!

Cambie las contrasenas despues del primer uso.

PRIMERA CONFIGURACION
---------------------
Lea: GUIA-ADMIN-INICIO.txt
  1. Configuracion (nombre empresa, precio canasto)
  2. Productos (frutas)
  3. Cocinas (clientes)

SOPORTE
-------
Si INSTALAR.bat falla:
  - Verifique que Node y PostgreSQL esten instalados
  - Abra PowerShell como administrador en esta carpeta y ejecute:
      powershell -ExecutionPolicy Bypass -File api-usuarios\scripts\instalar-portable.ps1

'@ | Set-Content (Join-Path $outputFolder "LEEME-INSTALACION.txt") -Encoding UTF8

@'
@echo off
chcp 65001 >nul
title VC DistribuidorPro - Instalador
cd /d "%~dp0"

echo.
echo ========================================
echo   INSTALADOR VC DistribuidorPro
echo   RYV Frutas del Caribe
echo ========================================
echo.
echo Requisitos: Node.js + PostgreSQL instalados
echo Lea LEEME-INSTALACION.txt si tiene dudas
echo.

set /p DBPASS=Contraseña PostgreSQL (usuario postgres): 

echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0api-usuarios\scripts\instalar-portable.ps1" -Destino "%~dp0" -DbPassword "%DBPASS%"

echo.
pause
'@ | Set-Content (Join-Path $outputFolder "INSTALAR.bat") -Encoding ASCII

Write-Host "[4/4] Creando ZIP..."
if (Test-Path $outputZip) { Remove-Item $outputZip -Force }
Compress-Archive -Path $outputFolder -DestinationPath $outputZip -Force

$sizeMb = [math]::Round((Get-Item $outputZip).Length / 1MB, 2)
$count = (Get-ChildItem $outputFolder -Recurse -File).Count

Write-Host ""
Write-Host "LISTO" -ForegroundColor Green
Write-Host "  Carpeta (USB):  $outputFolder"
Write-Host "  ZIP:            $outputZip  ($sizeMb MB, $count archivos)"
Write-Host ""
Write-Host "Copie la CARPETA o el ZIP a la memoria USB." -ForegroundColor Cyan
Write-Host "En la PC nueva: descomprima (si es ZIP) y ejecute INSTALAR.bat"
