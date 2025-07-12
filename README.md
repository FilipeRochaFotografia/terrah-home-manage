# Terrah Homes - Sistema de Gestão de Tarefas

Sistema mobile-first para gestão de tarefas de manutenção, limpeza e operação dos imóveis da Terrah Homes.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Autenticação**: Login/logout com Supabase Auth
- **Gestão de Imóveis**: CRUD completo com categorização (residencial/comercial) e status
- **Sistema de Tarefas**: CRUD completo com tarefas predefinidas dinâmicas
- **Dashboard**: Visão geral com estatísticas em tempo real e cards interativos
- **Gestão de Funcionários**: CRUD básico com atribuição de tarefas
- **Notificações**: Sistema local com badge em tempo real e persistência
- **Filtros e Busca**: Por status, prioridade, cor e imóvel
- **Interface Mobile-First**: Design responsivo com animações e branding consistente
- **Upload de Fotos**: Preview no modal de conclusão de tarefas
- **Modais Otimizados**: Conclusão e edição com UX melhorada
- **Cards de Tarefa**: Interface limpa com botões integrados

### 🔄 Em Desenvolvimento
- **Upload de Fotos**: Integração completa com listagem de tarefas
- **Notificações Push**: Para mobile e web
- **Painel de Relatórios**: Com exportação e gráficos
- **Sincronização Offline**: Para uso sem internet

### 📋 Planejadas
- **Integração Google Calendar**
- **Histórico de Alterações**
- **Testes de Acessibilidade**
- **Documentação Visual**

## 🛠️ Tecnologias

- **Frontend**: React, Vite, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase (Auth, Database, Storage)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📱 Características Mobile-First

- Design responsivo otimizado para dispositivos móveis
- Navegação intuitiva com bottom navigation
- Modais com padding lateral no mobile
- Cards e componentes touch-friendly
- Animações suaves e feedback visual

## 🎨 Branding

- **Cores**: Azul turquesa (#00B4D8) e laranja (#FF6B35)
- **Logo**: Terrah Homes
- **Gradientes**: Efeitos visuais modernos
- **Tipografia**: Clean e legível

## 🚀 Como Executar

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd terrah-home-manage
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
- Crie um projeto no [Supabase](https://supabase.com)
- Configure as variáveis de ambiente no arquivo `.env`
- Execute os scripts SQL para criar as tabelas

4. **Execute o projeto**
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:8080`

## 📊 Status do Projeto

**Progresso Geral: 75% Concluído**

- ✅ Funcionalidades Core: 100%
- ✅ Melhorias de UX/UI: 85%
- 🔄 Funcionalidades Avançadas: 45%
- 🔄 Documentação: 20%
- 🔄 Testes: 10%

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── TaskList.tsx    # Lista de tarefas
│   ├── PropertyList.tsx # Lista de imóveis
│   ├── FuncionariosList.tsx # Lista de funcionários
│   ├── Header.tsx      # Header com navegação
│   └── BottomNav.tsx   # Navegação inferior
├── pages/              # Páginas principais
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
└── data/               # Dados estáticos
```

## 🔧 Configuração do Supabase

### Tabelas Necessárias

1. **imoveis**: Gestão de propriedades
2. **tarefas**: Tarefas e demandas
3. **tarefas_predefinidas**: Modelos de tarefas
4. **funcionarios**: Equipe e responsáveis
5. **usuarios**: Autenticação e permissões

### Storage Buckets

- **fotos-tarefas**: Para upload de fotos das tarefas

## 📝 Changelog

### [2024-07-12] - Melhorias de UX/UI
- ✅ Modal de conclusão com select de funcionários
- ✅ Upload de fotos com preview no modal de conclusão
- ✅ Modal de conclusão com padding lateral no mobile
- ✅ Modal de edição com campos preenchidos automaticamente
- ✅ Modal de edição com tamanho reduzido
- ✅ Componente TaskCard refatorado com props editButton e className
- ✅ Botão de editar movido para dentro do card de tarefa
- ✅ Botão de excluir mantido apenas no modal de edição
- ✅ Interface visual mais limpa e consistente nos cards

### [2024-07-12] - Correções e Melhorias
- ✅ Conclusão de tarefas usa sempre a data atual
- ✅ Tarefas concluídas com borda azul (turquesa)
- ✅ Filtro de tarefas por imóvel integrado à navegação
- ✅ Correção do erro PATCH 400 ao concluir tarefas
- ✅ Cards de tarefas concluídas mostram responsável e anotações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

Terrah Homes - [contato@terrahhomes.com](mailto:contato@terrahhomes.com)

---

**Desenvolvido com ❤️ para a Terrah Homes**
