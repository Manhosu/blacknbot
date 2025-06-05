# 🤖 Teste da Funcionalidade de Criação de Bots

## 📋 Pré-requisitos

1. **Servidor rodando na porta 3025**
   ```bash
   npm run dev
   ```

2. **Usuário logado no sistema**
   - Acesse: http://localhost:3025
   - Faça login ou cadastre-se

## 🧪 Como Testar

### 1. Acessar a página de criação
- Vá para: http://localhost:3025/dashboard/bots
- Clique em "Criar Novo Bot"
- Ou acesse diretamente: http://localhost:3025/dashboard/bots/create

### 2. Validação do PushinPay
- ✅ **Para desenvolvimento**: A validação está temporariamente desabilitada
- ⚠️ **Para produção**: Será necessário ter um token PushinPay válido

### 3. Obter um token de bot de teste
Para testar, você pode usar um bot real do Telegram:

1. Abra o Telegram
2. Procure por `@BotFather`
3. Digite `/newbot`
4. Siga as instruções para criar um bot
5. Copie o token fornecido

**Exemplo de token:**
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 4. Preencher o formulário
- **Token do Bot**: Cole o token obtido do @BotFather
- **Nome do Bot**: Nome para identificação interna (opcional)
- **Descrição**: Descrição do propósito do bot (opcional)

### 5. Validação automática
- O sistema validará o token via API do Telegram
- Se válido, mostrará informações do bot (nome, username, ID)
- Se inválido, mostrará mensagem de erro

### 6. Criar o bot
- Clique em "Criar Bot"
- O sistema salvará no Supabase
- Redirecionará para a página individual do bot

## 🔍 Validações Implementadas

### ✅ Validação PushinPay
- Verifica se o usuário tem token PushinPay válido
- Bloqueia criação se token inválido (em produção)
- Mostra mensagem de erro com link para configuração

### ✅ Validação Token Telegram
- Faz requisição para `https://api.telegram.org/bot<TOKEN>/getMe`
- Verifica se resposta é válida (status 200 e ok: true)
- Extrai informações do bot (nome, username, ID)
- Auto-preenche nome se não informado

### ✅ Validação de Formulário
- Token é obrigatório
- Nome e descrição são opcionais
- Botão desabilitado até token ser válido

## 🎯 Fluxo Completo

1. **Usuário acessa página** → Verifica PushinPay
2. **PushinPay válido** → Mostra formulário
3. **Usuário digita token** → Valida via Telegram API
4. **Token válido** → Habilita botão de criação
5. **Usuário clica criar** → Salva no Supabase
6. **Bot criado** → Redireciona para configuração

## 🚨 Possíveis Erros

### Token PushinPay inválido
```
⚠️ Para criar um bot, primeiro você precisa cadastrar e validar sua chave do PushinPay.
```
**Solução**: Ir para /dashboard/pushinpay e configurar token

### Token Telegram inválido
```
❌ O token informado não é válido. Verifique se você copiou corretamente do @BotFather.
```
**Solução**: Verificar se token foi copiado corretamente

### Erro de conexão
```
Erro ao validar token do bot. Verifique sua conexão.
```
**Solução**: Verificar conexão com internet

## 📊 Dados Salvos no Supabase

Quando um bot é criado, os seguintes dados são salvos na tabela `bots`:

```json
{
  "user_id": "uuid-do-usuario",
  "bot_token": "token-do-telegram",
  "bot_username": "username-do-bot",
  "name": "Nome interno do bot",
  "description": "Descrição do bot",
  "is_active": true,
  "welcome_text": "",
  "media_url": null,
  "media_type": null,
  "vip_group_id": null
}
```

## 🔧 Configuração para Produção

Para usar em produção, ajustar:

1. **API PushinPay**: Descomentar validação real em `/api/validate-pushinpay/route.ts`
2. **Validação obrigatória**: Remover bypass temporário na validação PushinPay
3. **Variáveis de ambiente**: Configurar PUSHINPAY_API_URL e outras necessárias

## ✨ Próximos Passos

Após criar o bot, o usuário pode:
- Configurar mensagem de boas-vindas
- Criar planos de pagamento
- Ativar grupo VIP
- Visualizar vendas e relatórios 