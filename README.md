# Terrah Homes - Sistema de Gestão de Tarefas

Sistema mobile-first para gestão de tarefas de manutenção, limpeza e operação dos imóveis da Terrah Homes.

## 🚀 **Quick Start**

### **Pré-requisitos**
- Node.js 18+ ou Bun
- Conta Supabase configurada
- Firebase Project (para notificações)

### **Instalação**

```bash
# Clone o repositório
git clone <repository-url>

# Instale dependências
npm install
# ou
bun install

# Configure variáveis de ambiente
cp .env.example .env

# Configure suas chaves Supabase no .env:
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Execute o projeto
npm run dev
# ou
bun dev
```

### **Configuração Supabase**

1. **Crie as tabelas necessárias** executando a migration em `supabase/migrations/`
2. **Configure RLS policies** (já incluídas na migration)
3. **Ative o Supabase Storage** para upload de fotos

### **Estrutura do Projeto**

```
src/
├── components/     # Componentes React
├── pages/         # Páginas principais
├── hooks/         # Custom hooks
├── lib/          # Utilitários e configurações
└── data/         # Dados de demonstração
```

## 📚 **Documentação**

Para informações detalhadas sobre o projeto:

- **[STATUS_PROJETO.md](STATUS_PROJETO.md)** - Status atual e funcionalidades
- **[PRD_TERAH_HOMES.md](PRD_TERAH_HOMES.md)** - Requirements e especificações
- **[ANALISE_FINAL_PROJETO.md](ANALISE_FINAL_PROJETO.md)** - Análise técnica completa
- **[CHECKLIST_MVP.md](CHECKLIST_MVP.md)** - Progresso de desenvolvimento

## 🛠️ **Tecnologias**

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (Auth, Database, Storage)
- **Notificações**: Firebase Cloud Messaging
- **Deployment**: Vercel (recomendado)

## 📱 **Sistema 95% Funcional**

O Terrah Homes está pronto para produção com todas as funcionalidades essenciais implementadas. Para detalhes completos, consulte [STATUS_PROJETO.md](STATUS_PROJETO.md).

---

**Desenvolvido para Terrah Homes | Mobile-First Design**
