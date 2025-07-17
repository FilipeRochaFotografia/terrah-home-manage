# DECISOES TÉCNICAS – Terrah Homes | Tarefas Programadas

## Última Atualização - 18/07/2025

### **Decisão: Refinamento da Interface e Experiência do Usuário (Julho 2025)**
- **Contexto**: Após estabilização do app, foi realizada uma rodada de refinamento da UI/UX para melhorar a clareza e consistência.
- **Problema**: Informações redundantes e inconsistências visuais estavam poluindo a interface.
- **Soluções Implementadas**:
  - **Unificação do Card de Relatórios**: Substituição de quatro cards individuais por um único card informativo no Dashboard, simplificando a UI e direcionando o usuário para a aba de Relatórios com um único clique.
  - **Remoção de Redundância Visual**: Eliminação de badges de período ("Hoje") e contadores de tarefas que já estavam implícitos no contexto, resultando em uma interface mais limpa.
  - **Melhora de Contraste e Hierarquia**: Ajuste na sombra e no gradiente de fundo da tela de Login para destacar o formulário e melhorar a legibilidade.
  - **Consistência Visual no PWA**: Correção da `theme-color` no `index.html` para branco (`#FFFFFF`), garantindo que a cor de fundo no "overscroll" em dispositivos móveis seja consistente com o resto da aplicação.
- **Motivação**: Aumentar a usabilidade, reduzir a carga cognitiva do usuário e garantir uma identidade visual coesa e profissional em toda a plataforma.


### **Decisão: Sistema de Relatórios Funcionais (IMPLEMENTADO ✅)**
- Modais de relatório transformados de estáticos para dinâmicos
- Filtros por urgência: Normal, Moderado, Atenção, Urgentes
- Interface `TarefaDetalhada` criada para uso abrangente
- Função `handleOpenReportModal` async para buscar dados do Supabase
- Renderização completa com nomes de propriedades, responsáveis e datas

### **Decisão: Row Level Security (RLS) Implementado (CONCLUÍDO ✅)**
- Políticas RLS criadas para todas as tabelas: imoveis, funcionarios, tarefas_predefinidas, task_photos, tarefas
- Migração SQL executada via Supabase SQL Editor
- Segurança completa implementada conforme Supabase Security Advisor

### **Decisão: Sistema de Notificações Push (EM CORREÇÃO ⚠️)**
- **Problema identificado**: Hardcoded Firebase credentials no código
- **Solução implementada**: Google Auth library com Supabase secrets
- **Status atual**: Edge Function criada mas com conflitos de deployment
- **Decisão técnica**: Aguardar resolução de dependências ou implementar alternativa

### **Motivação das Decisões Recentes**
- **Segurança**: RLS essencial para ambiente de produção
- **Funcionalidade**: Relatórios críticos para gestão operacional
- **Manutenibilidade**: Remoção de credentials hardcoded
- **User Experience**: Sistema 95% funcional para uso imediato

## Atualização Recente
- Dependências principais instaladas: React, Supabase, TailwindCSS, etc.
- Backend definido: Supabase (Auth, Database, Storage, Functions)
- UI/UX melhorada: Animações, hover effects, gradientes, design moderno mobile-first
- Projeto funcionando: http://localhost:8080/ (porta 8080 devido a conflito na 5173)
- Header personalizado com nova logo (logo.png) e ajustes visuais finais

## Melhorias de UI/UX Implementadas
- Header com gradiente sutil e animações
- BottomNav com indicadores visuais e transições suaves
- Dashboard com cards interativos e animações de entrada
- TaskCard com design moderno e hover effects elegantes
- PropertyList com layout aprimorado e feedback visual
- TaskList com melhor espaçamento e animações
- Consistência visual com branding Terrah Homes

## Decisão: Integração dinâmica de tarefas predefinidas (modelos)
- A tabela `tarefas_predefinidas` foi criada no Supabase com os campos: id (string), titulo, descricao, periodicidade, observacao.
- Todos os modelos de tarefas agora são cadastrados e gerenciados diretamente no banco, facilitando manutenção e escalabilidade.
- O frontend busca os modelos dinamicamente do Supabase, eliminando arquivos locais e tornando o cadastro de tarefas centralizado e dinâmico.
- O modal de nova tarefa foi simplificado: exibe apenas a periodicidade, sem duplicidade de nome/descrição, melhorando a experiência do usuário.

## Motivações
- Simplicidade de manutenção
- Baixo custo operacional
- Facilidade de integração e escalabilidade
- Experiência do usuário mobile-first
- Design moderno e profissional

## Revisão
- Este documento deve ser atualizado a cada nova decisão relevante 

---

## Atualização 12/07 – Decisões e Direcionamento
- Priorização de melhorias em UX/UI nas áreas de propriedades e funcionários
- Implementação de filtros avançados (por imóvel/propriedade)
- Finalização do upload de fotos por tarefa
- Integração de notificações push reais
- Desenvolvimento de painel de relatórios/exportação
- Suporte a sincronização offline
- Foco em acessibilidade, onboarding e histórico de alterações
Essas decisões reforçam o compromisso com usabilidade, escalabilidade e experiência mobile-first. 

---

## Decisão: Sistema Especializado para Tarefas de Veículos (Janeiro 2025)
- **Problema identificado**: Tarefas relacionadas a veículos possuem características específicas que diferem das tarefas imobiliárias
- **Solução implementada**: Sistema de detecção automática e tratamento especializado
- **Funcionalidades**:
  - Detecção automática baseada em palavras-chave (veículo, automóvel, carro, moto)
  - Seleção obrigatória de tipo de veículo (Carro/Moto)
  - Remoção do campo "Selecionar Imóvel" para tarefas de veículos
  - Periodicidade "Conforme necessidade" para abastecimento, manutenção e lavagem
  - Adição automática do tipo de veículo ao título da tarefa

## Decisão: Sistema Completo de Upload e Visualização de Fotos (Janeiro 2025)
- **Arquitetura**: Integração com Supabase Storage com bucket dedicado
- **Performance**: Compressão automática para máximo 1920px e qualidade 0.8
- **Validação**: Formatos JPEG/PNG/WebP, limite de 5MB por foto
- **UX/UI**: Galeria modal com navegação por teclado, zoom e download
- **Demonstração**: Sistema de fotos dummy usando Unsplash para showcase
- **Configuração**: Health check automático do storage e feedback de erros

## Decisão: Otimização de Layout e Estados de Loading (Janeiro 2025)
- **Layout responsivo**: Reorganização do cabeçalho com botões alinhados à direita
- **Estados visuais**: Implementação de loading states para todas as operações
- **Modal de configurações**: Sistema completo com persistência localStorage
- **Correção de datas**: Implementação de cálculo consistente para tarefas recorrentes
- **Feedback visual**: Toasts posicionados no topo para melhor visibilidade

## Changelog (últimas tentativas e ajustes)

- Implementação do upload de fotos para tarefas usando Supabase Storage.
- Ajuste do código para usar bucket novo (`fotosapp`) com policies e RLS.
- Policies de INSERT e SELECT criadas para permitir upload e leitura pública.
- Debug detalhado de erros de RLS, policies e permissões no Supabase.
- Melhorias no menu de perfil: exibição de nome, e-mail e badge de Admin.
- Commit de checkpoint criado para preservar histórico de todas as tentativas e ajustes. 

---

## Decisões Arquiteturais Recentes (Janeiro 2025)

### **Decisão: Sistema de Gestão de Funcionários Integrado**
- **Problema**: Funcionários tinham tarefas atribuídas mas nada aparecia na aba de funcionários
- **Causa**: Incompatibilidade entre busca por `funcionarioId` vs relacionamento real `user_id`
- **Solução**: Correção do relacionamento usando `funcionario.user_id === tarefa.responsavel_id`
- **Implementação**: Refatoração completa do FuncionariosList.tsx
- **Resultado**: Sistema totalmente funcional com visualização correta de tarefas por funcionário
- **Motivação**: Garantir integridade dos dados e funcionalidade esperada pelos usuários

### **Decisão: Cards Expandíveis para Funcionários**
- **Implementação**: Interface compacta por padrão com opção de visualização detalhada
- **Comportamento**: Clique no card expande para mostrar filtros e micro cards das tarefas
- **Layout**: Informações básicas sempre visíveis, detalhes sob demanda
- **Motivação**: Otimizar espaço visual, melhorar UX mobile, manter acesso fácil a informações

### **Decisão: Sistema de Filtros Dinâmicos por Funcionário**
- **Implementação**: Botões All, Pending, Completed com contadores em tempo real
- **Lógica**: Filtros aplicados às tarefas do funcionário específico
- **Contadores**: Atualizados automaticamente com base nas tarefas carregadas
- **Estados**: Botão ativo destacado, contadores zerados quando apropriado
- **Motivação**: Fornecer visão granular das tarefas por funcionário, facilitar gestão

### **Decisão: Micro Cards de Tarefas Responsivos**
- **Layout**: Grid responsivo (1 coluna mobile, 2 colunas desktop)
- **Informações**: Título, imóvel, prazo, status em formato compacto
- **Interação**: Cards clicáveis que navegam para tarefa específica
- **Responsividade**: Adaptação automática baseada em breakpoints
- **Motivação**: Maximizar aproveitamento do espaço, manter usabilidade mobile-first

### **Decisão: Navegação Cross-Tab Integrada**
- **Implementação**: Sistema de eventos customizados para comunicação entre componentes
- **Eventos**: navigateToTab, openTaskDetail para navegação direta
- **Fluxo**: FuncionariosList → TaskList com tarefa específica selecionada
- **Integração**: Funciona com sistema existente de filtros e navegação
- **Motivação**: Criar experiência fluida, conectar gestão de funcionários com tarefas

### **Decisão: Estados Informativos Contextuais**
- **Implementação**: Mensagens específicas para diferentes cenários
- **Cenários**: Nenhuma tarefa, filtro específico sem resultados, carregamento
- **Texto**: Mensagens claras e orientativas para o usuário
- **Design**: Consistente com resto da aplicação
- **Motivação**: Guiar usuário, evitar confusão, melhorar experiência

### **Decisão: Sistema de Tarefas Recorrentes Automatizado**
- **Implementação**: Auto-criação de próximas tarefas baseada na periodicidade da tarefa anterior
- **Lógica**: Data de criação = data de conclusão da tarefa anterior; Data de vencimento = criação + periodicidade
- **Campos preservados**: Mesmo imóvel, responsável e tipo de tarefa
- **Motivação**: Automatizar fluxo recorrente, reduzir trabalho manual, garantir continuidade

### **Decisão: Cards Compactos e Expandíveis**
- **Implementação**: Tarefas concluídas em formato compacto com opção de expansão
- **Critério**: Apenas tarefas concluídas são expandíveis
- **Informações compactas**: Nome, status, tipo, imóvel, data de conclusão, responsável, indicador de fotos
- **Informações expandidas**: Todos os detalhes incluindo data de criação, prazo original, anotações, galeria de fotos
- **Motivação**: Otimizar espaço visual, melhorar UX mobile, manter acesso a informações detalhadas

### **Decisão: Navegação Contextual do Dashboard**
- **Implementação**: Cards do Dashboard disparam eventos customizados para navegação e filtros
- **Eventos**: 'navigateToTab', 'setStatusFilter', 'setTaskColorFilter'
- **Fluxo**: Dashboard → TaskList com filtros pré-aplicados
- **Motivação**: Criar experiência fluida, conectar visão geral com ações específicas

### **Decisão: Otimização Mobile-First Contínua**
- **Layout Flexível**: Uso de flex-row, gap-1, whitespace-nowrap para evitar quebras de texto
- **Reorganização Visual**: Manutenção alinhada com imóvel e responsável no lado direito
- **Labels Específicos**: "Criada em:", "Prazo final:", "Concluída em:" para maior clareza
- **Grid Responsivo**: Adaptação automática para diferentes tamanhos de tela
- **Motivação**: Maximizar usabilidade em dispositivos móveis, principal plataforma de uso

### **Decisão: Sistema de Periodicidade Baseado em Strings**
- **Formato Atual**: Números simples representando dias ("7", "30")
- **Planejamento**: Suporte a formatos como "3m" (meses) e "1a" (anos)
- **Parsing**: Sistema de interpretação flexível para diferentes unidades de tempo
- **Motivação**: Flexibilidade para diferentes tipos de manutenção, facilidade de configuração

### **Decisão: Event-Driven Communication**
- **Implementação**: Sistema de eventos customizados entre componentes
- **Eventos principais**: openNewTaskModal, navigateToTab, setTaskColorFilter, setStatusFilter, openTaskDetail
- **Vantagens**: Baixo acoplamento, comunicação clara, fácil manutenção
- **Motivação**: Manter arquitetura modular, facilitar futuras expansões

### **Decisão: Componentização com Props Flexíveis**
- **TaskCard**: Props editButton e className para diferentes contextos
- **FuncionarioCard**: Props expandible para diferentes estados
- **Reutilização**: Mesmos componentes para diferentes cenários
- **Flexibilidade**: Configuração via props sem duplicação de código
- **Motivação**: Código limpo, manutenção facilitada, consistência visual

### **Impacto Arquitetural das Decisões Recentes**
Essas decisões reforçam:
- **Modularidade**: Componentes independentes e reutilizáveis
- **Escalabilidade**: Estrutura pronta para novas funcionalidades
- **Usabilidade**: Foco contínuo na experiência mobile
- **Manutenibilidade**: Código limpo e bem documentado
- **Relacionamentos de Dados**: Integridade e consistência garantidas
- **Performance**: Otimização contínua de rendering e navegação

### **Lições Aprendidas**
1. **Relacionamentos de Dados**: Importância de mapear corretamente as chaves estrangeiras
2. **Interface Progressiva**: Cards expandíveis oferecem melhor UX que telas separadas
3. **Eventos Customizados**: Solução elegante para comunicação cross-component
4. **Mobile-First Real**: Cada decisão deve considerar primeiro o uso móvel
5. **Estados Informativos**: Crucial para orientar usuários em diferentes cenários

### **Próximas Decisões Técnicas**
1. **Storage Strategy**: Definir estratégia para fotos (Supabase Storage vs CDN)
2. **Notification Architecture**: Escolher entre FCM, OneSignal ou implementação própria
3. **Offline Strategy**: Definir abordagem para sincronização offline
4. **Employee Dashboard**: Arquitetura para painéis específicos por funcionário
5. **Task Assignment Logic**: Algoritmos para atribuição automática de tarefas
6. **Reporting Engine**: Escolher biblioteca para gráficos e exportação
7. **Testing Strategy**: Definir stack de testes automatizados

**Todas as decisões mantêm alinhamento com os princípios de simplicidade, escalabilidade, experiência mobile-first e integridade de dados.** 

## Decisões Técnicas para Próximas Implementações (Janeiro 2025)

### **Decisão: Stack Tecnológico para Upload de Fotos Completo**
- **Biblioteca para Galeria**: React Portal + Framer Motion para modais fluidos
- **Otimização de Imagens**: Canvas API para compressão no lado cliente
- **Performance**: Intersection Observer para lazy loading
- **Indicadores Visuais**: CSS Grid responsivo nos cards de tarefa
- **Motivação**: Experiência visual premium sem impacto na performance

### **Decisão: Firebase FCM para Notificações Push**
- **Escolha**: Firebase Cloud Messaging vs OneSignal vs implementação própria
- **Razão**: FCM tem melhor integração com Supabase Edge Functions
- **Implementação**: SDK modular v9+ para reduzir bundle size
- **Backend**: Supabase Edge Functions (Deno) para envio automático
- **Agendamento**: pg_cron do PostgreSQL para timing preciso
- **Motivação**: Solução robusta, escalável e com custo controlado

### **Decisão: Chart.js para Dashboard de Relatórios**
- **Biblioteca**: Chart.js v4 vs Recharts vs D3.js
- **Razão**: Chart.js oferece melhor performance e responsividade mobile
- **Implementação**: Wrapper React customizado para otimização
- **Gráficos prioritários**: Barras, pizza, linha temporal
- **Exportação**: jsPDF + html2canvas para PDFs de qualidade
- **Motivação**: Solução madura com documentação excelente

### **Decisão: Arquitetura de Componentes para Novas Funcionalidades**
- **PhotoGallery**: Componente standalone reutilizável
- **ReportCharts**: Sistema modular para diferentes tipos de gráfico
- **NotificationSetup**: Hook customizado para gerenciamento FCM
- **ExportControls**: Componente unificado para PDF/CSV
- **Motivação**: Manter consistência arquitetural e facilitar manutenção

### **Decisão: Estratégia de Performance para Implementações**
- **Code Splitting**: Lazy loading para módulos de relatório
- **Bundle Optimization**: Tree shaking rigoroso para todas as libs
- **Image Optimization**: WebP com fallback para JPEG
- **Caching Strategy**: React Query para dados de relatório
- **Motivação**: Manter performance < 2s mesmo com novas funcionalidades

### **Decisão: Templates de Notificação Inteligentes**
- **Tipos de Notificação**: 4 templates principais
  - 1 dia antes do vencimento
  - No dia do vencimento
  - 1 dia após (atrasada)
  - Conclusão de tarefa (para gestores)
- **Personalização**: Mustache.js para templates dinâmicos
- **Targeting**: Baseado em perfil de usuário (gestor vs funcionário)
- **Horários**: Respeitando horário comercial (8h-18h)
- **Motivação**: Comunicação eficaz sem spam

### **Decisão: Sistema de Filtros Avançados para Relatórios**
- **Filtros Disponíveis**: Período, imóvel, funcionário, tipo de tarefa
- **Interface**: Dropdown multi-select com checkboxes
- **Persistência**: Local storage para salvar preferências
- **Performance**: Debounce para evitar queries excessivas
- **Motivação**: Flexibilidade máxima para análises específicas

### **Decisão: Métricas Avançadas Prioritárias**
- **Tempo Médio**: Cálculo por tipo de tarefa e funcionário
- **Taxa de Atraso**: Percentual por categoria e período
- **Projeções**: Algoritmo simples baseado em histórico
- **Alertas**: Threshold configurável para imóveis problemáticos
- **Motivação**: Dados acionáveis para gestão proativa

### **Impacto Arquitetural das Novas Decisões**
Estas decisões garantem:
- **Escalabilidade**: Stack escolhido suporta crescimento
- **Performance**: Otimizações desde o design
- **Manutenibilidade**: Componentes modulares e bem documentados
- **User Experience**: Funcionalidades fluidas e intuitivas
- **Business Value**: ROI mensurável e competitividade

### **Riscos Mitigados**
1. **Bundle Size**: Code splitting e tree shaking implementados
2. **Performance Mobile**: Lazy loading e compressão de imagens
3. **Complexidade**: Arquitetura modular facilita desenvolvimento
4. **Custos**: Firebase FCM tem tier gratuito generoso
5. **Manutenção**: Bibliotecas maduras com boa documentação

### **Próximas Decisões Técnicas (Pós-Implementação)**
1. **Offline Support**: Definir estratégia para sincronização
2. **Real-time Updates**: Considerar Supabase Realtime
3. **Mobile App**: Avaliar Progressive Web App vs React Native
4. **Scaling**: Preparar para multi-tenancy
5. **Analytics**: Integrar tracking de uso e performance

**Todas as decisões mantêm alinhamento com princípios de simplicidade, performance, escalabilidade e ROI máximo.** 