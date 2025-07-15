# ESTRUTURA – Terrah Homes | Tarefas Programadas

## Organização de Pastas

```
terrah-home-manage/
├── public/                    # Assets estáticos
│   ├── lovable-uploads/       # Imagens do projeto (logo, placeholders)
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/            # Componentes React reutilizáveis
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── BottomNav.tsx     # Navegação inferior mobile
│   │   ├── Dashboard.tsx     # Dashboard principal
│   │   ├── Header.tsx        # Cabeçalho da aplicação
│   │   ├── TaskList.tsx      # Lista de tarefas
│   │   ├── TaskCard.tsx      # Card individual de tarefa
│   │   ├── PropertyList.tsx  # Lista de propriedades
│   │   ├── PhotoGallery.tsx  # Galeria de fotos modal
│   │   └── FuncionariosList.tsx # Lista de funcionários
│   ├── pages/                # Páginas principais
│   │   ├── Index.tsx         # Página principal
│   │   ├── Login.tsx         # Página de login
│   │   └── NotFound.tsx      # Página 404
│   ├── hooks/                # Custom hooks
│   │   ├── use-mobile.tsx    # Hook para detecção mobile
│   │   └── use-toast.ts      # Hook para notificações
│   ├── lib/                  # Utilitários, helpers
│   │   ├── supabaseClient.ts # Cliente Supabase
│   │   ├── utils.ts          # Funções utilitárias
│   │   └── photoUpload.ts    # Utilitário para upload de fotos
│   ├── data/                 # Dados mock/dummy
│   │   └── dummyPhotos.ts    # Fotos demonstrativas
│   ├── index.css             # Estilos globais
│   └── main.tsx              # Entry point
├── CHECKLIST_MVP.md           # Checklist do MVP
├── CONTEXTO.md               # Contexto do projeto
├── DECISOES.md               # Decisões técnicas
├── ESTRUTURA.md              # Esta estrutura
├── ONBOARDING.md             # Manual de onboarding
├── PRD_TERAH_HOMES.md        # Product Requirements Document
├── README.md                 # Documentação principal
├── package.json
├── tailwind.config.ts        # Configuração Tailwind
├── vite.config.ts           # Configuração Vite
└── components.json          # Configuração shadcn/ui
```

## Fluxos Principais
- **Autenticação**: Login/logout com Supabase Auth
- **CRUD de imóveis**: Gestão completa (admin apenas)
- **Gestão de tarefas**: Criação manual e automática com periodicidade
- **Sistema de veículos**: Tarefas especializadas para veículos/automóveis
- **Upload de fotos**: Sistema completo com compressão e galeria
- **Visualização de fotos**: Modal avançado com navegação e zoom
- **Configurações**: Modal com preferências do usuário
- **Dashboard interativo**: Cards clicáveis com filtros automáticos
- **Estados de loading**: Feedback visual para todas as operações

## Observações
- Estrutura modular para facilitar manutenção e escalabilidade
- Pronta para expansão futura (multiempresa, novos tipos de tarefas) 

---

## Atualização 12/07 – Estrutura e Evolução
A estrutura modular do projeto segue adequada para manutenção e expansão. As próximas melhorias focam em UX/UI, filtros avançados, upload de fotos, notificações push, painel de relatórios, sincronização offline e onboarding, garantindo escalabilidade e experiência mobile-first. 

---

## Changelog (últimas tentativas e ajustes)

- Implementação do upload de fotos para tarefas usando Supabase Storage.
- Ajuste do código para usar bucket novo (`fotosapp`) com policies e RLS.
- Policies de INSERT e SELECT criadas para permitir upload e leitura pública.
- Debug detalhado de erros de RLS, policies e permissões no Supabase.
- Melhorias no menu de perfil: exibição de nome, e-mail e badge de Admin.
- Commit de checkpoint criado para preservar histórico de todas as tentativas e ajustes. 

---

## Estrutura Atual e Evolução Arquitetural (Janeiro 2025)

### **Arquitetura de Componentes Atualizada**

```
src/
├── components/
│   ├── ui/                    # Componentes base (shadcn/ui)
│   ├── Dashboard.tsx          # Dashboard principal com navegação contextual
│   ├── TaskList.tsx           # Lista de tarefas com filtros avançados
│   ├── TaskCard.tsx           # Card flexível (compacto/expandível)
│   ├── PropertyList.tsx       # Gestão de imóveis
│   ├── FuncionariosList.tsx   # Gestão de funcionários com cards expandíveis
│   ├── Header.tsx             # Header com notificações
│   └── BottomNav.tsx          # Navegação inferior mobile
├── pages/
│   ├── Index.tsx              # Página principal
│   ├── Login.tsx              # Autenticação
│   └── NotFound.tsx           # 404
├── hooks/
│   ├── use-mobile.tsx         # Hook para detecção mobile
│   └── use-toast.ts           # Sistema de notificações
├── lib/
│   ├── supabaseClient.ts      # Cliente Supabase configurado
│   └── utils.ts               # Utilitários e funções de periodicidade
└── data/                      # Dados estáticos e configurações
```

### **Fluxos de Dados Implementados**

#### **1. Sistema de Tarefas Recorrentes**
```
Conclusão Tarefa → Verificar Periodicidade → Auto-criar Próxima Tarefa
├── Data criação: Data conclusão anterior
├── Data vencimento: Criação + periodicidade
├── Campos preservados: imovel_id, responsavel_id, tipo
└── Novo ID e status: em_aberto
```

#### **2. Navegação Contextual Dashboard**
```
Dashboard Card Click → CustomEvent → TaskList
├── navigateToTab: Muda para aba tasks
├── setStatusFilter: Aplica filtro de status
├── setTaskColorFilter: Aplica filtro de cor
└── Resultado: Lista filtrada específica
```

#### **3. Sistema de Funcionários e Tarefas**
```
FuncionariosList → Busca Tarefas por user_id → Exibe Micro Cards
├── Filtro All: Todas as tarefas do funcionário
├── Filtro Pending: Apenas tarefas em aberto
├── Filtro Completed: Apenas tarefas concluídas
├── Contadores: Atualizados em tempo real
└── Navegação: Micro cards → Tarefa específica via eventos
```

#### **4. Sistema de Cards Expandíveis**
```
TaskCard/FuncionarioCard → Props Analysis → Render Strategy
├── Se concluída/funcionário: Modo compacto com botão expandir
├── Se expanded: Mostra todos os detalhes/micro cards
├── Se pendente: Modo padrão
└── Props: editButton, className para flexibilidade
```

### **Padrões Arquiteturais Adotados**

#### **Event-Driven Communication**
- Eventos customizados para comunicação entre componentes
- Navegação cross-tab com eventos específicos
- Sistema extensível para futuras funcionalidades
- **Eventos principais**: openNewTaskModal, navigateToTab, setTaskColorFilter, setStatusFilter, openTaskDetail

#### **Component Composition**
- TaskCard reutilizável com props configuráveis
- FuncionariosList com cards expandíveis
- UI components modulares e consistentes
- Pattern de render props para flexibilidade

#### **Mobile-First Design Pattern**
- Layout responsivo desde a concepção
- Touch-friendly interactions
- Otimização contínua para dispositivos móveis
- Grid responsivo (1 coluna mobile, 2 desktop)

#### **State Management Pattern**
- Estado local com useState para componentes
- React Query para cache e sincronização
- Event system para comunicação cross-component
- Filtros dinâmicos com atualizações em tempo real

### **Integração com Backend (Supabase)**

#### **Tabelas Principais**
```sql
tarefas
├── Sistema de recorrência via periodicidade
├── Auto-criação de próximas tarefas
├── Relacionamento com funcionarios via responsavel_id
└── Upload de fotos (em desenvolvimento)

funcionarios
├── Campo user_id para relacionamento correto
├── Busca de tarefas via user_id
├── Cards expandíveis com filtros
└── Sistema de contadores dinâmicos

imoveis
├── Referenciados em tarefas
├── Exibidos em micro cards
└── Filtros dinâmicos

tarefas_predefinidas
├── Templates para criação
└── Gestão dinâmica via interface
```

#### **Relacionamentos Corrigidos**
- **funcionarios.user_id ← tarefas.responsavel_id**: Relacionamento funcional implementado
- **Busca por funcionário**: Uso correto de `funcionario.user_id` em vez de `funcionarioId`
- **Filtros por status**: Implementados com contadores em tempo real
- **Navegação cross-tab**: Sistema de eventos para abrir tarefas específicas

#### **Storage Strategy**
- Supabase Storage para fotos de tarefas
- Bucket `fotosapp` com policies configuradas
- Preview e upload integrados nos modais

### **Performance e Otimizações**

#### **Rendering Optimizations**
- Lazy loading de componentes pesados
- Memoização de cálculos de data e contadores
- Virtualization planejada para listas grandes
- Cards expandíveis para reduzir sobrecarga inicial

#### **Data Fetching Strategy**
- React Query para cache inteligente
- Fetch on-demand para dados específicos
- Refresh automático em ações críticas
- Busca otimizada de tarefas por funcionário

#### **Mobile Performance**
- CSS otimizado para touch devices
- Animações com GPU acceleration
- Bundle size otimizado
- Layout responsivo nativo

### **Escalabilidade Planejada**

#### **Multiempresa Architecture**
- Estrutura de dados preparada
- Isolamento por tenant
- Configurações flexíveis

#### **Plugin System (Futuro)**
- Hooks para extensões
- Sistema de módulos
- API para integrações

#### **Microservices Preparation**
- Separação clara de responsabilidades
- APIs bem definidas
- Supabase como backend-as-a-service

### **Próximas Evoluções Arquiteturais**

1. **Offline-First Architecture**: Service Workers + IndexedDB
2. **Real-time Updates**: Supabase Realtime para colaboração
3. **Advanced Caching**: Estratégias de cache mais sofisticadas
4. **Employee Dashboard**: Painel específico para cada funcionário
5. **Task Assignment System**: Sistema de atribuição automática de tarefas
6. **Monitoring Integration**: Logs, analytics e performance tracking
7. **Testing Architecture**: Testes automatizados e E2E

### **Inovações Arquiteturais Recentes**

#### **Sistema de Funcionários Integrado**
- **Cards Expandíveis**: Interface otimizada para visualização e gestão
- **Filtros Dinâmicos**: All/Pending/Completed com contadores em tempo real
- **Micro Cards**: Layout responsivo para tarefas do funcionário
- **Navegação Direta**: Sistema de eventos para abrir tarefas específicas
- **Relacionamento Robusto**: Uso correto de user_id para busca de tarefas

#### **Event System Avançado**
- **Cross-Component Communication**: Navegação fluida entre abas
- **Task Detail Navigation**: Abertura de tarefas específicas de qualquer contexto
- **Filter Synchronization**: Aplicação de filtros contextuais automáticos
- **Real-time Updates**: Contadores e estados atualizados instantaneamente

**A estrutura continua evoluindo com foco em modularidade, performance, experiência do usuário e relacionamentos de dados eficientes.** 

## Próximas Implementações Técnicas (Janeiro 2025)

### **Arquitetura das Novas Funcionalidades**

#### **1. Sistema de Fotos Completo**
```
TaskCard → Foto Indicator → Gallery Modal
├── Miniatura: Contador de fotos no card
├── Click Handler: Abre galeria específica da tarefa
├── Lazy Loading: Carregamento otimizado
└── Compression: Redução automática de tamanho
```

#### **2. Notificações Push com Firebase**
```
Supabase Edge Function → Firebase FCM → Dispositivos
├── Trigger: Eventos de tarefa (criação, vencimento, atraso)
├── Templates: Personalizados por tipo de evento
├── Targeting: Por perfil (gestor vs funcionário)
└── Scheduling: Baseado em prazos e datas
```

#### **3. Dashboard de Relatórios Avançado**
```
Data Processing → Chart.js → Export System
├── Aggregation: Dados agrupados por período/tipo
├── Visualization: Gráficos interativos responsivos
├── Filtering: Sistema avançado de filtros
└── Export: PDF/CSV com formatação customizada
```

### **Stack Tecnológico das Novas Funcionalidades**

#### **Upload de Fotos**
- **Visualização**: React + CSS Grid responsivo
- **Modal**: React Portal + Framer Motion
- **Performance**: Intersection Observer API
- **Otimização**: Canvas API para compressão

#### **Notificações Push**
- **Cliente**: Firebase SDK v9+
- **Backend**: Supabase Edge Functions (Deno)
- **Agendamento**: Supabase pg_cron
- **Templates**: Mustache.js para personalização

#### **Relatórios**
- **Gráficos**: Chart.js v4 + React wrapper
- **PDF**: jsPDF + html2canvas
- **CSV**: Papa Parse para exportação
- **Filtros**: React Query + estado local

### **Integração com Arquitetura Existente**

#### **Componentes Afetados**
```
TaskCard.tsx → + Foto indicator + Gallery modal
Dashboard.tsx → + Advanced charts + Export buttons
Header.tsx → + Notification permission + FCM token
TaskList.tsx → + Photo thumbnails + Performance optimization
```

#### **Novos Componentes Planejados**
```
src/components/
├── PhotoGallery.tsx      # Modal de galeria de fotos
├── ReportCharts.tsx      # Gráficos interativos
├── ExportControls.tsx    # Controles de exportação
├── NotificationSetup.tsx # Configuração de push
└── AdvancedFilters.tsx   # Filtros de relatório
```

#### **Utilitários e Hooks Novos**
```
src/lib/
├── photoUtils.ts         # Compressão e otimização
├── chartUtils.ts         # Configurações de gráficos
├── exportUtils.ts        # PDF/CSV generation
└── notificationUtils.ts  # FCM e templates

src/hooks/
├── usePhotoGallery.ts    # Estado da galeria
├── useNotifications.ts   # Gerenciamento FCM
└── useReportData.ts      # Dados para relatórios
```

### **Estratégia de Performance**

#### **Otimizações Planejadas**
- **Lazy Loading**: Fotos carregadas sob demanda
- **Code Splitting**: Chunks separados para relatórios
- **Memoization**: React.memo para gráficos pesados
- **Virtual Scrolling**: Para listas grandes de fotos

#### **Bundle Size Management**
- **Chart.js**: Import apenas módulos necessários
- **Firebase**: SDK modular para reduzir tamanho
- **Images**: WebP format com fallback
- **Icons**: Tree shaking de Lucide React

### **Integração com Supabase**

#### **Novas Políticas RLS**
```sql
-- Fotos: visualização por tarefa
photos_policy: authenticated users can view photos of their assigned tasks

-- Notificações: configuração por usuário  
notifications_policy: users can manage their own notification preferences

-- Relatórios: acesso baseado em perfil
reports_policy: admins can access all data, users only their own
```

#### **Edge Functions Planejadas**
```
supabase/functions/
├── send-notifications/   # Envio de push notifications
├── generate-reports/     # Processamento de dados para relatórios
└── compress-photos/      # Otimização automática de fotos
```

### **Timeline de Implementação**

#### **Dia 1-2: Upload de Fotos**
- Componente PhotoGallery
- Integração com TaskCard
- Otimização de performance

#### **Dia 3-5: Notificações Push**  
- Setup Firebase FCM
- Edge Functions para envio
- Templates e lógica de timing

#### **Dia 6-9: Relatórios Avançados**
- Componentes de gráficos
- Sistema de exportação
- Filtros avançados

#### **Dia 10: Integração e Testes**
- Testes de performance
- Validação cross-device
- Ajustes finais

**A arquitetura está preparada para estas implementações sem breaking changes nas funcionalidades existentes.** 