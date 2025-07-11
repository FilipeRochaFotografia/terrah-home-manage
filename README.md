# Terrah Homes | Tarefas Programadas

## Progresso recente

- Integração completa do cadastro de tarefas predefinidas com Supabase.
- Tabela `tarefas_predefinidas` criada com os campos: id (string), titulo, descricao, periodicidade, observacao.
- Modelos de tarefas cadastrados e buscados dinamicamente no frontend.
- Formulário de nova tarefa exibe apenas periodicidade, evitando duplicidade de informações.
- Interfaces TypeScript ajustadas para refletir o banco.
- Todos os erros de tipagem e fetch resolvidos.
- Modal de nova tarefa com UX aprimorada.

## Próximos passos

- Implementar upload de fotos por tarefa.
- Filtros e busca de tarefas.
- Notificações push.
- Relatórios e painel do gestor.
- Sincronização offline.
- Integração com Google Calendar.

---

## Configuração do Supabase

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=CHAVE_ANON_SUPABASE
```

Substitua pelos valores do seu projeto no painel do Supabase.

## Visão Geral
O aplicativo Terrah Homes Tarefas Programadas é uma solução digital para gestão, automação e acompanhamento de tarefas recorrentes e programadas de manutenção, limpeza e operação de imóveis. Foco em automação, controle de execução, anexos de fotos, notificações e relatórios para o gestor.

---

## Principais Funcionalidades
- Login por e-mail e senha (admin e funcionários)
- Cadastro e gestão de imóveis (apenas admin)
- Criação automática e manual de tarefas programadas
- Status de tarefas: Em aberto, Concluída, Pausada
- Conclusão exige upload de até 5 fotos
- Notificações push para todos os usuários
- Relatórios mensais para o gestor (painel web)
- Sincronização offline (leitura/atualização de status)
- Integração com Google Calendar
- Interface responsiva, mobile-first, com branding Terrah Homes

---

## Stack Sugerida
- **Frontend:** React + Vite (PWA), TailwindCSS, Shadcn/ui ou Material UI
- **Backend:** Firebase (Auth, Firestore, Storage, Messaging) ou Supabase
- **Push Notifications:** Firebase Cloud Messaging (FCM) ou alternativa Supabase
- **Offline:** IndexedDB/localStorage + sincronização automática
- **Relatórios:** Firestore queries + exportação CSV/PDF
- **Integração:** Google Calendar API

---

## Estrutura de Pastas (sugerida)
```
terrah-homes/
├── public/                # Assets estáticos (logo, ícones)
├── src/
│   ├── components/        # Componentes React reutilizáveis
│   ├── pages/             # Páginas principais
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitários, helpers
│   ├── contexts/          # Estado global
│   ├── styles/            # Estilos globais
│   └── ...
├── README_TERAHHOMES.md
├── PRD_TERAH_HOMES.md
├── package.json
└── ...
```

---

## Como Executar
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

**Projeto rodando em:** http://localhost:8080/

---

## Branding
- **Logo:** ![Logo Terrah Homes](./public/logo-terrahhomes.png)
- **Cores:** Azul turquesa e laranja
- **UI:** Clean, simples, fácil de usar

---

## Contato
- Dúvidas, sugestões ou suporte: [Seu e-mail ou canal de contato]

---

**Este README será atualizado conforme o projeto evolui.**

---

## 1. **Erro: `Property 'tipo_manutencao' does not exist on type 'TarefaPredefinida'`**

Seu código ainda está tentando acessar ou exibir o campo `tipo_manutencao` em algum lugar do componente (provavelmente ao renderizar a tarefa selecionada).

**Como corrigir:**
- **Remova** qualquer referência a `tipo_manutencao` no seu componente `TaskList.tsx` (e em qualquer outro lugar).
- Exemplo:  
  ```tsx
  {/* Remova ou comente esta linha se existir */}
  <span>{selectedTarefaPredefinida?.tipo_manutencao}</span>
  ```
- Se quiser mostrar algo, use apenas os campos que existem: `titulo`, `descricao`, `periodicidade`, `observacao`.

---

## 2. **Erro: `Property 'nome' does not exist on type ...`**

No seu `PropertyList.tsx`, você está usando um mock de propriedades com o campo `name`, mas a interface espera `nome`.

**Como corrigir:**
- Troque o campo `name` para `nome` no seu array `mockProperties`:
  ```js
  const mockProperties = [
    {
      id: "1",
      nome: "Prédio A - Residencial", // <-- troque name por nome
      ...
    },
    ...
  ];
  ```

---

## 3. **As tarefas ainda não aparecem**

Esses erros de tipagem podem impedir o React de renderizar corretamente o componente.  
**Assim que corrigir os dois pontos acima, o dropdown de tarefas predefinidas deve funcionar normalmente!**

---

### **Resumo do que fazer:**
1. Remova todas as referências a `tipo_manutencao` do frontend.
2. Troque `name` por `nome` no mock de propriedades.
3. Salve e recarregue o frontend.

Se ainda não aparecer, me envie o trecho do JSX onde renderiza as informações da tarefa predefinida, que eu te mostro exatamente o que ajustar!
