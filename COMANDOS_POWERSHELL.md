# 🔧 Comandos Corretos para PowerShell

## ❌ Problema: O PowerShell não aceita `&&`

```powershell
# ❌ ERRO - Não funciona no PowerShell
cd frontend && npm run dev

# ✅ CORRETO - Use ponto e vírgula
cd frontend; npm run dev

# ✅ OU execute comandos separados
cd frontend
npm run dev
```

## 🚀 Comandos Corretos para Desenvolvimento

### **Método 1: Comandos Manuais**
```powershell
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend (em nova janela)
cd backend  
python main.py

# Terminal 3: ngrok (em nova janela)
ngrok http 3025
```

### **Método 2: Script Automático**
```powershell
# Execute o script PowerShell (recomendado)
.\iniciar_desenvolvimento.ps1
```

### **Método 3: Comandos em Sequência**
```powershell
# Se quiser tudo em um terminal (não recomendado para desenvolvimento)
cd frontend; Start-Job -ScriptBlock { npm run dev }; cd ..; cd backend; python main.py
```

## 🌐 Configurar ngrok

### **Passo 1: Instalar ngrok**
- Baixe em: https://ngrok.com/download
- Ou use chocolatey: `choco install ngrok`

### **Passo 2: Executar ngrok**
```powershell
# Em terminal separado
ngrok http 3025
```

### **Passo 3: Configurar Webhook**
```bash
# Substitua BOT_TOKEN e NGROK_URL pelos valores reais
curl "https://api.telegram.org/botBOT_TOKEN/setWebhook?url=NGROK_URL/telegram/webhook/BOT_TOKEN"

# Exemplo com valores reais:
curl "https://api.telegram.org/bot7832198467:AAEfJZqZfuJ/setWebhook?url=https://abc123.ngrok.io/telegram/webhook/7832198467:AAEfJZqZfuJ"
```

## ✅ Status Atual

### **🎯 O que está funcionando:**
- ✅ Backend FastAPI com webhook `/ativar_grupo`
- ✅ Validação completa de ownership e permissões  
- ✅ Salvamento no Supabase
- ✅ Mensagens de sucesso/erro
- ✅ Logs detalhados para debug

### **🔧 Para testar:**
1. ✅ Execute: `.\iniciar_desenvolvimento.ps1`
2. ✅ Execute: `ngrok http 3025` 
3. ✅ Configure webhook com URL do ngrok
4. ✅ Adicione seu bot a um grupo como admin
5. ✅ Envie `/ativar_grupo` no grupo
6. ✅ Veja logs no terminal do backend

## 🎉 Pronto para Teste!

O sistema está **100% implementado e pronto para funcionar** com ngrok! 🚀 