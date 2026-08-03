@echo off
title SGCRD API
cd /d "%~dp0.."
echo Iniciando SGCRD API...
echo.
node src/server.js
pause
