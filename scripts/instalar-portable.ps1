#Requires -Version 5.1
<#
  Instala VC DistribuidorPro en la carpeta actual (paquete USB / carpeta descomprimida).
  Ejecutado por INSTALAR.bat en la raíz del paquete.
#>
param(
    [string]$Destino = "",
    [string]$DbPassword = "",
    [string]$DbName = "api_usuarios"
)

$ErrorActionPreference = "Stop"

if ($Destino -eq "") {
    $Destino = Split-Path -Parent $PSScriptRoot
}

$destinoApi = Join-Path $Destino "api-usuarios"
$destinoFrontend = Join-Path $Destino "frontend"
$envPath = Join-Path $destinoApi ".env"

Write-Host ""
Write-Host "=== Instalacion VC DistribuidorPro ===" -ForegroundColor Green
Write-Host "Carpeta: $Destino"
Write-Host ""

function Test-Cmd($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Test-Cmd node)) {
    throw "Instale Node.js 18+ desde https://nodejs.org y vuelva a ejecutar INSTALAR.bat"
}

if (-not (Test-Path (Join-Path $destinoFrontend "dist\index.html"))) {
    throw "Falta frontend\dist\index.html en el paquete. Regenera el instalador en el PC de desarrollo."
}

Set-Location $destinoApi

if (-not (Test-Path ".env.example")) {
    throw "Paquete incompleto: falta api-usuarios\.env.example"
}

if (-not (Test-Path $envPath)) {
    Copy-Item ".env.example" ".env"
}

if ($DbPassword -eq "") {
    $secure = Read-Host "Contraseña PostgreSQL (usuario postgres)" -AsSecureString
    $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

if ($DbPassword -eq "") {
    throw "Debe indicar la contraseña de PostgreSQL"
}

$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object { [char]$_ })

(Get-Content $envPath) `
    -replace '^DB_PASSWORD=.*', "DB_PASSWORD=$DbPassword" `
    -replace '^DB_NAME=.*', "DB_NAME=$DbName" `
    -replace '^NODE_ENV=.*', 'NODE_ENV=production' `
    -replace '^ALLOW_PUBLIC_REGISTER=.*', 'ALLOW_PUBLIC_REGISTER=false' `
    -replace '^JWT_SECRET=.*', "JWT_SECRET=$jwtSecret" | Set-Content $envPath -Encoding UTF8

Write-Host "Instalando dependencias del servidor..."
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
npm install --omit=dev 2>&1 | Out-Null
if ($LASTEXITCODE -gt 0) {
    $ErrorActionPreference = $prevEap
    throw "npm install fallo. Verifique conexion a internet (solo la primera vez)."
}

if (Test-Cmd psql) {
    Write-Host "Configurando base de datos PostgreSQL..."
    $env:PGPASSWORD = $DbPassword
    psql -U postgres -c "CREATE DATABASE $DbName;" 2>$null | Out-Null
    if (Test-Path "database\schema.sql") {
        psql -U postgres -d $DbName -f database\schema.sql 2>$null | Out-Null
    }
} else {
    Write-Host "ADVERTENCIA: psql no esta en PATH." -ForegroundColor Yellow
    Write-Host "  Cree la base '$DbName' manualmente en pgAdmin y ejecute migraciones." -ForegroundColor Yellow
}

Write-Host "Aplicando migraciones..."
npm run migrate
if ($LASTEXITCODE -gt 0) {
    $ErrorActionPreference = $prevEap
    throw "Migraciones fallaron. Revise PostgreSQL y la contraseña."
}

Write-Host "Creando usuarios del equipo RYV..."
node scripts/crear-usuarios-empresa.js
if ($LASTEXITCODE -gt 0) {
    $ErrorActionPreference = $prevEap
    throw "No se pudieron crear los usuarios."
}
$ErrorActionPreference = $prevEap

$batPath = Join-Path $Destino "Iniciar-DistribuidorPro.bat"
@(
    '@echo off',
    'title VC DistribuidorPro - RYV Frutas del Caribe',
    'cd /d "%~dp0api-usuarios"',
    '',
    'echo ========================================',
    'echo   VC DistribuidorPro',
    'echo   RYV Frutas del Caribe',
    'echo ========================================',
    'echo.',
    '',
    'if not exist ".env" (',
    '    echo ERROR: Ejecute primero INSTALAR.bat',
    '    pause',
    '    exit /b 1',
    ')',
    '',
    'echo Iniciando... Abra http://localhost:3000 si no abre solo.',
    'echo.',
    'start http://localhost:3000',
    'node src/server.js',
    'pause'
) | Set-Content $batPath -Encoding ASCII

try {
    $desktop = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktop "VC DistribuidorPro.lnk"
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $batPath
    $Shortcut.WorkingDirectory = $Destino
    $Shortcut.Description = "RYV Frutas del Caribe - VC DistribuidorPro"
    $Shortcut.Save()
    Write-Host "Acceso directo en el Escritorio creado." -ForegroundColor Cyan
} catch {
    Write-Host "No se pudo crear acceso directo (use Iniciar-DistribuidorPro.bat)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "INSTALACION COMPLETADA" -ForegroundColor Green
Write-Host "  Carpeta:  $Destino"
Write-Host "  Iniciar:  Iniciar-DistribuidorPro.bat"
Write-Host "  URL:      http://localhost:3000"
Write-Host "  Guia:     GUIA-ADMIN-INICIO.txt"
Write-Host ""
Write-Host "Admin: vladimirnuevo@gmail.com / RYVAdmin2026!" -ForegroundColor Cyan
