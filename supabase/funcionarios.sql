-- Criar tabela de funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir alguns funcionários de exemplo
INSERT INTO funcionarios (nome, email, telefone, cargo) VALUES
  ('João Silva', 'joao.silva@terrahhomes.com', '(11) 99999-1111', 'Auxiliar de Limpeza'),
  ('Maria Santos', 'maria.santos@terrahhomes.com', '(11) 99999-2222', 'Jardineiro'),
  ('Pedro Costa', 'pedro.costa@terrahhomes.com', '(11) 99999-3333', 'Técnico de Manutenção'),
  ('Ana Oliveira', 'ana.oliveira@terrahhomes.com', '(11) 99999-4444', 'Auxiliar Administrativo'),
  ('Carlos Ferreira', 'carlos.ferreira@terrahhomes.com', '(11) 99999-5555', 'Técnico de Segurança');

-- Adicionar coluna responsavel_id na tabela tarefas
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES funcionarios(id);
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS agendamento_data DATE;
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS anotacoes TEXT;
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS tarefa_predefinida_id VARCHAR(50);
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS aguardando_aprovacao_exclusao BOOLEAN DEFAULT false; 