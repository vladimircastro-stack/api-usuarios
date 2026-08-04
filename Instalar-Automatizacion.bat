@echo off
REM Programar backup e inicio de VC DistribuidorPro
REM Clic derecho -> Ejecutar como administrador

cd /d "%~dp0.."
echo Instalando tareas programadas...
node scripts\instalar-automatizacion.js
echo.
pause
