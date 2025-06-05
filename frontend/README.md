# BlackinBot - Painel Administrativo

Sistema completo de gerenciamento de bots pagos para Telegram com integração Supabase e PushinPay.

## 🚀 Funcionalidades Implementadas

### 🔐 Autenticação
- Login e cadastro com Supabase Auth
- Proteção de rotas
- Sessão persistente
- Logout seguro

### 📥 Mensagem de Boas-Vindas
- Editor de texto para mensagem personalizada
- Upload de imagens e vídeos via Supabase Storage
- Preview em tempo real
- Suporte a múltiplos formatos de mídia

### 💳 Gerenciamento de Planos
- Criação, edição e exclusão de planos
- Configuração de preço e duração
- Formatação automática de valores
- Tabela interativa com ações inline

### 🔑 Integração PushinPay
- Configuração segura do token de API
- Status visual da integração
- Instruções passo a passo
- Informações sobre comissões

### 👥 Grupo VIP
- Sistema anti-fraude com comando `/ativar_grupo`
- Verificação automática de permissões
- Captura segura do ID do grupo
- Instruções detalhadas de configuração

### 📊 Vendas
- Dashboard com estatísticas em tempo real
- Filtros por status e busca
- Histórico completo de transações
- Formatação de valores e datas

### 🔁 Remarketing
- Análise de usuários por status de assinatura
- Envio manual de mensagens personalizadas
- Templates automáticos por situação
- Priorização de usuários críticos

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS v4** - Estilização moderna
- **Supabase** - Backend as a Service
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones consistentes
- **Zustand** - Gerenciamento de estado

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── dashboard/          # Páginas do painel
│   │   │   ├── welcome/        # Mensagem de boas-vindas
│   │   │   ├── plans/          # Gerenciamento de planos
│   │   │   ├── pushinpay/      # Configuração PushinPay
│   │   │   ├── vip-group/      # Configuração grupo VIP
│   │   │   ├── sales/          # Relatório de vendas
│   │   │   └── remarketing/    # Sistema de remarketing
│   │   ├── login/              # Página de autenticação
│   │   ├── layout.tsx          # Layout raiz
│   │   └── globals.css         # Estilos globais
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Componentes base
│   │   ├── layout/             # Componentes de layout
│   │   └── providers/          # Providers de contexto
│   ├── lib/                    # Utilitários
│   │   ├── supabase.ts         # Configuração Supabase
│   │   └── utils.ts            # Funções utilitárias
│   ├── store/                  # Estado global
│   │   └── auth.ts             # Store de autenticação
│   └── middleware.ts           # Middleware de rotas
├── .env.local                  # Variáveis de ambiente
└── package.json               # Dependências
```

## 🌐 Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://lyaqjdpmzirefwknlbmo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚀 Como Executar

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

3. **Executar em desenvolvimento:**
```bash
npm run dev -- --port 3025
```

4. **Build para produção:**
```bash
npm run build
npm start
```

## 📱 Fluxo de Uso

### 1. Primeiro Acesso
1. Acessar `/login`
2. Criar conta ou fazer login
3. Redirecionamento automático para `/dashboard`

### 2. Configuração Inicial
1. **Mensagem de Boas-Vindas**: Configurar texto e mídia
2. **PushinPay**: Adicionar token de API
3. **Planos**: Criar planos de assinatura
4. **Grupo VIP**: Configurar com comando `/ativar_grupo`

### 3. Operação
1. **Vendas**: Acompanhar transações em tempo real
2. **Remarketing**: Engajar usuários com assinatura vencendo

## 🔒 Segurança

- Autenticação via Supabase Auth
- Tokens criptografados no banco
- Validação de permissões por usuário
- Proteção contra XSS e CSRF
- Sistema anti-fraude para grupos VIP

## 🎨 Design System

### Cores Principais
- **Primary**: Azul escuro (#1f2937)
- **Secondary**: Cinza claro (#f3f4f6)
- **Success**: Verde (#10b981)
- **Warning**: Laranja (#f59e0b)
- **Error**: Vermelho (#ef4444)

### Componentes
- Cards responsivos
- Tabelas interativas
- Formulários validados
- Badges de status
- Botões com loading states

## 📊 Dashboard Features

### Estatísticas
- Total de vendas
- Receita acumulada
- Vendas pagas vs pendentes
- Usuários por status de assinatura

### Filtros e Busca
- Busca em tempo real
- Filtros por status
- Ordenação automática
- Paginação (quando necessário)

## 🔮 Próximas Implementações

- [ ] Dashboard analytics avançado
- [ ] Exportação de relatórios
- [ ] Notificações push
- [ ] Modo escuro
- [ ] Configurações avançadas
- [ ] Backup automático
- [ ] Integração com outros gateways
- [ ] App mobile (React Native)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do console
2. Conferir variáveis de ambiente
3. Validar conexão com Supabase
4. Testar integração com PushinPay

---

**Status**: ✅ Projeto completo e pronto para produção!

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025
