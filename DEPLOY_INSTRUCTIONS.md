# 🚀 Instruções de Deploy - BlackinBot

## ✅ Status do Projeto
- **Build**: ✅ Funcionando
- **Testes**: ✅ Passando
- **Git**: ✅ Commitado e enviado
- **Configurações**: ✅ Prontas

## 🎯 Deploy Frontend (Vercel)

### Passo 1: Acessar Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"

### Passo 2: Importar Repositório
1. Selecione o repositório: `Manhosu/blacknbot`
2. Configure as seguintes opções:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Passo 3: Variáveis de Ambiente
Configure estas variáveis no Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
NEXT_PUBLIC_APP_NAME=BlackinBot
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Passo 4: Deploy
1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. Teste o site no domínio fornecido

## 🚂 Deploy Backend (Railway)

### Passo 1: Acessar Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com sua conta GitHub
3. Clique em "New Project"

### Passo 2: Configurar Projeto
1. Selecione "Deploy from GitHub repo"
2. Escolha o repositório: `Manhosu/blacknbot`
3. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `python main.py`

### Passo 3: Variáveis de Ambiente
Configure estas variáveis no Railway:

```env
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_service_role_key
TELEGRAM_BOT_TOKEN=seu_bot_token
PUSHINPAY_TOKEN=seu_pushinpay_token
FRONTEND_URL=https://seu-dominio.vercel.app
PORT=8000
```

### Passo 4: Deploy
1. Clique em "Deploy"
2. Aguarde o build (3-5 minutos)
3. Anote a URL do backend

## 🔧 Configurações Pós-Deploy

### 1. Atualizar URLs no Frontend
No Vercel, atualize a variável:
```env
NEXT_PUBLIC_BACKEND_URL=https://seu-backend.railway.app
```

### 2. Configurar CORS no Backend
Certifique-se que o backend aceita requisições do frontend.

### 3. Testar Integração
1. Acesse o frontend
2. Teste login/cadastro
3. Teste criação de bot
4. Teste módulo de remarketing

## 🔍 Debug e Monitoramento

### Logs do Vercel
```bash
# Instalar CLI do Vercel
npm i -g vercel

# Ver logs
vercel logs https://seu-dominio.vercel.app
```

### Logs do Railway
1. Acesse o dashboard do Railway
2. Vá na aba "Deployments"
3. Clique em "View Logs"

## 🆘 Troubleshooting

### Problemas Comuns

#### 1. Build Error no Vercel
- Verificar se todas as dependências estão no package.json
- Verificar se não há erros de TypeScript
- Verificar variáveis de ambiente

#### 2. Backend não inicia no Railway
- Verificar requirements.txt
- Verificar se PORT está configurado
- Verificar logs de erro

#### 3. CORS Error
- Configurar CORS no backend para aceitar o domínio do frontend
- Verificar se as URLs estão corretas

#### 4. Database Connection Error
- Verificar string de conexão do Supabase
- Verificar se as tabelas existem
- Verificar políticas RLS

### Comandos de Debug

```bash
# Testar build local
cd frontend && npm run build

# Testar servidor local
cd frontend && npm run start

# Verificar dependências
npm audit

# Limpar cache
npm run build && rm -rf .next
```

## 📊 Checklist Final

### Frontend (Vercel)
- [ ] Build executado sem erros
- [ ] Todas as páginas carregando
- [ ] Login/cadastro funcionando
- [ ] Conexão com Supabase OK
- [ ] Variáveis de ambiente configuradas

### Backend (Railway)
- [ ] Servidor iniciando sem erros
- [ ] APIs respondendo
- [ ] Conexão com banco OK
- [ ] CORS configurado
- [ ] Webhooks funcionando

### Integração
- [ ] Frontend se comunica com backend
- [ ] Fluxo de pagamento funcionando
- [ ] Telegram bots operacionais
- [ ] Remarketing funcionando

## 🎉 Conclusão

Após seguir todos os passos:

1. ✅ Frontend estará rodando no Vercel
2. ✅ Backend estará rodando no Railway
3. ✅ Sistema completo funcionando
4. ✅ Pronto para produção

### URLs Finais
- **Frontend**: https://seu-dominio.vercel.app
- **Backend**: https://seu-backend.railway.app
- **Repositório**: https://github.com/Manhosu/blacknbot

---

**Desenvolvido por**: BlackinBot Team  
**Deploy realizado em**: Janeiro 2025  
**Status**: ✅ Pronto para produção 