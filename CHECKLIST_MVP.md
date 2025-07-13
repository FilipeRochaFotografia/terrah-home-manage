# Checklist MVP – Terrah Homes (Mobile-First & Supabase)

## Etapas Prioritárias

- [x] Definir backend: Supabase
- [x] Instalar dependências principais (React, Supabase, TailwindCSS, etc.)
- [x] Melhorar UI/UX dos componentes principais
- [x] Executar projeto (funcionando em http://localhost:8080/)
- [x] Personalizar header com nova logo
- [x] Configurar Supabase (chaves, ambiente, tabelas)
- [x] Implementar autenticação de usuários (Supabase Auth, tela de login)
- [x] Implementar CRUD de imóveis (admin, integrado ao Supabase)
- [x] Implementar CRUD de tarefas/demandas (admin, integrado ao Supabase, mapeamento de status/prioridade)
- [x] Implementar sistema de tarefas predefinidas (modelos) integrado ao Supabase
- [x] Integração dinâmica de tarefas predefinidas (modelos) com Supabase e frontend
- [x] Modal de nova tarefa limpo, sem duplicidade de informações
- [x] Ajustar botão de configurações e botão de perfil (logout)
- [x] Aplicar filtro de propriedades na aba de tarefas
- [x] Ajustar cores, cards e modais da área de propriedades
- [x] Ajustar UI da área de funcionários
- [x] Modal de conclusão de tarefas com select de funcionários
- [x] Upload de fotos habilitado no modal de conclusão com preview
- [x] Modal de conclusão com padding lateral no mobile
- [x] Modal de edição de tarefas com campos preenchidos automaticamente
- [x] Modal de edição com tamanho reduzido para melhor UX
- [x] Componente TaskCard refatorado para aceitar props editButton e className
- [x] Botão de editar movido para dentro do card de tarefa (rodapé)
- [x] Botão de excluir mantido apenas no modal de edição
- [x] Eliminação de containers extras nos cards de tarefa
- [x] Interface visual mais limpa e consistente nos cards de tarefa
- [ ] Implementar upload de até 5 fotos por tarefa (Supabase Storage) - Integração completa
- [ ] Implementar notificações push (Supabase/alternativa)
- [ ] Implementar painel de relatórios para gestor
- [ ] Implementar sincronização offline (IndexedDB/localStorage)
- [ ] Implementar integração com Google Calendar
- [ ] Garantir interface mobile-first, responsiva e clean
- [ ] Aplicar branding (azul turquesa, laranja, logo)
- [ ] Criar wireframes das telas principais
- [ ] Criar manuais e tutoriais para onboarding

## Observações
- CRUD de imóveis e tarefas funcionando, integrados ao Supabase.
- Sistema de tarefas predefinidas (modelos) implementado e integrado ao Supabase.
- Integração dinâmica de tarefas predefinidas (modelos) com Supabase e frontend.
- Modal de nova tarefa limpo, sem duplicidade de informações.
- Mapeamento de status/prioridade do banco para o frontend implementado.
- Interface visual limpa e consistente nos cards de tarefa.
- Upload de fotos com preview implementado no modal de conclusão.
- Próximos passos: integração completa de uploads, notificações push, relatórios, etc.
- Atualize este checklist conforme o projeto evolui.
- Use em conjunto com o KANBAN.md para acompanhamento do progresso.
- UI/UX modernizada com animações, hover effects e design mobile-first.
- Projeto rodando em http://localhost:8080/

## Progresso recente (2024-05)

- [x] Remover card de alertas críticos/urgentes/atrasadas do Dashboard
- [x] Modal de notificações no sino do Header (tarefas urgentes/atrasadas)
- [x] Badge do sino atualizado em tempo real
- [x] Persistência de notificações lidas por sessão
- [x] Bloco de "Concluídas" em azul no resumo do período
- [x] Bloco vermelho do relatório: "Urgentes (≤5 dias)" (urgentes + atrasadas)
- [x] Remover bloco de "Atividade Recente"
- [x] Feedback visual (toast) ao concluir tarefas
- [x] Correção do fluxo de responsável (user_id)

## Próximas tarefas (2024-05)

- [x] Ajustar botão de configurações e botão de perfil (logout)
- [x] Aplicar filtro de propriedades na aba de tarefas
- [x] Ajustar cores, cards e modais da área de propriedades
- [x] Ajustar UI da área de funcionários
- [ ] Finalizar integração completa de upload de fotos
- [ ] Implementar notificações push
- [ ] Criar painel de relatórios avançado
- [ ] Implementar sincronização offline

---

## Changelog (Atualizações Recentes)

- [2024-07-12] Conclusão de tarefas usa sempre a data do dia atual.
- [2024-07-12] Tarefas concluídas agora têm borda azul (turquesa).
- [2024-07-12] Filtro de tarefas por imóvel integrado à navegação.
- [2024-07-12] Correção do erro PATCH 400 ao concluir tarefas.
- [2024-07-12] Cards de tarefas concluídas mostram responsável, anotações e (futuramente) fotos.
- [2024-07-12] Não é mais possível concluir uma tarefa já concluída.
- [2024-07-12] Melhorias visuais e de robustez no fluxo de tarefas.
- [2024-07-12] Modal de conclusão de tarefas com select de funcionários (não mais input livre).
- [2024-07-12] Upload de fotos habilitado no modal de conclusão com preview.
- [2024-07-12] Modal de conclusão com padding lateral no mobile.
- [2024-07-12] Modal de edição de tarefas com campos preenchidos automaticamente.
- [2024-07-12] Modal de edição com tamanho reduzido para melhor UX.
- [2024-07-12] Componente TaskCard refatorado para aceitar props editButton e className.
- [2024-07-12] Botão de editar movido para dentro do card de tarefa (rodapé).
- [2024-07-12] Botão de excluir mantido apenas no modal de edição.
- [2024-07-12] Eliminação de containers extras nos cards de tarefa.
- [2024-07-12] Interface visual mais limpa e consistente nos cards de tarefa.
- Atualização do título e meta tags do index.html para 'Terrah Homes - Gestão de Tarefas'.
- Implementado filtro 'Urgentes e Atrasadas' na TaskList, integrado ao dashboard.
- Header corrigido: agora exibe 'Gestão de Tarefas' e sem gradiente de fundo.

---

## Changelog (últimas tentativas e ajustes)

- Implementação do upload de fotos para tarefas usando Supabase Storage.
- Ajuste do código para usar bucket novo (`fotosapp`) com policies e RLS.
- Policies de INSERT e SELECT criadas para permitir upload e leitura pública.
- Debug detalhado de erros de RLS, policies e permissões no Supabase.
- Melhorias no menu de perfil: exibição de nome, e-mail e badge de Admin.
- Commit de checkpoint criado para preservar histórico de todas as tentativas e ajustes.


