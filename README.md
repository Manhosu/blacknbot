# 🤖 BlackinBot - Sistema de Monetização para Telegram

**Plataforma completa para criação e gerenciamento de bots de monetização no Telegram com integração PushInPay**

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura do Sistema](#️-arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Estrutura do Projeto](#-estrutura-do-projeto)
5. [Configuração do Ambiente](#️-configuração-do-ambiente)
6. [Instalação e Execução](#-instalação-e-execução)
7. [Funcionalidades Principais](#-funcionalidades-principais)
8. [API e Webhooks](#-api-e-webhooks)
9. [Banco de Dados](#️-banco-de-dados)
10. [Autenticação e Segurança](#-autenticação-e-segurança)
11. [Deploy e Produção](#-deploy-e-produção)
12. [Desenvolvimento](#-desenvolvimento)
13. [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

O **BlackinBot** é uma plataforma SaaS que permite aos usuários criarem e gerenciarem bots do Telegram para monetização de grupos/canais VIP. O sistema oferece:

- **Dashboard Web**: Interface para criação e configuração de bots
- **Bots Telegram**: Automatização de vendas e gerenciamento de grupos
- **Sistema de Pagamentos**: Integração com PushInPay
- **Remarketing**: Gestão automatizada de renovações
- **Analytics**: Relatórios de vendas e performance

### 🎯 Fluxo Principal

1. **Usuário se cadastra** na plataforma
2. **Configura token PushInPay** para receber pagamentos
3. **Cria um bot** através do @BotFather do Telegram
4. **Configura o bot** no dashboard (planos, mensagens, grupo VIP)
5. **Bot processa vendas** automaticamente
6. **Sistema gerencia** acesso ao grupo VIP e renovações

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Telegram      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│     Bot API     │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • Webhooks      │    │ • Bot Messages  │
│ • Auth          │    │ • Bot Logic     │    │ • Group Mgmt    │
│ • Config        │    │ • Payments      │    │ • User Mgmt     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Supabase      │
                    │   (PostgreSQL)  │
                    │                 │
                    │ • Users         │
                    │ • Bots          │
                    │ • Sales         │
                    │ • Plans         │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PushInPay     │
                    │   (Payments)    │
                    │                 │
                    │ • Process Pay   │
                    │ • Webhooks      │
                    │ • Split Revenue │
                    └─────────────────┘
```

---

## 🛠 Tecnologias Utilizadas

### Frontend
- **Next.js 14**: Framework React para desenvolvimento web
- **TypeScript**: Linguagem tipada
- **Tailwind CSS**: Framework de estilização
- **Shadcn/UI**: Biblioteca de componentes
- **Zustand**: Gerenciamento de estado
- **React Hot Toast**: Notificações
- **Framer Motion**: Animações

### Backend  
- **FastAPI**: Framework web Python
- **Pydantic**: Validação de dados
- **Supabase Client**: Cliente Python para Supabase
- **Uvicorn**: Servidor ASGI
- **Python 3.11+**: Linguagem de programação

### Banco de Dados
- **Supabase**: PostgreSQL hospedado
- **Row Level Security**: Segurança de dados
- **Real-time**: Atualizações em tempo real

### Integração
- **Telegram Bot API**: Comunicação com Telegram
- **PushInPay API**: Processamento de pagamentos
- **Webhooks**: Comunicação entre serviços

---

## 📁 Estrutura do Projeto

```
blackinbot/
├── frontend/                   # Aplicação Next.js
│   ├── src/
│   │   ├── app/               # App Router (Next.js 14)
│   │   │   ├── api/           # API Routes
│   │   │   ├── dashboard/     # Dashboard pages
│   │   │   ├── login/         # Autenticação
│   │   │   └── layout.tsx     # Layout principal
│   │   ├── components/        # Componentes React
│   │   │   ├── ui/            # Componentes base
│   │   │   └── layout/        # Layout components
│   │   ├── lib/               # Utilitários
│   │   ├── store/             # Zustand stores
│   │   └── styles/            # Estilos CSS
│   ├── package.json
│   └── next.config.js
│
├── backend/                   # API FastAPI
│   ├── main.py               # Entry point
│   ├── routers/              # Endpoints organizados
│   │   ├── telegram.py       # Webhook Telegram
│   │   ├── pushinpay.py      # Webhook PushInPay
│   │   └── dashboard.py      # Dashboard API
│   ├── services/             # Lógica de negócio
│   │   ├── supabase_simple.py # Cliente Supabase
│   │   └── telegram.py       # Telegram Bot Logic
│   ├── models/               # Modelos de dados
│   │   └── schemas.py        # Pydantic schemas
│   ├── utils/                # Utilitários
│   │   └── config.py         # Configurações
│   └── requirements.txt
│
├── README.md                 # Esta documentação
└── .env.example             # Exemplo de variáveis
```

---

## ⚙️ Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key
SUPABASE_ANON_KEY=seu_anon_key

# JWT Secret (para autenticação)
JWT_SECRET=seu_jwt_secret_super_seguro_aqui

# PushInPay Configuration
PUSHINPAY_SECRET=seu_pushinpay_webhook_secret
PUSHINPAY_PLATFORM_TOKEN=token_da_plataforma_para_split

# Environment
ENVIRONMENT=development
NODE_ENV=development

# Frontend URLs
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key
```

### 2. Configuração do Supabase

#### Tabelas necessárias:

```sql
-- Usuários
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pushinpay_token TEXT
);

-- Bots
CREATE TABLE bots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bot_token TEXT NOT NULL,
    bot_username TEXT NOT NULL,
    name TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    welcome_text TEXT DEFAULT '',
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('photo', 'video')),
    vip_group_id TEXT,
    vip_type TEXT CHECK (vip_type IN ('group', 'channel')),
    vip_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planos
CREATE TABLE plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendas
CREATE TABLE sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    user_telegram_id TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'paid', 'cancelled', 'expired')) DEFAULT 'pending',
    amount_received DECIMAL(10,2),
    pushinpay_payment_id TEXT UNIQUE,
    access_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Row Level Security (RLS):

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own bots" ON bots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage plans of own bots" ON plans FOR ALL USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = plans.bot_id AND bots.user_id = auth.uid())
);
CREATE POLICY "Users can view sales of own bots" ON sales FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = sales.bot_id AND bots.user_id = auth.uid())
);
```

---

## 🚀 Instalação e Execução

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd blackinbot
```

### 2. Configure o Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# ou source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
```

### 3. Configure o Frontend

```bash
cd frontend
npm install
```

### 4. Execute em Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Acesse a Aplicação

- **Frontend**: http://localhost:3025
- **Backend API**: http://localhost:8000
- **Docs da API**: http://localhost:8000/docs

---

## 🎯 Funcionalidades Principais

### 1. Dashboard Web (`/dashboard`)

#### **Página Principal**
- Overview de bots, vendas e estatísticas
- Cards de ações rápidas
- Gráficos de performance

#### **Gerenciamento de Bots** (`/dashboard/bots`)
- Listagem de todos os bots
- Criação de novos bots
- Configuração individual
- Estatísticas por bot

#### **Criação de Bot** (`/dashboard/bots/create`)
- Validação de token PushInPay
- Validação de token do Telegram
- Auto-preenchimento de dados do bot

#### **Configuração de Planos** (`/dashboard/bots/plans`)
- Criação de planos de assinatura
- Definição de preços e duração
- Ativação/desativação

#### **Mensagem de Boas-vindas** (`/dashboard/bots/welcome`)
- Editor de mensagem personalizada
- Suporte a mídia (foto/vídeo)
- Preview em tempo real

#### **PushInPay** (`/dashboard/pushinpay`)
- Configuração de token de API
- Status da integração
- Tutorial de configuração

#### **Vendas** (`/dashboard/sales`)
- Histórico de todas as vendas
- Filtros por status e período
- Detalhes de pagamento

#### **Remarketing** (`/dashboard/remarketing`)
- Gestão de membros dos grupos
- Mensagens automáticas de renovação
- Remoção automática de membros expirados

### 2. Sistema de Bots Telegram

#### **Comandos Principais**
- `/start` - Inicia interação e mostra planos
- `/planos` - Lista planos disponíveis
- `/suporte` - Informações de contato

#### **Fluxo de Compra**
1. Usuário envia `/start`
2. Bot lista planos disponíveis
3. Usuário seleciona plano
4. Bot gera link de pagamento PushInPay
5. Usuário efetua pagamento
6. Webhook confirma pagamento
7. Bot adiciona usuário ao grupo VIP

#### **Gerenciamento de Grupos**
- Adição automática ao grupo VIP
- Verificação de status de pagamento
- Remoção automática quando expira

### 3. Sistema de Pagamentos

#### **Integração PushInPay**
- Split automático de pagamentos
- Comissão da plataforma: R$ 1,48 + 5%
- Webhooks para confirmação
- Suporte a PIX, cartão, boleto

#### **Fluxo de Pagamento**
1. Bot gera link com split configurado
2. Usuário efetua pagamento
3. PushInPay processa pagamento
4. Webhook notifica mudança de status
5. Sistema atualiza acesso do usuário

### 4. Sistema de Remarketing

#### **Automação**
- Aviso 1 dia antes do vencimento
- Cobrança no dia do vencimento
- Remoção automática após período configurado

#### **Mensagens Personalizáveis**
- Template para aviso de vencimento
- Template para cobrança
- Variáveis dinâmicas (`{days}`, `{plan_name}`)

---

## 📡 API e Webhooks

### Endpoints Principais

#### **Dashboard API** (Protegido por JWT)
```bash
# Autenticação
POST /dashboard/login
GET /dashboard/me

# Bots
GET /dashboard/bots
POST /dashboard/bots
GET /dashboard/bots/{bot_id}
PUT /dashboard/bots/{bot_id}

# Planos
GET /dashboard/bots/{bot_id}/plans
POST /dashboard/plans

# Vendas
GET /dashboard/sales
GET /dashboard/bots/{bot_id}/sales

# Configurações
POST /dashboard/message  # Boas-vindas
```

#### **Webhooks Públicos**
```bash
# Telegram
POST /telegram/webhook

# PushInPay
POST /pushinpay/webhook
GET /pushinpay/status/{payment_id}
```

### Webhook do Telegram

Recebe atualizações do Telegram:

```json
{
  "message": {
    "from": {
      "id": 123456789,
      "first_name": "João"
    },
    "chat": {
      "id": 123456789
    },
    "text": "/start"
  }
}
```

### Webhook do PushInPay

Recebe notificações de pagamento:

```json
{
  "payment_id": "pay_123456789_plan_1",
  "status": "paid",
  "amount": 29.90,
  "metadata": {
    "bot_id": "bot-uuid",
    "plan_id": "plan-uuid",
    "user_telegram_id": "123456789"
  }
}
```

---

## 🗄️ Banco de Dados

### Relacionamentos

```
users (1) ──────── (N) bots
                     │
                     ├─── (N) plans
                     └─── (N) sales ──── (1) plans
```

### Índices Importantes

```sql
CREATE INDEX idx_bots_user_id ON bots(user_id);
CREATE INDEX idx_plans_bot_id ON plans(bot_id);
CREATE INDEX idx_sales_bot_id ON sales(bot_id);
CREATE INDEX idx_sales_user_telegram_id ON sales(user_telegram_id);
CREATE INDEX idx_sales_pushinpay_payment_id ON sales(pushinpay_payment_id);
CREATE INDEX idx_sales_status ON sales(status);
```

### Triggers

```sql
-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bots_updated_at 
    BEFORE UPDATE ON bots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔐 Autenticação e Segurança

### Autenticação

#### **Frontend (Supabase Auth)**
- Login/registro com email e senha
- Sessões gerenciadas pelo Supabase
- Tokens JWT automáticos

#### **Backend (JWT)**
- Validação de tokens Supabase
- Middleware de autenticação
- Proteção de rotas sensíveis

### Segurança

#### **Validação de Webhooks**
- PushInPay: HMAC-SHA256 signature
- Telegram: Token secreto configurado

#### **Row Level Security**
- Usuários só acessam próprios dados
- Policies no Supabase
- Isolamento completo entre usuários

#### **Sanitização**
- Validação com Pydantic
- Escape de HTML/SQL
- Rate limiting em produção

---

## 🚀 Deploy e Produção

### Variáveis de Produção

```bash
ENVIRONMENT=production
SUPABASE_URL=https://prod.supabase.co
JWT_SECRET=chave-super-secreta-256-bits
PUSHINPAY_SECRET=webhook-secret-produção
```

### Deploy no Railway

1. **Configure o repositório no Railway**
2. **Defina as variáveis de ambiente**
3. **Configure o `railway.json`:**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
  }
}
```

### Configuração do Nginx (se necessário)

```nginx
server {
    listen 80;
    server_name seudominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Webhook URLs

Configure no Telegram e PushInPay:

```
Telegram: https://seudominio.com/telegram/webhook
PushInPay: https://seudominio.com/pushinpay/webhook
```

---

## 💻 Desenvolvimento

### Estrutura de Commits

```bash
# Features
feat: adiciona sistema de remarketing
feat(dashboard): nova página de estatísticas

# Fixes
fix: corrige validação de token
fix(bot): resolve erro no comando /start

# Docs
docs: atualiza README com instruções de deploy

# Refactor
refactor: reorganiza estrutura de pastas
```

### Code Style

#### **Frontend (ESLint + Prettier)**
```bash
npm run lint
npm run format
```

#### **Backend (Black + Flake8)**
```bash
black .
flake8 .
```

### Debugging

#### **Frontend**
- Chrome DevTools
- React Developer Tools
- Console logs com `console.log()`

#### **Backend**
- FastAPI auto-docs em `/docs`
- Logs com `logger.info()`
- Python debugger com `pdb`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### **1. Erro de CORS**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ]
  },
}
```

#### **2. Token do Bot Inválido**
- Verificar se o token foi copiado corretamente
- Confirmar que o bot foi criado pelo @BotFather
- Testar com `https://api.telegram.org/bot<TOKEN>/getMe`

#### **3. Webhook não Funciona**
- Verificar se a URL está acessível publicamente
- Usar ngrok para desenvolvimento: `ngrok http 8000`
- Conferir logs do servidor

#### **4. Pagamentos não Confirmam**
- Verificar configuração do webhook no PushInPay
- Confirmar PUSHINPAY_SECRET está correto
- Checar logs de validação de assinatura

#### **5. Usuário não é Adicionado ao Grupo**
- Verificar se o bot é admin do grupo
- Confirmar que vip_group_id está correto
- Verificar permissões do bot

### Logs Importantes

#### **Telegram Webhook**
```python
logger.info(f"Webhook recebido: {update.model_dump()}")
logger.info(f"Comando processado: {command}")
logger.error(f"Erro ao processar: {str(e)}")
```

#### **PushInPay Webhook**
```python
logger.info(f"Pagamento recebido: {webhook_data.payment_id}")
logger.info(f"Status atualizado para: {new_status}")
logger.error(f"Erro no webhook: {str(e)}")
```

---

## 📞 Suporte

Para dúvidas sobre o desenvolvimento:

1. **Documentação**: Leia este README completo
2. **Issues**: Abra uma issue no repositório
3. **Logs**: Sempre inclua logs relevantes
4. **Ambiente**: Especifique se é dev/prod

### Estrutura de Issue

```markdown
## Descrição
Descreva o problema ou feature request

## Ambiente
- OS: Windows/Linux/Mac
- Node: versão
- Python: versão
- Browser: Chrome/Firefox/Safari

## Passos para Reproduzir
1. Passo 1
2. Passo 2
3. Erro ocorre

## Logs Relevantes
```
logs aqui
```

## Comportamento Esperado
O que deveria acontecer
```

---

## 📄 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

---

**🚀 BlackinBot - Transformando Telegram em uma máquina de vendas!** 