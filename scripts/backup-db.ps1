# Respaldo de base de datos PostgreSQL - VC DistribuidorPro
# Uso: .\scripts\backup-db.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $projectRoot ".env"

if (-not (Test-Path $envFile)) {
    Write-Error "No se encontró .env en $projectRoot"
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

$backupDir = Join-Path $projectRoot "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$fileName = "backup-$($env:DB_NAME)-$timestamp.sql"
$outputPath = Join-Path $backupDir $fileName

Write-Host "Creando respaldo en $outputPath ..."

$env:PGPASSWORD = $env:DB_PASSWORD
& pg_dump -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER -d $env:DB_NAME -F p -f $outputPath

if ($LASTEXITCODE -eq 0) {
    Write-Host "Respaldo completado: $outputPath"
} else {
    Write-Error "pg_dump falló con código $LASTEXITCODE"
}
