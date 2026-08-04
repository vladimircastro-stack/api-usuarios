@echo off
REM Programar respaldo diario VC DistribuidorPro a las 8:00 PM
REM Ejecutar como Administrador

set TASK=VC-DistribuidorPro-Backup-Diario
set SCRIPT=%~dp0backup-db.ps1
set HORA=20:00

schtasks /Create /TN "%TASK%" /TR "powershell.exe -ExecutionPolicy Bypass -File \"%SCRIPT%\"" /SC DAILY /ST %HORA% /F

if %ERRORLEVEL% EQU 0 (
    echo Tarea %TASK% creada - respaldo diario a las %HORA%
) else (
    echo Error. Ejecute este archivo como Administrador.
    pause
)
