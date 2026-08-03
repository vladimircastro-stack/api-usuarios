# Genera un ZIP limpio para instalar en otra PC (sin node_modules, .env, .git)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$projectName = Split-Path -Leaf $projectRoot
$outputZip = Join-Path (Split-Path -Parent $projectRoot) "$projectName-instalacion.zip"

$tempDir = Join-Path $env:TEMP "paquete-$projectName-$(Get-Date -Format 'yyyyMMddHHmmss')"
$stagingDir = Join-Path $tempDir $projectName

Write-Host "Creando paquete limpio en: $outputZip"

New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

$excludeDirs = @('node_modules', '.git')
$excludeFiles = @('.env', '.env.local')

Get-ChildItem -Path $projectRoot -Force | ForEach-Object {
    if ($excludeDirs -contains $_.Name) {
        Write-Host "  Omitido: $($_.Name)/"
        return
    }

    if ($excludeFiles -contains $_.Name) {
        Write-Host "  Omitido: $($_.Name)"
        return
    }

    Copy-Item -Path $_.FullName -Destination (Join-Path $stagingDir $_.Name) -Recurse -Force
    Write-Host "  Incluido: $($_.Name)"
}

if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
}

Compress-Archive -Path $stagingDir -DestinationPath $outputZip -Force
Remove-Item $tempDir -Recurse -Force

Write-Host ""
Write-Host "Listo: $outputZip"
Write-Host "En la PC destino: descomprimir, copiar .env.example a .env, npm install, ejecutar schema.sql, npm start"
