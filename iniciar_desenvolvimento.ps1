# 🚀 Script para iniciar desenvolvimento BlackinBot
Write-Host "🚀 Iniciando BlackinBot Development..." -ForegroundColor Green
Write-Host ""

# 1. Frontend (Next.js na porta 3025)
Write-Host "📱 Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Aguardar um pouco para frontend iniciar
Start-Sleep -Seconds 3

# 2. Backend (FastAPI na porta 8000)
Write-Host "🔧 Iniciando Backend..." -ForegroundColor Yellow  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python main.py"

# Aguardar um pouco para backend iniciar
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3025" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Para configurar ngrok:" -ForegroundColor Yellow
Write-Host "   1. Abra novo terminal e execute: ngrok http 8000" -ForegroundColor White
Write-Host "   2. Copie a URL HTTPS fornecida" -ForegroundColor White
Write-Host "   3. Configure webhook do bot usando a URL" -ForegroundColor White
Write-Host ""
Write-Host "⏹️  Para parar: Feche as janelas dos servidores" -ForegroundColor Red 