# Relatório de Problemas Conhecidos e Próximos Passos

Este documento detalha os problemas persistentes no projeto, as tentativas de correção e um plano para a resolução definitiva.

---

## 🚨 Problema Principal: Tela Branca Após Inatividade

### Sintoma
- **Cenário:** O usuário abre a aplicação, navega normalmente, muda para outra aba ou programa e, após um minuto ou mais de inatividade, retorna à aba da aplicação.
- **Comportamento:** A aplicação exibe uma tela de carregamento (esqueleto) ou uma tela branca e não consegue mais carregar os dados, travando nesse estado.
- **Observação:** O problema não ocorre durante o uso contínuo, apenas após um período de inatividade da aba.

### Diagnóstico Mais Provável
- **Causa Raiz:** O *backend* do Supabase, operando na categoria gratuita (*free tier*), entra em um **modo de "sleep" (ociosidade)** para economizar recursos.
- **Falha na Reconexão:** Ao retornar à aba, o *frontend* tenta imediatamente buscar os dados necessários para renderizar a página (ex: `Dashboard.tsx`). No entanto, a primeira requisição falha porque o *backend* ainda está "acordando" e não responde a tempo.
- **Efeito Cascata:** A falha na consulta inicial impede a renderização completa dos componentes, resultando na tela branca ou no carregamento infinito, mesmo com as tentativas de reconexão do React Query.

### Tentativas de Correção Realizadas
1.  **Aumento de Timeout:** Aumentamos o tempo limite da verificação do *storage* para 15 segundos. Não resolveu, pois o problema afeta todas as requisições iniciais, não apenas o *storage*.
2.  **Remoção da Verificação de Storage:** Removemos a verificação proativa (`checkStorageHealth`), o que limpou o código mas não resolveu a causa raiz.
3.  **Tratamento de Erro no Dashboard:** Implementamos um estado de erro e uma tela de "Tentar Novamente". No entanto, o erro parece ocorrer em um nível que impede até mesmo a renderização dessa tela de erro.
4.  **Resiliência do React Query:** Configuramos o `QueryClient` para tentar novamente as consultas (`retry: 2`) e revalidar ao focar na janela (`refetchOnWindowFocus: true`). Isso não foi suficiente para contornar o *timeout* inicial do *backend* "adormecido".

---

## 🎯 Plano de Ação Pós-Apresentação

A solução definitiva exigirá uma abordagem mais robusta para lidar com a "reanimação" do *backend*.

### Fase 1: Gerenciamento de Conexão no Frontend
- **1. Criar um "Health Check" Manual:**
    - Antes de renderizar a aplicação principal, faremos uma chamada leve e repetida a um *endpoint* simples do Supabase (ex: buscar a versão).
    - A aplicação só será renderizada após receber uma resposta bem-sucedida, garantindo que o *backend* esteja totalmente "acordado".
    - Isso pode ser feito com uma tela de "Conectando..." antes do `Dashboard`.

- **2. Aprimorar o Provedor de Dados (`DataContext`):**
    - Mover a lógica de busca de dados iniciais (imóveis, funcionários) para o `DataContext`.
    - Implementar a lógica de "Health Check" dentro deste provedor, para que nenhum componente filho seja renderizado antes que a conexão seja confirmada.

### Fase 2: Otimizações de Backend (Se necessário)
- **1. Considerar um "Warm-up" via Cron Job:**
    - Configurar um serviço externo (como [Cron-Job.org](https://cron-job.org/en/)) para fazer uma requisição à API do Supabase a cada 15-20 minutos.
    - Isso manteria o *backend* "aquecido" e evitaria que ele entrasse em modo de ociosidade.
    - **Desvantagem:** É uma solução paliativa e depende de um serviço de terceiros.

- **2. Upgrade do Plano do Supabase:**
    - A solução mais garantida é fazer o upgrade do projeto Supabase para um plano pago que ofereça a funcionalidade "Always On" (Sempre Ativo).
    - Isso elimina completamente o problema de ociosidade e é a prática recomendada para aplicações em produção.

---

## ✅ Resumo para o Cliente

- **O que está acontecendo?** "A aplicação está hospedada em uma infraestrutura de desenvolvimento que entra em modo de economia de energia após um período de inatividade. Estamos trabalhando para tornar a reconexão mais transparente para o usuário."
- **Próximos Passos:** "Vamos implementar um sistema de verificação de conexão mais inteligente e, para a versão de produção, moveremos a aplicação para uma infraestrutura dedicada que não possui esse modo de economia de energia." 