# PRD – Terrah Homes | Tarefas Programadas

## 1. Visão Geral
O aplicativo Terrah Homes Tarefas Programadas é uma solução digital para gestão, automação e acompanhamento de tarefas recorrentes e programadas de manutenção, limpeza e operação de imóveis. O objetivo é garantir controle, agilidade e transparência na execução das demandas, com foco em tarefas de longo prazo, automação de agendamento, anexos de fotos, notificações e relatórios para o gestor.

---

## 2. Público-Alvo
- **Admin (Gestor/CEO):** Gerencia imóveis, usuários, periodicidades, relatórios e tem visão total do sistema.
- **Funcionários (Atendentes/Colaboradores):** Executam tarefas, recebem notificações, concluem e registram fotos.

---

## 3. Funcionalidades Principais
### 3.1. Usuários e Controle de Acesso
- Login por e-mail e senha únicos.
- Admin pode cadastrar, editar, desativar usuários e imóveis.
- Funcionários podem criar, editar, atribuir e concluir tarefas.
- Admin pode pausar e editar qualquer tarefa.

### 3.2. Imóveis
- Cadastro, edição, arquivamento/desativação de imóveis (apenas admin).
- Tarefas podem ser associadas a imóveis ou independentes.

### 3.3. Tarefas
- Tarefas programadas criadas automaticamente conforme periodicidade definida pelo admin.
- Tarefas manuais podem ser criadas por qualquer usuário.
- Status: Em aberto, Concluída, Pausada (apenas admin pode pausar).
- Conclusão exige upload de até 5 fotos (celular).
- Campos obrigatórios: Título, descrição, data de criação, data de vencimento, prioridade, status, imóvel (opcional), tipo de manutenção, observações.
- Admin pode editar qualquer campo de uma tarefa (data, periodicidade, responsável, etc).
- Ao concluir uma tarefa programada, a próxima é agendada automaticamente.
- Tarefas atrasadas geram notificações até conclusão.

### 3.4. Notificações
- Push notifications para todos os usuários (inclusive gestor) sobre novas tarefas, alterações de status, prazos próximos e tarefas atrasadas.

### 3.5. Relatórios
- Painel web para gestor visualizar todas as tarefas (concluídas, pendentes, atrasadas), com filtros por imóvel, usuário e período.
- Exportação de relatório mensal (CSV/PDF).

### 3.6. Offline
- App funciona offline para leitura e atualização de status de tarefas.
- Sincronização automática ao reconectar.

### 3.7. Fotos e Anexos
- Upload de até 5 fotos por tarefa (armazenamento em Firebase Storage ou Supabase Storage).

### 3.8. Integração com Calendário
- Sincronização de tarefas com Google Calendar para o gestor.

### 3.9. Branding e UI
- Usar logo e cores da Terrah Homes (azul turquesa e laranja).
- Interface simples, clean e fácil de usar.

---

## 4. Fluxos de Usuário
### 4.1. Funcionário
1. Faz login no app.
2. Visualiza lista de tarefas atribuídas (filtros por imóvel, status, prioridade).
3. Recebe notificações de novas tarefas, prazos e alterações.
4. Conclui tarefas anexando fotos obrigatórias.
5. Pode criar tarefas manuais se necessário.
6. Visualiza histórico de tarefas.

### 4.2. Admin (Gestor)
1. Faz login no painel web.
2. Gerencia imóveis e usuários.
3. Define periodicidade das tarefas programadas.
4. Visualiza, edita, pausa e exclui tarefas.
5. Recebe notificações push e visualiza painel de notificações.
6. Gera e exporta relatórios mensais.
7. Sincroniza tarefas com Google Calendar.

---

## 5. Requisitos Técnicos
- **Frontend:** PWA (React + Vite ou Next.js), TailwindCSS, Material UI ou Shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Storage, Messaging) ou Supabase (avaliar custos)
- **Push Notifications:** Firebase Cloud Messaging (FCM) ou alternativa Supabase
- **Offline:** IndexedDB/localStorage + sincronização automática
- **Relatórios:** Firestore queries + exportação CSV/PDF
- **Integração:** Google Calendar API

---

## 6. UI/UX e Branding
- Interface mobile-first, responsiva e acessível
- Paleta: Azul turquesa e laranja (logo fornecida)
- Layout clean, navegação simples, foco em usabilidade
- Upload de fotos fácil e rápido
- Notificações visíveis e intuitivas

---

## 7. Segurança e Conformidade
- Conformidade com LGPD (dados pessoais)
- Controle de acesso por perfil
- Dados sensíveis protegidos por autenticação
- Backup automático (Firebase/Supabase)

---

## 8. Roadmap Futuro
- Multiempresa (vender para outras empresas do ramo)
- Suporte a múltiplos idiomas
- App mobile nativo (caso necessário)
- Integração com WhatsApp para notificações
- Analytics avançado para gestor
- Customização de relatórios

---

## 9. Critérios de Aceite do MVP
- Login e controle de acesso funcionando
- Cadastro e gestão de imóveis e usuários (admin)
- Criação automática e manual de tarefas
- Conclusão de tarefas com upload de fotos
- Notificações push funcionando
- Relatórios acessíveis via painel web
- Sincronização offline básica
- Integração com Google Calendar
- Interface com branding da Terrah Homes

---

**Este PRD deve ser revisado e atualizado conforme o projeto evolui.** 