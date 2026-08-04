#Requires -Version 5.1
<#
.SYNOPSIS
  Instala VC DistribuidorPro (API + frontend) en cualquier PC Windows.

.PARAMETER Destino
  Carpeta donde se instalará el sistema. Por defecto C:\VC-DistribuidorPro

.PARAMETER DbPassword
  Contraseña del usuario postgres en PostgreSQL.

.PARAMETER DbName
  Nombre de la base de datos. Por defecto api_usuarios

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\instalar.ps1 -Destino "D:\VC-DistribuidorPro" -DbPassword "mi_clave"
#>
param(
    [string]$Destino = "C:\VC-DistribuidorPro",
    [string]$DbPassword = "",
    [string]$DbName = "api_usuarios"
)

$ErrorActionPreference = "Stop"
$origenApi = Split-Path -Parent $PSScriptRoot
$origenFrontend = Join-Path (Split-Path -Parent $origenApi) "frontend"
$destinoApi = Join-Path $Destino "api-usuarios"
$destinoFrontend = Join-Path $Destino "frontend"

Write-Host "=== Instalador VC DistribuidorPro ===" -ForegroundColor Green
Write-Host "Destino: $Destino"

function Test-Command($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

if (-not (Test-Command node)) { throw "Node.js no está instalado. Descárgalo de https://nodejs.org" }
if (-not (Test-Command npm)) { throw "npm no está disponible" }
if (-not (Test-Command psql)) { Write-Host "ADVERTENCIA: psql no está en PATH. Crea la BD manualmente." -ForegroundColor Yellow }

New-Item -ItemType Directory -Path $Destino -Force | Out-Null

Write-Host "Copiando archivos..."
if ($origenApi -ne $destinoApi) {
    robocopy $origenApi $destinoApi /E /XD node_modules .git backups /XF .env /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    if (Test-Path $origenFrontend) {
        robocopy $origenFrontend $destinoFrontend /E /XD node_modules /NFL /NDL /NJH /NJS /NC /NS | Out-Null
    } else {
        throw "No se encontró la carpeta frontend en $origenFrontend"
    }
} else {
    Write-Host "Instalación en la misma carpeta (sin copiar archivos)."
}

Set-Location $destinoApi

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

if ($DbPassword -ne "") {
    (Get-Content ".env") -replace '^DB_PASSWORD=.*', "DB_PASSWORD=$DbPassword" `
        -replace '^DB_NAME=.*', "DB_NAME=$DbName" `
        -replace '^NODE_ENV=.*', 'NODE_ENV=production' `
        -replace '^ALLOW_PUBLIC_REGISTER=.*', 'ALLOW_PUBLIC_REGISTER=false' | Set-Content ".env"
}

Write-Host "Instalando dependencias API..."
npm install --omit=dev

if ($DbPassword -ne "" -and (Test-Command psql)) {
    Write-Host "Creando base de datos $DbName ..."
    $env:PGPASSWORD = $DbPassword
    psql -U postgres -c "CREATE DATABASE $DbName;" 2>$null
    psql -U postgres -d $DbName -f database\schema.sql
    npm run migrate
}

Write-Host "Compilando frontend..."
Set-Location $destinoFrontend
npm install
npm run build

Set-Location $destinoApi

$accesoDirecto = Join-Path $Destino "Iniciar-DistribuidorPro.bat"
if (-not (Test-Path $accesoDirecto)) {
    @"
@echo off
cd /d "$destinoApi"
start http://localhost:3000
node src/server.js
pause
"@ | Set-Content $accesoDirecto -Encoding ASCII
}

Write-Host ""
Write-Host "INSTALACION COMPLETADA" -ForegroundColor Green
Write-Host "  Carpeta:  $Destino"
Write-Host "  Arrancar: doble clic en $accesoDirecto"
Write-Host "  URL:      http://localhost:3000"
Write-Host ""
Write-Host "Primer usuario: POST /usuarios (solo si no hay usuarios)"
Write-Host "Luego promover admin en PostgreSQL:"
Write-Host "  UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';"
