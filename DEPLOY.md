# 🚀 Deploy Guide - BlackinBot

## 📋 Pré-requisitos

- [ ] Conta no [Vercel](https://vercel.com)
- [ ] Conta no [Railway](https://railway.app) (para backend Python)
- [ ] Projeto Supabase configurado
- [ ] Repositório no GitHub

## 🎯 Deploy Frontend (Vercel)

### 1. Configuração Automática via GitHub

1. **Fork/Clone** este repositório
2. **Conecte ao Vercel**:
   - Acesse [vercel.com/new](https://vercel.com/new)
   - Importe este repositório do GitHub
   - Configure as variáveis de ambiente

### 2. Variáveis de Ambiente Obrigatórias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
NEXT_PUBLIC_APP_NAME=BlackinBot

# Build
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 3. Configurações de Build

- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/.next`
- **Install Command**: `cd frontend && npm install`

## 🐍 Deploy Backend (Railway)

### 1. Configuração do Backend

1. **Conecte ao Railway**:
   - Acesse [railway.app/new](https://railway.app/new)
   - Conecte este repositório
   - Selecione a pasta `backend`

### 2. Variáveis de Ambiente do Backend

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_service_role_key

# Telegram
TELEGRAM_BOT_TOKEN=seu_bot_token

# PushInPay
PUSHINPAY_TOKEN=seu_pushinpay_token

# App
FRONTEND_URL=https://seu-dominio.vercel.app
PORT=8000
```

### 3. Configurações do Railway

- **Start Command**: `python main.py`
- **Build Command**: `pip install -r requirements.txt`

## 🔧 Configuração do Supabase

### 1. Tabelas Necessárias

Execute o seguinte SQL no Supabase:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (exemplos)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own bots" ON bots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bots" ON bots FOR ALL USING (auth.uid() = user_id);
```

### 2. Configurar Webhooks

- **Frontend URL**: `https://seu-dominio.vercel.app`
- **Backend URL**: `https://seu-backend.railway.app`

## 📱 Configuração de Domínio

### Vercel (Frontend)
1. Acesse seu projeto no Vercel
2. Vá em **Settings > Domains**
3. Adicione seu domínio personalizado

### Railway (Backend)
1. Acesse seu projeto no Railway
2. Vá em **Settings > Networking**
3. Configure o domínio customizado

## 🔍 Debug e Monitoramento

### Logs do Frontend (Vercel)
```bash
# Ver logs em tempo real
vercel logs https://seu-dominio.vercel.app --follow
```

### Logs do Backend (Railway)
```bash
# Ver logs no dashboard do Railway
# Ou usar CLI
railway logs --follow
```

## ✅ Checklist de Deploy

### Frontend
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Conexão com Supabase funcionando
- [ ] Autenticação funcionando
- [ ] Todas as páginas carregando

### Backend
- [ ] Servidor iniciando sem erros
- [ ] Conexão com banco funcionando
- [ ] APIs respondendo
- [ ] Webhooks configurados
- [ ] CORS configurado para o frontend

### Integração
- [ ] Frontend se comunica com backend
- [ ] Telegram bots funcionando
- [ ] PushInPay webhooks funcionando
- [ ] Supabase sincronizando

## 🆘 Troubleshooting

### Problemas Comuns

1. **Build Error**: Verificar dependências no package.json
2. **Environment Variables**: Verificar se todas estão configuradas
3. **CORS Error**: Configurar CORS no backend para aceitar o frontend
4. **Database Connection**: Verificar string de conexão do Supabase
5. **API Routes**: Verificar se as rotas API estão respondendo

### Comandos Úteis

```bash
# Testar build local
npm run build

# Verificar lint
npm run lint

# Testar produção local
npm run start
```

## 📞 Suporte

Para problemas de deploy, verifique:
1. Logs do Vercel/Railway
2. Console do navegador
3. Network tab para requisições falhando
4. Variáveis de ambiente

---

**Desenvolvido por**: BlackinBot Team  
**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025 