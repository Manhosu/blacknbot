@echo off
echo 🌐 Configurando ngrok para BlackinBot...
echo.

echo 💡 INSTRUÇÕES:
echo    1. Certifique-se que o backend está rodando (execute start_development.bat)
echo    2. Execute este script para expor a porta 3025
echo    3. Copie a URL HTTPS que aparecer
echo    4. Use a URL para configurar seu bot no Telegram
echo.

echo 🔧 Iniciando ngrok na porta 3025...
echo.
echo ⚠️  IMPORTANTE: Copie a URL HTTPS que aparecer (https://xxxxx.ngrok.io)
echo.
echo 📝 Para configurar webhook do seu bot:
echo    curl "https://api.telegram.org/botSEU_TOKEN/setWebhook?url=NGROK_URL/telegram/webhook/SEU_TOKEN"
echo.
echo ⏹️  Para parar o ngrok: Ctrl+C
echo.

ngrok http 3025 