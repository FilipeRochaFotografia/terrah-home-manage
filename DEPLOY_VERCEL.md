# Guia de Deploy na Vercel

Este guia fornece as instruções passo a passo para fazer o deploy do projeto Terrah Homes na Vercel.

---

## 1. Preparando o Projeto

### a. Verifique o `package.json`
Garanta que o script `build` esteja configurado corretamente:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
}
```

### b. Crie um Repositório no GitHub (ou similar)
A Vercel se integra melhor com repositórios Git. Se o seu projeto ainda não está em um, crie um no GitHub, GitLab ou Bitbucket e envie seu código.

---

## 2. Configurando o Projeto na Vercel

### a. Crie uma Nova Conta na Vercel
- Acesse [vercel.com](https://vercel.com/) e crie uma conta (você pode usar sua conta do GitHub para facilitar).

### b. Importe o Projeto
- No seu dashboard da Vercel, clique em **"Add New... > Project"**.
- Importe o repositório Git que você preparou.

### c. Configure o Projeto
- **Framework Preset:** A Vercel deve detectar automaticamente que é um projeto **Vite**.
- **Build and Output Settings:** Normalmente, as configurações padrão funcionam.
    - **Build Command:** `npm run build` ou `yarn build`
    - **Output Directory:** `dist`
- **Install Command:** `npm install` ou `yarn`

---

## 3. Configurando as Variáveis de Ambiente

Esta é a etapa mais importante para conectar seu frontend ao Supabase e Firebase.

### a. Acesse seu Projeto no Supabase
- Faça login em [app.supabase.com](https://app.supabase.com/).
- Navegue até o seu projeto Terrah Homes.

### b. Encontre as Variáveis de Ambiente
- No painel do Supabase, vá para **Project Settings** (ícone de engrenagem).
- **API:** Aqui você encontrará as chaves necessárias.
- **Database:** Vá para a seção "Database" e depois "Connection string" para obter as informações do banco, se necessário (geralmente não é preciso para o frontend).

### c. Adicione as Variáveis na Vercel
- Na tela de configuração do seu projeto na Vercel, expanda a seção **Environment Variables**.
- Adicione as seguintes variáveis:

| Nome da Variável               | Como Encontrar no Supabase                                       | Exemplo                                        |
| ------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------- |
| `VITE_SUPABASE_URL`            | **Project Settings > API > Project URL**                         | `https://xyz.supabase.co`                      |
| `VITE_SUPABASE_ANON_KEY`       | **Project Settings > API > Project API Keys > `anon` `public`**  | `ey...` (a chave pública e anônima)            |
| `VITE_FIREBASE_VAPID_KEY`      | Você deve ter essa chave do seu projeto Firebase (Cloud Messaging) | `BI...` (chave longa)                          |
| `FIREBASE_SERVICE_ACCOUNT_JSON`| Chave de serviço JSON do seu projeto Firebase (para a Edge Function) | Cole o conteúdo completo do arquivo JSON aqui  |

**⚠️ Importante:**
- Marque a caixa para incluir as variáveis durante o processo de *build*.
- Use o prefixo `VITE_` para as variáveis que precisam ser expostas ao *frontend* (URL e chave anônima).

---

## 4. Faça o Deploy

- Após configurar as variáveis, clique no botão **"Deploy"**.
- A Vercel iniciará o processo de *build* e, se tudo estiver correto, o site estará no ar em poucos minutos.
- Você receberá uma URL para acessar a aplicação (ex: `terrah-homes.vercel.app`).

---

## 5. Pós-Deploy: Solução de Problemas

### a. Erros no Build
- Verifique o log de *build* na Vercel para identificar o problema. Causas comuns são dependências faltando ou erros de TypeScript.

### b. Aplicação Não Carrega (Erro 500 ou Tela Branca)
- A causa mais provável é uma variável de ambiente ausente ou incorreta.
- Vá para **Project Settings > Environment Variables** na Vercel e revise todas as chaves.
- Verifique os logs em tempo de execução (**Runtime Logs**) na Vercel para ver erros do lado do servidor (Edge Functions).

### c. Problema de Inatividade Persiste
- Lembre ao seu cliente que, como discutido no `PROBLEMAS_CONHECIDOS.md`, esta é uma limitação da infraestrutura de desenvolvimento e será resolvida na versão de produção.

---

*Última atualização: Dezembro 2024* 