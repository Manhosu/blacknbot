# BlackinBot API

Sistema comercial de bots pagos para Telegram com integração ao Supabase e PushinPay.

## 🚀 Funcionalidades

- **Gerenciamento de Bots**: Criação e edição de bots do Telegram
- **Webhooks Telegram**: Processamento de mensagens e comandos
- **Webhooks PushinPay**: Processamento de pagamentos
- **Dashboard API**: Endpoints protegidos por JWT para gerenciamento
- **Autenticação**: Sistema de login com JWT
- **Storage**: Upload de mídias para mensagens de boas-vindas

## 📁 Estrutura do Projeto

```
backend/
├── main.py                 # Arquivo principal do FastAPI
├── requirements.txt        # Dependências Python
├── .env                   # Variáveis de ambiente (desenvolvimento)
├── .env.example           # Exemplo de variáveis de ambiente
├── railway.json           # Configuração para deploy no Railway
├── routers/              # Rotas da API
│   ├── telegram.py       # Webhooks do Telegram
│   ├── pushinpay.py      # Webhooks do PushinPay
│   └── dashboard.py      # Endpoints do dashboard
├── services/             # Serviços de integração
│   ├── supabase.py       # Cliente Supabase
│   └── telegram.py       # Cliente Telegram Bot API
├── models/               # Modelos Pydantic
│   └── schemas.py        # Schemas de dados
└── utils/                # Utilitários
    ├── auth.py           # Autenticação JWT
    └── config.py         # Configurações
```

## 🛠️ Instalação

1. **Clone o repositório e entre na pasta backend**:
```bash
cd backend
```

2. **Instale as dependências**:
```bash
pip install -r requirements.txt
```

3. **Configure as variáveis de ambiente**:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute o servidor**:
```bash
python main.py
```

O servidor estará disponível em `http://localhost:3025`

## 🔧 Configuração

### Variáveis de Ambiente

- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave service role do Supabase
- `JWT_SECRET`: Chave secreta para tokens JWT
- `TELEGRAM_BOT_TOKEN`: Token do bot do Telegram (opcional para testes)
- `PUSHINPAY_SECRET`: Chave secreta dos webhooks PushinPay
- `ENVIRONMENT`: Ambiente (development/production)

## 📚 API Endpoints

### Webhooks
- `POST /telegram/webhook` - Receber atualizações do Telegram
- `POST /pushinpay/webhook` - Receber notificações de pagamento
- `GET /pushinpay/status/{payment_id}` - Consultar status de pagamento

### Dashboard (Protegido por JWT)
- `POST /dashboard/login` - Login do usuário
- `GET /dashboard/me` - Dados do usuário atual
- `GET /dashboard/bots` - Listar bots do usuário
- `POST /dashboard/bots` - Criar novo bot
- `GET /dashboard/bots/{bot_id}` - Obter bot específico
- `PUT /dashboard/bots/{bot_id}` - Atualizar bot
- `POST /dashboard/message` - Atualizar mensagem de boas-vindas
- `POST /dashboard/plans` - Criar plano
- `GET /dashboard/bots/{bot_id}/plans` - Listar planos do bot
- `GET /dashboard/sales` - Listar vendas
- `GET /dashboard/bots/{bot_id}/sales` - Vendas do bot específico

### Saúde
- `GET /` - Informações da API
- `GET /health` - Verificação de saúde

## 🔒 Autenticação

Para endpoints protegidos, inclua o header de autorização:

```
Authorization: Bearer <seu_jwt_token>
```

Obtenha o token fazendo login em `/dashboard/login`.

## 🚀 Deploy no Railway

1. **Conecte seu repositório ao Railway**
2. **Configure as variáveis de ambiente no painel do Railway**
3. **O deploy será automático** (usando o arquivo `railway.json`)

## 📖 Documentação da API

Acesse `/docs` (apenas em desenvolvimento) para ver a documentação interativa do Swagger.

## 🔍 Logs

O sistema usa logging estruturado. Em produção, os logs são enviados para stdout.

## 🤝 Integração com Supabase

O sistema utiliza o Supabase para:
- Autenticação de usuários
- Armazenamento de dados (bots, planos, vendas)
- Storage para mídias
- RLS (Row Level Security) para segurança

## 💳 Integração com PushinPay

Webhooks são verificados usando HMAC-SHA256 para garantir autenticidade.

## 📱 Integração com Telegram

Suporte completo para:
- Mensagens de texto
- Fotos e vídeos
- Teclados inline
- Callback queries
- Comandos personalizados

---

**Desenvolvido para o sistema BlackinBot** 🤖 