# Instruções: Aplicação de Timeouts Seguros

## 📋 Visão Geral

Este documento contém instruções para substituir todos os `setTimeout` existentes pelo novo sistema de hooks seguros, evitando vazamentos de memória.

---

## 🛠️ Hooks Disponíveis

### 1. `useTimeout` - Para timeout único
```typescript
import { useTimeout } from '@/hooks/useTimeout';

const { set: setTimeout, clear: clearTimeout } = useTimeout();

// Usar em vez de setTimeout nativo
setTimeout(() => {
  console.log('Executado após 1 segundo');
}, 1000);
```

### 2. `useTimeouts` - Para múltiplos timeouts
```typescript
import { useTimeouts } from '@/hooks/useTimeout';

const { set, clear, clearAll } = useTimeouts();

// Para timeouts com identificação
set('navegacao', () => {
  // Navegar para outra tela
}, 100);

set('filtro', () => {
  // Aplicar filtro
}, 500);
```

---

## 🎯 Arquivos que Precisam de Correção

### **Prioridade ALTA**

#### 1. `src/components/Dashboard.tsx`
**Localizações encontradas:**
- Linha 343: `setTimeout(() => { /* navegação */ }, 100)`
- Linha 424: `setTimeout(() => { /* modal */ }, 100)` 
- Linha 443: `setTimeout(() => { /* modal */ }, 100)`
- Linha 704: `setTimeout(() => { /* modal */ }, 100)`
- Linha 722: `setTimeout(() => { /* modal */ }, 100)`

**Correção necessária:**
```typescript
// ANTES
setTimeout(() => {
  // ação
}, 100);

// DEPOIS
import { useTimeout } from '@/hooks/useTimeout';

const Dashboard = () => {
  const { set: setTimeoutSafe } = useTimeout();
  
  // Usar onde necessário
  setTimeoutSafe(() => {
    // ação
  }, 100);
};
```

#### 2. `src/components/PropertyList.tsx`
**Localizações encontradas:**
- Linha 407: `setTimeout(() => { /* navegação */ }, 100)`
- Linha 448: `setTimeout(() => { /* navegação */ }, 100)`

#### 3. `src/components/FuncionariosList.tsx`
**Localizações encontradas:**
- Linha 292: `setTimeout(() => { /* navegação */ }, 100)`

#### 4. `src/components/Header.tsx`
**Localizações encontradas:**
- Linha 361: `setTimeout(() => { /* modal */ }, 100)`

---

## 📝 Template de Correção

### Para componentes com timeout único:
```typescript
// 1. Importar o hook
import { useTimeout } from '@/hooks/useTimeout';

// 2. Usar no componente
const MyComponent = () => {
  const { set: setTimeoutSafe } = useTimeout();
  
  const handleAction = () => {
    setTimeoutSafe(() => {
      // Ação que precisa de delay
    }, delayMs);
  };
  
  return (/* JSX */);
};
```

### Para componentes com múltiplos timeouts:
```typescript
// 1. Importar o hook
import { useTimeouts } from '@/hooks/useTimeout';

// 2. Usar no componente
const MyComponent = () => {
  const { set, clear } = useTimeouts();
  
  const handleNavigation = () => {
    set('navigation', () => {
      // Navegar
    }, 100);
  };
  
  const handleModal = () => {
    set('modal', () => {
      // Abrir modal
    }, 100);
  };
  
  return (/* JSX */);
};
```

---

## ⚡ Roteiro de Implementação

### Fase 1: Dashboard.tsx (5 timeouts)
1. Importar `useTimeouts`
2. Substituir todos os 5 `setTimeout`
3. Usar chaves descritivas: 'navegacao-dashboard', 'modal-relatorio', etc.
4. Testar se não quebrou funcionalidade

### Fase 2: PropertyList.tsx (2 timeouts)
1. Importar `useTimeout` (são poucos)
2. Substituir os 2 `setTimeout`
3. Testar navegação

### Fase 3: FuncionariosList.tsx (1 timeout)
1. Importar `useTimeout`
2. Substituir o `setTimeout`
3. Testar navegação de tarefas

### Fase 4: Header.tsx (1 timeout)
1. Importar `useTimeout`
2. Substituir o `setTimeout`
3. Testar modal

---

## 🧪 Testes Após Implementação

### 1. **Teste de Vazamento**
- Abrir DevTools → Memory tab
- Navegar extensivamente pela aplicação (30+ clicks)
- Verificar se o heap size se mantém estável

### 2. **Teste de Funcionalidade**
- Todas as navegações com delay devem funcionar
- Modais devem abrir corretamente
- Filtros devem ser aplicados

### 3. **Teste de Cleanup**
- Navegar rapidamente entre páginas
- Verificar no console se não há erros de timeout
- Monitorar logs do Memory Monitor

---

## 📊 Benefícios Esperados

### Antes da Implementação:
- ❌ Timeouts órfãos acumulando
- ❌ Possíveis ações executando em componentes desmontados
- ❌ Uso crescente de memória

### Depois da Implementação:
- ✅ Cleanup automático de timeouts
- ✅ Proteção contra componentes desmontados
- ✅ Uso estável de memória
- ✅ Melhor performance geral

---

## 🚨 Avisos Importantes

1. **Não misturar** `setTimeout` nativo com os hooks seguros
2. **Sempre testar** após cada substituição
3. **Verificar** se a funcionalidade permanece intacta
4. **Monitorar** o console em desenvolvimento

---

*Instruções criadas em: Dezembro 2024*  
*Próximo passo: Implementar nos arquivos identificados* 