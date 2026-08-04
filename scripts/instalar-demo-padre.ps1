#Requires -Version 5.1
# Instala VC DistribuidorPro en C:\VC-DistribuidorPro para demo.
# Ejecutar: npm run instalar:demo

$ErrorActionPreference = "Stop"
$Destino = "C:\VC-DistribuidorPro"
$origenApi = Split-Path -Parent $PSScriptRoot
$origenFrontend = Join-Path (Split-Path -Parent $origenApi) "frontend"
$destinoApi = Join-Path $Destino "api-usuarios"
$destinoFrontend = Join-Path $Destino "frontend"
$envOrigen = Join-Path $origenApi ".env"

Write-Host "=== VC DistribuidorPro - Instalacion para demo ===" -ForegroundColor Green
Write-Host "Destino: $Destino"
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Instala Node.js desde https://nodejs.org"
}

New-Item -ItemType Directory -Path $Destino -Force | Out-Null

Write-Host "Copiando archivos..."
robocopy $origenApi $destinoApi /E /XD node_modules .git backups /XF .env /NFL /NDL /NJH /NJS /NC /NS | Out-Null
robocopy $origenFrontend $destinoFrontend /E /XD node_modules dist /NFL /NDL /NJH /NJS /NC /NS | Out-Null

if (Test-Path $envOrigen) {
    Copy-Item $envOrigen (Join-Path $destinoApi ".env") -Force
    Write-Host "  .env copiado - misma base de datos"
} elseif (-not (Test-Path (Join-Path $destinoApi ".env"))) {
    Copy-Item (Join-Path $destinoApi ".env.example") (Join-Path $destinoApi ".env")
    Write-Host "  ADVERTENCIA: configura .env con la clave de PostgreSQL" -ForegroundColor Yellow
}

Set-Location $destinoApi
Write-Host "Instalando dependencias API..."
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
npm install --omit=dev 2>&1 | Out-Null
if ($LASTEXITCODE -gt 0) { $ErrorActionPreference = $prevEap; throw "npm install fallo en API" }

Write-Host "Aplicando migraciones..."
npm run migrate
if ($LASTEXITCODE -gt 0) { $ErrorActionPreference = $prevEap; throw "migrate fallo" }

Write-Host "Usuarios del equipo..."
node scripts/crear-usuarios-empresa.js
if ($LASTEXITCODE -gt 0) { $ErrorActionPreference = $prevEap; throw "crear-usuarios fallo" }

Write-Host "Compilando frontend..."
Set-Location $destinoFrontend
npm install 2>&1 | Out-Null
if ($LASTEXITCODE -gt 0) { $ErrorActionPreference = $prevEap; throw "npm install fallo en frontend" }
npm run build
if ($LASTEXITCODE -gt 0) { $ErrorActionPreference = $prevEap; throw "build fallo" }
$ErrorActionPreference = $prevEap

Set-Location $destinoApi

$batPath = Join-Path $Destino "Iniciar-DistribuidorPro.bat"
$batLines = @(
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
    '    echo ERROR: Falta archivo .env',
    '    pause',
    '    exit /b 1',
    ')',
    '',
    'if not exist "..\frontend\dist\index.html" (',
    '    echo Compilando interfaz...',
    '    cd ..\frontend',
    '    call npm run build',
    '    cd ..\api-usuarios',
    ')',
    '',
    'echo Iniciando VC DistribuidorPro...',
    'echo.',
    'node src/server.js',
    'pause'
)
$batLines | Set-Content $batPath -Encoding ASCII

Copy-Item (Join-Path $origenApi "GUIA-ADMIN-INICIO.txt") (Join-Path $Destino "GUIA-ADMIN-INICIO.txt") -Force
Copy-Item (Join-Path $origenApi "DEMO-PARA-PAPA.txt") (Join-Path $Destino "DEMO-PARA-PAPA.txt") -Force
Copy-Item (Join-Path $origenApi "USUARIOS-EMPRESA.md") (Join-Path $Destino "USUARIOS-EMPRESA.md") -Force -ErrorAction SilentlyContinue
Copy-Item (Join-Path $origenApi "GUIA-OPERATIVA.md") (Join-Path $Destino "GUIA-OPERATIVA.md") -Force -ErrorAction SilentlyContinue

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "VC DistribuidorPro.lnk"
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = Join-Path $Destino "Iniciar-DistribuidorPro.bat"
$Shortcut.WorkingDirectory = $Destino
$Shortcut.Description = "RYV Frutas del Caribe - Sistema de gestion"
$Shortcut.Save()

Write-Host ""
Write-Host "LISTO" -ForegroundColor Green
Write-Host "  Carpeta:    $Destino"
Write-Host "  Escritorio: VC DistribuidorPro.lnk"
Write-Host "  Demo:       $Destino\DEMO-PARA-PAPA.txt"
Write-Host "  URL:        http://localhost:3000"
Write-Host ""
Write-Host "Doble clic en el icono del Escritorio para iniciar." -ForegroundColor Cyan
Write-Host "Para app de escritorio sin navegador ejecuta: npm run instalar:escritorio" -ForegroundColor Yellow
