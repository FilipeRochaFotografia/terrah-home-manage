# Kanban – MVP Terrah Homes (Foco Mobile-First)

| **A Fazer**                                                                 | **Em Progresso** | **Concluído** |
|-----------------------------------------------------------------------------|------------------|---------------|
| Upload de até 5 fotos por tarefa (mobile, Supabase Storage) - Integração completa |                  |               |
| Status de tarefas: Em aberto, Concluída, Pausada                            |                  |               |
| Histórico de tarefas por imóvel e usuário (mobile, Supabase)                |                  |               |
| Push notifications (mobile e gestor, Supabase/alternativa)                  |                  |               |
| Painel web/mobile para gestor (tarefas, filtros, relatórios)                |                  |               |
| Exportação de relatório mensal (CSV/PDF)                                    |                  |               |
| Leitura e atualização de status offline (mobile)                            |                  |               |
| Sincronização automática ao reconectar (mobile)                             |                  |               |
| Integração com Google Calendar (gestor)                                     |                  |               |
| Aplicar branding (azul turquesa, laranja, logo)                             |                  |               |
| Interface mobile-first, responsiva e clean                                  |                  |               |
| Definir periodicidades detalhadas para cada tarefa programada               |                  |               |
| Desenhar wireframes das telas principais (mobile)                           |                  |               |
| Testes de fluxo, performance e usabilidade em dispositivos móveis           |                  |               |
|                                                                             |                  | CRUD de imóveis e tarefas (demandas) integrados ao Supabase, mapeamento de status/prioridade, cadastro, edição e remoção funcionando |
|                                                                             |                  | Sistema de tarefas predefinidas (modelos) integrado ao Supabase, formulário dinâmico funcionando |
|                                                                             |                  | Integração dinâmica de tarefas predefinidas (modelos) com Supabase e frontend |
|                                                                             |                  | Modal de nova tarefa limpo, sem duplicidade de informações |
|                                                                             |                  | Ajustar UX/UI de propriedades e funcionários |
|                                                                             |                  | Filtro de propriedades na TaskList |
|                                                                             |                  | Modal de conclusão de tarefas com select de funcionários |
|                                                                             |                  | Upload de fotos habilitado no modal de conclusão com preview |
|                                                                             |                  | Modal de conclusão com padding lateral no mobile |
|                                                                             |                  | Modal de edição de tarefas com campos preenchidos automaticamente |
|                                                                             |                  | Modal de edição com tamanho reduzido para melhor UX |
|                                                                             |                  | Componente TaskCard refatorado para aceitar props editButton e className |
|                                                                             |                  | Botão de editar movido para dentro do card de tarefa (rodapé) |
|                                                                             |                  | Botão de excluir mantido apenas no modal de edição |
|                                                                             |                  | Eliminação de containers extras nos cards de tarefa |
|                                                                             |                  | Interface visual mais limpa e consistente nos cards de tarefa |

---

**Como usar:**
- Mova as tarefas para "Em Progresso" conforme forem iniciadas.
- Ao finalizar, mova para "Concluído".
- Atualize o quadro conforme o projeto evolui. 

---

## Próximos Passos Sugeridos (Atualização 12/07)
| **A Fazer**                                                                 | **Em Progresso** | **Concluído** |
|-----------------------------------------------------------------------------|------------------|---------------|
| Finalizar integração completa de upload de fotos                            |                  |               |
| Notificações push reais (mobile/web)                                        |                  |               |
| Painel de relatórios/exportação                                             |                  |               |
| Sincronização offline                                                       |                  |               |
| Acessibilidade e onboarding                                                 |                  |               |
| Histórico e edição de tarefas                                               |                  |               | 
| Testes de usabilidade e performance                                         |                  |               |
| Wireframes e documentação visual                                            |                  |               | 

---

## Changelog (últimas tentativas e ajustes)

- Implementação do upload de fotos para tarefas usando Supabase Storage.
- Ajuste do código para usar bucket novo (`fotosapp`) com policies e RLS.
- Policies de INSERT e SELECT criadas para permitir upload e leitura pública.
- Debug detalhado de erros de RLS, policies e permissões no Supabase.
- Melhorias no menu de perfil: exibição de nome, e-mail e badge de Admin.
- Commit de checkpoint criado para preservar histórico de todas as tentativas e ajustes. 