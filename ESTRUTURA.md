# ESTRUTURA – Terrah Homes | Tarefas Programadas

## Organização de Pastas

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
├── README.md
├── PRD_TERAH_HOMES.md
├── PENDENCIAS.md
├── ESTRTURA.md
├── ONBOARDING.md
├── DECISOES.md
├── CONTEXTO.md
├── package.json
└── ...
```

## Fluxos Principais
- Login e autenticação de usuários
- CRUD de imóveis (admin)
- Criação automática e manual de tarefas
- Upload de fotos (até 5 por tarefa)
- Notificações push
- Relatórios para gestor
- Sincronização offline
- Integração com Google Calendar

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