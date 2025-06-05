-- Migração para adicionar campos necessários na tabela bots
-- Execute no Supabase SQL Editor se os campos não existirem

-- Adicionar campo 'name' se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bots' AND column_name = 'name') THEN
        ALTER TABLE bots ADD COLUMN name TEXT;
    END IF;
END $$;

-- Adicionar campo 'description' se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bots' AND column_name = 'description') THEN
        ALTER TABLE bots ADD COLUMN description TEXT;
    END IF;
END $$;

-- Adicionar campo 'is_active' se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bots' AND column_name = 'is_active') THEN
        ALTER TABLE bots ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Comentários para documentar os campos
COMMENT ON COLUMN bots.name IS 'Nome interno do bot para identificação do usuário';
COMMENT ON COLUMN bots.description IS 'Descrição do propósito ou função do bot';
COMMENT ON COLUMN bots.is_active IS 'Status de ativação do bot (true = ativo, false = inativo)';

-- Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bots' 
ORDER BY ordinal_position; 