@echo off
REM 🚀 Script para iniciar o sistema GCEU em desenvolvimento (Windows)

setlocal enabledelayedexpansion

cls
echo ==========================================
echo   🎯 GCEU - Sistema de Gestão
echo   Iniciando desenvolvimento...
echo ==========================================
echo.

REM Verificar se Node está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js não está instalado
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js encontrado: %NODE_VERSION%
echo.

REM Backend
echo 📦 Iniciando Backend...
cd backend

if not exist "node_modules" (
    echo 📥 Instalando dependências do backend...
    call npm install
)

if not exist ".env" (
    echo ⚠️  Criando .env do backend (use .env.example como base)
    copy .env.example .env
)

if not exist ".seed-completed" (
    echo 🌱 Populando banco de dados...
    call npm run seed
    type nul > .seed-completed
)

echo ✅ Backend iniciando em http://localhost:3000
start "GCEU Backend" cmd /k npm run dev
timeout /t 3 /nobreak
echo.

REM Frontend
echo 🎨 Iniciando Frontend...
cd ..\frontend

if not exist "node_modules" (
    echo 📥 Instalando dependências do frontend...
    call npm install
)

if not exist ".env" (
    echo ⚠️  Criando .env do frontend (use .env.example como base)
    copy .env.example .env
)

echo ✅ Frontend iniciando em http://localhost:5173
start "GCEU Frontend" cmd /k npm run dev
timeout /t 3 /nobreak
echo.

REM Instruções finais
cls
echo ==========================================
echo 🚀 TUDO PRONTO!
echo ==========================================
echo.
echo 📍 Acesse a aplicação:
echo    🎨 Frontend: http://localhost:5173
echo    📦 Backend:  http://localhost:3000
echo.
echo 🔐 Credenciais padrão:
echo    Email: admin@gceu.com
echo    Senha: senha123
echo.
echo 📚 Documentação:
echo    • Setup: SETUP_GUIDE.md
echo    • Correções: CORREÇÕES_APLICADAS.md
echo    • Testes: CHECKLIST_TESTES.md
echo.
echo 🛑 Feche as janelas para parar os servidores
echo.
echo ==========================================
pause
