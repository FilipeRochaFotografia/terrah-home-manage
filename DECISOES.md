# DECISÕES TÉCNICAS – Terrah Homes | Tarefas Programadas

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