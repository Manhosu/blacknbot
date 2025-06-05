# 🧪 Teste Prático - Ativação de Bot

## Pré-requisitos

1. **Servidor rodando:** `uvicorn backend.main:app --host 127.0.0.1 --port 3025 --reload`
2. **Bot de teste criado no banco:** ID `5cd8d05c-0387-4d63-8560-7585b2767278`
3. **Usuário de teste:** `teste@exemplo.com`

## Cenários de Teste

### ✅ Teste 1: Link de Grupo Público
```bash
POST http://127.0.0.1:3025/api/bots/5cd8d05c-0387-4d63-8560-7585b2767278/activate
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
    "vip_group_link": "https://t.me/meu_grupo_publico"
}
```

**Resultado esperado:** Group ID extraído como `@meu_grupo_publico`

### ✅ Teste 2: Username Direto
```bash
POST http://127.0.0.1:3025/api/bots/5cd8d05c-0387-4d63-8560-7585b2767278/activate
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
    "vip_group_link": "@grupo_vip_teste"
}
```

**Resultado esperado:** Group ID mantido como `@grupo_vip_teste`

### ✅ Teste 3: Chat ID Numérico
```bash
POST http://127.0.0.1:3025/api/bots/5cd8d05c-0387-4d63-8560-7585b2767278/activate
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
    "vip_group_link": "-1001234567890"
}
```

**Resultado esperado:** Group ID mantido como `-1001234567890`

### ✅ Teste 4: Link de Convite Privado
```bash
POST http://127.0.0.1:3025/api/bots/5cd8d05c-0387-4d63-8560-7585b2767278/activate
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
    "vip_group_link": "https://t.me/joinchat/AAABBBcccDDDeeeFFF"
}
```

**Resultado esperado:** Link completo mantido

### ✅ Teste 5: Link Novo Formato
```bash
POST http://127.0.0.1:3025/api/bots/5cd8d05c-0387-4d63-8560-7585b2767278/activate
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
    "vip_group_link": "https://t.me/+AAABBBcccDDDeeeFFF"
}
```

**Resultado esperado:** Link completo mantido

## Respostas Esperadas

### ✅ Sucesso (Bot é Admin)
```json
{
    "message": "Ativação do bot feita com sucesso",
    "bot": {
        "id": "5cd8d05c-0387-4d63-8560-7585b2767278",
        "bot_username": "teste_bot",
        "vip_group_id": "@grupo_vip_teste",
        "bot_token": "7123456789:AAEtest_token_for_activation_test_only",
        "welcome_text": "Bem-vindo ao bot de teste!"
    },
    "group_info": {
        "title": "Grupo VIP Teste",
        "type": "supergroup",
        "member_count": 25
    }
}
```

### ❌ Erro: Bot Não Encontrado
```json
{
    "detail": "Bot não encontrado"
}
```

### ❌ Erro: Bot Sem Acesso ao Grupo
```json
{
    "detail": "Bot não tem acesso ao grupo ou grupo não encontrado"
}
```

### ❌ Erro: Bot Não é Admin
```json
{
    "detail": "Bot não é administrador do grupo. Adicione o bot como administrador com permissões para convidar usuários."
}
```

### ❌ Erro: Token JWT Inválido
```json
{
    "detail": "Could not validate credentials"
}
```

## Verificação no Banco

Após ativação bem-sucedida, verificar se o `vip_group_id` foi salvo:

```sql
SELECT id, bot_username, vip_group_id 
FROM bots 
WHERE id = '5cd8d05c-0387-4d63-8560-7585b2767278';
```

**Resultado esperado:**
```
id                                   | bot_username | vip_group_id
5cd8d05c-0387-4d63-8560-7585b2767278 | teste_bot    | @grupo_vip_teste
```

## Fluxo de Validação

1. **Extração do Group ID:** ✅ Função `extract_group_id_from_link()`
2. **Teste de Acesso:** ✅ `telegram_service.get_chat(group_id)`
3. **Verificação de Admin:** ✅ `telegram_service.get_chat_administrators()`
4. **Obter Info do Bot:** ✅ `telegram_service.get_me()`
5. **Comparar Usernames:** ✅ Verificar se bot está na lista de admins
6. **Salvar no Banco:** ✅ `supabase_service.update_bot()`

## Logs Esperados

```
INFO: Ativando bot 5cd8d05c-0387-4d63-8560-7585b2767278 com grupo @grupo_vip_teste
INFO: Bot tem acesso ao grupo: Grupo VIP Teste
INFO: Bot é administrador do grupo
INFO: vip_group_id salvo com sucesso: @grupo_vip_teste
```

## Integração com Sistema de Pagamentos

Após ativação, o sistema de pagamentos já pode usar o `vip_group_id`:

1. **Webhook PushinPay recebe pagamento confirmado**
2. **Sistema busca bot e obtém vip_group_id**
3. **Usuário é automaticamente adicionado ao grupo VIP**
4. **Notificação de sucesso enviada**

## Status

✅ **ENDPOINT IMPLEMENTADO E TESTADO**
- Validações automáticas funcionando
- Extração de group_id para todos os formatos
- Integração completa com sistema existente
- Pronto para uso em produção 