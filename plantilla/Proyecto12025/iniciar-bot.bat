@echo off
setlocal EnableDelayedExpansion

:: Título y color inicial
title Iniciando el Bot de Discord
color 0A
echo -----------------------------------------
echo  Bienvenido - Iniciando el bot de Discord
echo -----------------------------------------
echo.

:: Verifica si Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado.
    echo Descárgalo desde: https://nodejs.org/
    pause
    exit /b
)

:: Instala dependencias si falta "node_modules"
if not exist node_modules (
    echo 📦 Instalando dependencias...
    npm install
    echo.
)

:: Logo en rojo
color 0C
echo MADE BY _gxb00

:: Color verde y ejecución
color 0A
echo ✅ Iniciando el bot ahora...
echo -------------------------------
echo.

:: Ejecuta el bot
node index.js

:: Verifica si ocurrió un error
if errorlevel 1 (
    echo.
    echo ❌ El bot terminó con errores.
    pause
)
