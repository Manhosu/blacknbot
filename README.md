# 🤖 BlackinBot

Sistema completo para monetização de grupos VIP no Telegram através de bots automatizados.

## ✨ Funcionalidades

- 🎯 **Painel de Controle Completo** - Dashboard moderno para gerenciar seus bots
- 💰 **Sistema de Pagamentos** - Integração com PushinPay para processar pagamentos
- 👥 **Grupos VIP Automáticos** - Adição/remoção automática de usuários nos grupos
- 📊 **Analytics e Relatórios** - Acompanhe vendas, usuários ativos e receita
- 🎨 **Interface Moderna** - Design responsivo e intuitivo
- 🔒 **Segurança** - Autenticação robusta com Supabase
- ⚡ **Performance** - Built com Next.js 15 e Supabase

## 🚀 Deploy

### Frontend (Vercel)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Manhosu/blacknbot)

### Backend (Railway/Heroku)
O backend FastAPI pode ser deployed em qualquer plataforma que suporte Python.

## 🛠️ Tecnologias

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Database e autenticação
- **React Hot Toast** - Notificações

### Backend
- **FastAPI** - API REST
- **Python 3.11+** - Linguagem
- **Supabase** - Database PostgreSQL
- **Telegram Bot API** - Integração com Telegram
- **JWT** - Autenticação

## 📦 Estrutura do Projeto

```
blackinbot/
├── frontend/          # Aplicação Next.js
│   ├── src/
│   │   ├── app/      # App Router (Next.js 15)
│   │   │   └── lib/      # Utilitários e configurações
├── backend/          # API FastAPI
│   ├── routers/      # Endpoints da API
│   ├── services/     # Lógica de negócio
│   ├── models/       # Schemas e modelos
│   └── utils/        # Utilitários
└── docs/            # Documentação
```

## 🔧 Configuração Local

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Variáveis de Ambiente

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
```

## 📋 Funcionalidades Principais

### 🤖 Gerenciamento de Bots
- Criação e configuração de bots
- Ativação de grupos VIP
- Mensagens de boas-vindas personalizadas
- Status e estatísticas em tempo real

### 💳 Sistema de Vendas
- Criação de planos de assinatura
- Processamento automático de pagamentos
- Controle de acesso aos grupos
- Relatórios de vendas detalhados

### 👥 Automação de Grupos
- Adição automática de compradores
- Remoção automática quando expira
- Validação de permissões
- Mensagens de confirmação

## 🎯 Como Usar

1. **Crie seu Bot**: Use @BotFather no Telegram
2. **Configure no Painel**: Adicione token e configure
3. **Ative Grupo VIP**: Integre com seu grupo
4. **Crie Planos**: Defina preços e durações
5. **Compartilhe**: Divulgue e comece a vender!

## 🤝 Contribuição

Contribuições são bem-vindas! Veja as [issues](https://github.com/Manhosu/blacknbot/issues) para ideias de melhorias.

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- 📧 Email: suporte@blackinbot.com
- 💬 Telegram: [@BlackinBotSupport](https://t.me/BlackinBotSupport)
- 🐛 Issues: [GitHub Issues](https://github.com/Manhosu/blacknbot/issues)

---

**Desenvolvido com ❤️ para a comunidade Telegram** 