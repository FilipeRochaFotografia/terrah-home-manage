# Configuração da Tabela de Notificações no Supabase

## Problema
A aplicação está tentando acessar a tabela `notificacoes` que não existe no banco de dados, causando erros 404.

## Solução

### 1. Acessar o Dashboard do Supabase
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Acesse o projeto Terrah Homes

### 2. Executar a Migração SQL
1. No dashboard, vá para **SQL Editor**
2. Clique em **New Query**
3. Cole o seguinte SQL:

```sql
-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    task_id UUID REFERENCES public.tarefas(id) ON DELETE SET NULL,
    enviada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'enviada',
    fcm_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_enviada_em ON public.notificacoes(enviada_em);
CREATE INDEX IF NOT EXISTS idx_notificacoes_status ON public.notificacoes(status);

-- Habilitar RLS para a tabela notificacoes
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Enable read access for authenticated users" ON public.notificacoes 
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.notificacoes 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.notificacoes 
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.notificacoes 
    FOR DELETE USING (auth.role() = 'authenticated');

-- Adicionar coluna fcm_token na tabela funcionarios se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'funcionarios' AND column_name = 'fcm_token') THEN
        ALTER TABLE public.funcionarios ADD COLUMN fcm_token TEXT;
    END IF;
END $$;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_notificacoes_updated_at 
    BEFORE UPDATE ON public.notificacoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Clique em **Run** para executar

### 3. Verificar se a Tabela foi Criada
1. Vá para **Table Editor**
2. Verifique se a tabela `notificacoes` aparece na lista
3. Verifique se a coluna `fcm_token` foi adicionada à tabela `funcionarios`

### 4. Testar a Aplicação
Após executar a migração, a aplicação deve funcionar sem erros de notificações.

## Status dos Erros Corrigidos

✅ **Tabela de Notificações**: Configurada para não falhar se a tabela não existir
✅ **Favicon**: Adicionada referência no index.html
✅ **Tarefas "Conforme Necessidade"**: Funcionando corretamente
✅ **Hook de Notificações**: Atualizado para usar a estrutura correta da tabela

## Próximos Passos
1. Execute a migração SQL no Supabase
2. Teste a aplicação
3. As notificações começarão a funcionar automaticamente 