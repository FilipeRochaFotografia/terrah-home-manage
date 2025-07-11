# ONBOARDING – Terrah Homes | Tarefas Programadas

Bem-vindo ao projeto Terrah Homes Tarefas Programadas!

## Resumo Rápido do Projeto (2024)

- **Terrah Homes** é um sistema para gestão de tarefas programadas de manutenção, limpeza e operação de imóveis.
- O projeto é **mobile-first**, com backend no **Supabase** e frontend em **React + Vite**.

### Progresso Atual
- Tarefas predefinidas (modelos) agora são cadastradas e gerenciadas diretamente no Supabase.
- O frontend busca os modelos dinamicamente do banco, eliminando arquivos locais.
- O formulário de nova tarefa está limpo: mostra apenas a periodicidade da tarefa selecionada, sem duplicidade de nome/descrição.
- Interfaces TypeScript ajustadas para refletir os campos reais do banco.
- Todos os erros de tipagem e fetch resolvidos.
- Modal de nova tarefa com UX aprimorada.
- CRUD de imóveis e tarefas funcionando, integrados ao Supabase.

### Próximos Passos
- Upload de fotos por tarefa (Supabase Storage)
- Filtros e busca de tarefas
- Notificações push
- Relatórios e painel do gestor
- Sincronização offline
- Integração com Google Calendar

### Como contribuir
1. **Leia os arquivos:**
   - `README.md` (visão geral e progresso)
   - `CHECKLIST_MVP.md` (etapas e próximos passos)
   - `KANBAN.md` (status das tarefas)
   - `DECISOES.md` (decisões técnicas)
2. **Rode o projeto localmente:**
   - `npm install`
   - `npm run dev`
   - Acesse [http://localhost:8080](http://localhost:8080)
3. **Consulte o Supabase:**
   - Modelos de tarefas estão na tabela `tarefas_predefinidas`
   - CRUD de imóveis e tarefas já implementado
4. **Siga o padrão de código e UX já estabelecido.**
5. **Dúvidas?**
   - Consulte a documentação ou pergunte ao responsável técnico.

---

## Passos Iniciais
1. Leia toda a documentação: README.md, PRD_TERAH_HOMES.md, PENDENCIAS.md, ESTRUTURA.md, DECISOES.md, CONTEXTO.md
2. Instale as dependências com `npm install`
3. Execute o projeto localmente com `npm run dev`
4. Analise a arquitetura e os fluxos principais descritos em ESTRUTURA.md
5. Consulte as pendências em PENDENCIAS.md para saber o que precisa ser feito
6. Siga as decisões técnicas documentadas em DECISOES.md

## Boas Práticas
- Mantenha o código limpo, modular e documentado
- Priorize usabilidade, simplicidade e baixo custo operacional
- Sempre utilize as cores e logo da Terrah Homes
- Documente qualquer alteração relevante

## Suporte
- Dúvidas? Consulte os documentos ou entre em contato com o responsável técnico

**Bem-vindo ao time! Vamos juntos evoluir o Terrah Homes! 🚀** 