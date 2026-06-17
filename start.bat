@echo off
cd /d "%~dp0"
echo Iniciando o servidor do projeto QCH...
start "" npm run dev
timeout /t 5 >nul
echo Abrindo o navegador...
start http://localhost:3000
