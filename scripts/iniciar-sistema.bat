@echo off
title VC DistribuidorPro
cd /d "%~dp0.."

echo ========================================
echo   VC DistribuidorPro
echo   Gestion para distribuidoras
echo ========================================
echo.

if not exist ".env" (
    echo ERROR: No existe .env
    echo Copia .env.example a .env y configura PostgreSQL
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Instalando dependencias API...
    call npm install
)

if not exist "..\frontend\node_modules\" (
    echo Instalando dependencias frontend...
    cd ..\frontend
    call npm install
    cd ..\api-usuarios
)

if not exist "..\frontend\dist\index.html" (
    echo Compilando aplicacion web...
    cd ..\frontend
    call npm run build
    cd ..\api-usuarios
)

echo.
echo Iniciando sistema en http://localhost:3000
echo Abre el navegador en esa direccion
echo.
echo Para detener: cierra esta ventana o Ctrl+C
echo.

start http://localhost:3000
node src/server.js
pause
