#Requires -Version 5.1
# Ejecutado al final del instalador .exe (Inno Setup)
param(
    [string]$Destino = "",
    [string]$DbPassword = ""
)

$ErrorActionPreference = "Stop"
$logFile = Join-Path $Destino "instalacion-log.txt"

function Write-Log($msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg"
    Add-Content -Path $logFile -Value $line -Encoding UTF8
}

try {
    Write-Log "Inicio post-instalacion"
    & "$Destino\api-usuarios\scripts\instalar-portable.ps1" -Destino $Destino -DbPassword $DbPassword
    Write-Log "Post-instalacion OK"
    exit 0
} catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    exit 1
}
