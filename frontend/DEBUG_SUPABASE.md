# 🔍 Debug - Problemas com Criação de Bot

## 🚨 Erro Atual
```
Failed to load resource: the server responded with a status of 400 ()
Erro ao criar bot: intercept-console-error.ts:40 Object
```

## 🔧 Possíveis Causas

### 1. Campos Faltando na Tabela `bots`
A tabela pode não ter os campos necessários. Execute no Supabase SQL Editor:

```sql
-- Verificar estrutura da tabela bots
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bots' 
ORDER BY ordinal_position;
```

### 2. RLS (Row Level Security) Mal Configurado
Verifique se as políticas RLS estão corretas:

```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'bots';

-- Desabilitar temporariamente RLS (APENAS PARA DEBUG)
ALTER TABLE bots DISABLE ROW LEVEL SECURITY;
```

### 3. Campo `user_id` com Problema
O campo user_id pode estar nulo ou com tipo incorreto:

```sql
-- Verificar se o user_id está sendo passado corretamente
SELECT auth.uid(); -- Deve retornar o ID do usuário logado
```

## 🛠️ Soluções

### Solução 1: Migração Completa
Execute no Supabase SQL Editor:

```sql
-- Criar tabela bots se não existir ou recriar
DROP TABLE IF EXISTS bots CASCADE;

CREATE TABLE bots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    bot_token TEXT NOT NULL UNIQUE,
    bot_username TEXT NOT NULL,
    name TEXT,
    description TEXT,
    welcome_text TEXT DEFAULT '',
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('photo', 'video')),
    vip_group_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;

-- Política para inserção
CREATE POLICY "Users can insert their own bots" ON bots
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para seleção
CREATE POLICY "Users can view their own bots" ON bots
    FOR SELECT USING (auth.uid() = user_id);

-- Política para atualização
CREATE POLICY "Users can update their own bots" ON bots
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para deleção
CREATE POLICY "Users can delete their own bots" ON bots
    FOR DELETE USING (auth.uid() = user_id);
```

### Solução 2: Inserção Simplificada
Use apenas campos obrigatórios:

```typescript
const botData = {
  user_id: user?.id,
  bot_token: botToken,
  bot_username: botValidation.botInfo.username
}
```

### Solução 3: Debug Detalhado
No console do navegador, verifique:

```javascript
// 1. Verificar se o usuário está logado
console.log('User:', user)

// 2. Verificar dados do bot
console.log('Bot data:', botData)

// 3. Verificar se consegue acessar a tabela
const { data, error } = await supabase.from('bots').select('*').limit(1)
console.log('Table access:', { data, error })
```

## 📋 Checklist de Verificação

- [ ] Usuário está logado (`user.id` não é null)
- [ ] Tabela `bots` existe
- [ ] Campos obrigatórios estão presentes
- [ ] RLS está configurado corretamente
- [ ] Token do bot é válido
- [ ] Não há conflito de `bot_token` único

## 🎯 Teste Rápido

1. **Verificar se consegue fazer SELECT**:
   ```sql
   SELECT * FROM bots LIMIT 1;
   ```

2. **Inserir manualmente**:
   ```sql
   INSERT INTO bots (user_id, bot_token, bot_username) 
   VALUES (auth.uid(), 'test_token', 'test_username');
   ```

3. **Verificar erro específico no Network tab** do navegador

## 💡 Dicas

- Abra as **Developer Tools** (F12)
- Vá para a aba **Network**
- Tente criar o bot novamente
- Clique na requisição que falhou
- Veja a resposta exata do servidor