@echo off
echo 🚀 Iniciando desenvolvimento BlackinBot...
echo.

echo 📁 Navegando para backend...
cd /d "%~dp0backend"

echo 🔧 Verificando se Python está instalado...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado! Instale Python primeiro.
    pause
    exit /b 1
)

echo 📦 Instalando dependências...
pip install -r requirements.txt

echo 🌐 Iniciando servidor FastAPI na porta 8000...
echo.
echo ✅ Backend rodando em: http://localhost:8000
echo 📚 Documentação em: http://localhost:8000/docs
echo.
echo 💡 Para configurar webhook com ngrok:
echo    1. Em outro terminal: ngrok http 8000
echo    2. Copie a URL HTTPS fornecida
echo    3. Configure webhook: https://api.telegram.org/botTOKEN/setWebhook?url=NGROK_URL/telegram/webhook/TOKEN
echo.
echo ⏹️  Para parar o servidor: Ctrl+C
echo.

python main.py 