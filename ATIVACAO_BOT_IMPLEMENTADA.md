# Sistema de Ativação de Bots com Grupo VIP

## Visão Geral

Foi implementado o sistema de ativação de bots que permite aos usuários cadastrar o grupo VIP onde o bot já é administrador. O sistema valida automaticamente as permissões e salva o `vip_group_id` no banco de dados.

## Funcionalidades Implementadas

### 1. Endpoint de Ativação
- **Rota:** `POST /api/bots/{bot_id}/activate`
- **Autenticação:** JWT Token obrigatório
- **Função:** Ativar bot com grupo VIP

### 2. Extração de Group ID
A função `extract_group_id_from_link()` suporta múltiplos formatos:

```python
# Formatos suportados:
- https://t.me/joinchat/AAAA...      # Links de convite privados
- https://t.me/+AAAA...             # Links de convite novos  
- https://t.me/grupo_publico        # Grupos públicos
- @grupo_publico                    # Username direto
- -1001234567890                    # Chat ID direto
```

### 3. Validações Automáticas

#### ✅ Verificação de Acesso
- Testa se o bot tem acesso ao grupo via API do Telegram
- Retorna erro se grupo não existir ou bot não tiver acesso

#### ✅ Verificação de Permissões
- Obtém lista de administradores do grupo
- Valida se o bot está na lista de administradores
- Retorna erro se bot não for admin

#### ✅ Informações do Grupo
- Retorna dados do grupo (título, tipo, número de membros)
- Confirma que o grupo foi configurado corretamente

## Schemas Adicionados

### BotActivationRequest
```python
class BotActivationRequest(BaseModel):
    vip_group_link: str  # Link ou ID do grupo VIP
```

### BotUpdate (atualizado)
```python
class BotUpdate(BaseModel):
    # ... campos existentes
    vip_group_id: Optional[str] = None  # Novo campo
```

## Métodos do Telegram Service Adicionados

### get_chat()
```python
async def get_chat(self, chat_id: str) -> Dict[str, Any]:
    """Obter informações do chat/grupo"""
```

### get_chat_administrators()
```python
async def get_chat_administrators(self, chat_id: str) -> Dict[str, Any]:
    """Obter administradores do chat/grupo"""
```

### get_me()
```python
async def get_me(self) -> Dict[str, Any]:
    """Obter informações do bot"""
```

## Exemplo de Uso

### Request
```bash
POST /api/bots/5cd8d05c-0387-4d63-8560-7585b2767278/activate
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "vip_group_link": "https://t.me/meu_grupo_vip"
}
```

### Response de Sucesso
```json
{
    "message": "Ativação do bot feita com sucesso",
    "bot": {
        "id": "5cd8d05c-0387-4d63-8560-7585b2767278",
        "bot_username": "meu_bot",
        "vip_group_id": "@meu_grupo_vip",
        // ... outros campos do bot
    },
    "group_info": {
        "title": "Meu Grupo VIP",
        "type": "supergroup",
        "member_count": 150
    }
}
```

### Responses de Erro

#### Bot não encontrado
```json
{
    "detail": "Bot não encontrado"
}
```

#### Bot sem acesso ao grupo
```json
{
    "detail": "Bot não tem acesso ao grupo ou grupo não encontrado"
}
```

#### Bot não é administrador
```json
{
    "detail": "Bot não é administrador do grupo. Adicione o bot como administrador com permissões para convidar usuários."
}
```

## Fluxo de Ativação

1. **Usuário prepara o grupo:**
   - Cria ou acessa grupo VIP
   - Adiciona o bot como administrador
   - Concede permissões para convidar usuários

2. **Usuário faz a ativação:**
   - Copia link/ID do grupo
   - Chama endpoint de ativação via dashboard
   - Aguarda validação automática

3. **Sistema valida:**
   - Extrai group_id do link fornecido
   - Testa acesso do bot ao grupo
   - Verifica se bot é administrador
   - Salva vip_group_id no banco

4. **Confirmação:**
   - Retorna mensagem de sucesso
   - Mostra informações do grupo
   - Bot fica pronto para adicionar usuários pagantes

## Integração com Sistema Existente

- **Webhook PushinPay:** Já está preparado para usar o `vip_group_id` ao processar pagamentos
- **Adição de usuários:** Sistema automaticamente adiciona usuários que pagam ao grupo VIP
- **Gestão de acesso:** Usuários são removidos quando acesso expira

## Testes

Para testar o sistema:

1. Criar um bot de teste no Telegram
2. Criar um grupo e adicionar o bot como admin
3. Usar o endpoint de ativação
4. Verificar se `vip_group_id` foi salvo corretamente

## Status

✅ **IMPLEMENTADO E TESTADO**
- Endpoint de ativação funcionando
- Validações automáticas implementadas
- Integração com sistema de pagamentos pronta
- Documentação completa 