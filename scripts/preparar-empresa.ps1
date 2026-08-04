#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$frontend = Join-Path (Split-Path -Parent $root) "frontend"

Write-Host "=== Preparando VC DistribuidorPro para la empresa ===" -ForegroundColor Green

Set-Location $root

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Creado .env - EDITALO con tu contraseña de PostgreSQL antes de continuar" -ForegroundColor Yellow
}

Write-Host "1/4 Instalando API..."
npm install

Write-Host "2/4 Aplicando migraciones..."
npm run migrate

Write-Host "3/4 Instalando y compilando frontend..."
Set-Location $frontend
npm install
npm run build

Set-Location $root

Write-Host "4/4 Verificando base de datos..."
node scripts/check-db.js

Write-Host ""
Write-Host "LISTO. Para usar mañana:" -ForegroundColor Green
Write-Host "  Doble clic en: scripts\iniciar-sistema.bat"
Write-Host "  O abre: http://localhost:3000"
Write-Host ""
Write-Host "Respaldo diario: npm run backup"
