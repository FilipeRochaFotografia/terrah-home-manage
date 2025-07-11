-- Criar tabela de tarefas predefinidas (modelos)
CREATE TABLE IF NOT EXISTS tarefas_predefinidas (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  periodicidade VARCHAR(100) NOT NULL,
  tipo_manutencao VARCHAR(100) NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir tarefas predefinidas de exemplo
INSERT INTO tarefas_predefinidas (id, titulo, descricao, periodicidade, tipo_manutencao, observacao) VALUES
  ('limpeza-semanal', 'Limpeza Semanal', 'Limpeza completa do imóvel incluindo quartos, banheiros, cozinha e áreas comuns', 'Semanal', 'Limpeza', 'Verificar estoque de produtos de limpeza'),
  ('limpeza-mensal', 'Limpeza Mensal Profunda', 'Limpeza profunda com lavagem de cortinas, limpeza de janelas e organização de armários', 'Mensal', 'Limpeza', 'Agendar com antecedência para não interferir na rotina dos moradores'),
  ('jardinagem-semanal', 'Manutenção do Jardim', 'Poda de plantas, rega, remoção de folhas secas e verificação do sistema de irrigação', 'Semanal', 'Jardinagem', 'Atenção especial às plantas que precisam de cuidados específicos'),
  ('jardinagem-mensal', 'Jardinagem Mensal', 'Fertilização, poda de árvores maiores, controle de pragas e manutenção do sistema de irrigação', 'Mensal', 'Jardinagem', 'Usar produtos adequados para cada tipo de planta'),
  ('manutencao-predial', 'Manutenção Predial', 'Verificação de encanamentos, elétrica, portas, janelas e estrutura geral do imóvel', 'Mensal', 'Manutenção', 'Documentar qualquer problema encontrado'),
  ('vistoria-quinzenal', 'Vistoria Quinzenal', 'Vistoria geral do imóvel para identificar possíveis problemas ou necessidades de manutenção', 'Quinzenal', 'Vistoria', 'Fotografar áreas que precisam de atenção'),
  ('limpeza-caixa-dagua', 'Limpeza da Caixa d''Água', 'Limpeza e desinfecção da caixa d''água conforme normas sanitárias', 'Semestral', 'Manutenção', 'Agendar com empresa especializada'),
  ('manutencao-ar-condicionado', 'Manutenção do Ar Condicionado', 'Limpeza de filtros, verificação de funcionamento e manutenção preventiva dos aparelhos', 'Trimestral', 'Manutenção', 'Verificar se há vazamentos ou ruídos anormais'),
  ('limpeza-chamine', 'Limpeza da Chaminé', 'Limpeza e verificação da chaminé para garantir segurança e funcionamento adequado', 'Anual', 'Manutenção', 'Especialmente importante antes do inverno'),
  ('vistoria-anual', 'Vistoria Anual Completa', 'Vistoria completa do imóvel incluindo estrutura, instalações e documentação fotográfica', 'Anual', 'Vistoria', 'Gerar relatório detalhado com fotos'),
  ('manutencao-piscina', 'Manutenção da Piscina', 'Limpeza, verificação de pH, cloro e funcionamento dos equipamentos da piscina', 'Semanal', 'Manutenção', 'Manter registros dos níveis químicos'),
  ('limpeza-telhado', 'Limpeza do Telhado', 'Remoção de folhas, galhos e verificação de possíveis vazamentos no telhado', 'Semestral', 'Manutenção', 'Verificar calhas e rufos'),
  ('manutencao-elevador', 'Manutenção do Elevador', 'Verificação de funcionamento, limpeza e manutenção preventiva do elevador', 'Mensal', 'Manutenção', 'Solicitar relatório da empresa responsável'),
  ('vistoria-seguranca', 'Vistoria de Segurança', 'Verificação de fechaduras, alarmes, câmeras e sistemas de segurança', 'Mensal', 'Segurança', 'Testar funcionamento de todos os sistemas'),
  ('limpeza-area-externa', 'Limpeza da Área Externa', 'Limpeza de calçadas, garagem, área de lazer e espaços comuns externos', 'Semanal', 'Limpeza', 'Incluir varrição e remoção de lixo'); 