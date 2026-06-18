@echo off
REM FavChar - Script rápido de setup para Windows

echo.
echo ===============================================
echo  FavChar - Setup inicial
echo ===============================================
echo.

REM Verifica si Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git no está instalado.
    echo Ve a https://git-scm.com/download/win e instala Git
    echo Luego abre PowerShell en esta carpeta y ejecuta de nuevo
    pause
    exit /b 1
)

REM Verifica si Node.js está instalado (opcional)
node --version >nul 2>&1
if errorlevel 1 (
    echo AVISO: Node.js no está instalado
    echo Si quieres probar la app localmente, instala Node.js desde https://nodejs.org
    echo.
)

echo Inicializando repositorio Git...
git init
git add .
git commit -m "Primer commit: FavChar inicial"
git branch -M main

echo.
echo ===============================================
echo  Próximos pasos en PowerShell:
echo ===============================================
echo.
echo 1. Abre PowerShell en esta carpeta (Win + X, luego A)
echo.
echo 2. Ejecuta este comando (reemplaza TU_USUARIO con tu username de GitHub):
echo    git remote add origin https://github.com/TU_USUARIO/favchar.git
echo.
echo 3. Luego:
echo    git push -u origin main
echo.
echo 4. Ve a https://vercel.com y conecta tu repositorio
echo.
echo ===============================================
echo.
pause
