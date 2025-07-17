# Diagnóstico: Travamento de Abas após Uso Prolongado

## 🚨 Problema Identificado

**Sintoma:** As abas param de responder após um tempo de uso, mas funcionam ao recarregar a página.

**Diagnóstico:** Vazamentos de memória (memory leaks) e acúmulo de recursos não limpos causando degradação progressiva da performance.

---

## 🔍 Causas Identificadas

### 1. **CRÍTICO - Interval sem Cleanup Dependente**
**Arquivo:** `src/components/Header.tsx` (linhas 82-86)
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    loadNotifications();
  }, 30000); // 30 segundos

  return () => clearInterval(interval);
}, [loadNotifications]); // 🚨 PROBLEMA: loadNotifications muda a cada render
```

**Problema:** Como `loadNotifications` tem dependências que mudam, este useEffect recria o interval constantemente, mas os intervals antigos podem não ser limpos adequadamente.

**Impacto:** Múltiplos intervals acumulando → consumo excessivo de CPU e memória.

### 2. **Event Listeners Acumulando**
**Arquivo:** `src/components/TaskList.tsx` (linhas 131-207)
```typescript
useEffect(() => {
  // 8 event listeners diferentes sendo adicionados
  window.addEventListener('openTaskModal', handleOpenTaskModal);
  window.addEventListener('setTaskColorFilter', handleSetTaskColorFilter);
  // ... mais 6 listeners

  return () => {
    // Cleanup existe, mas pode falhar se as funções mudarem
    window.removeEventListener('openTaskModal', handleOpenTaskModal);
    // ...
  };
}, []); // 🚨 Dependências vazias podem causar stale closures
```

**Problema:** Event listeners podem não ser removidos corretamente se as funções de callback mudarem devido a re-renders.

### 3. **Firebase Messaging Listeners**
**Arquivo:** `src/hooks/useNotifications.ts` (linhas 134-157)
```typescript
useEffect(() => {
  let unsubscribe: (() => void) | null = null;
  
  try {
    const messaging = getMessaging(app);
    unsubscribe = onMessage(messaging, (payload) => {
      toast({ /* ... */ });
    });
  } catch (error) {
    console.error('Erro ao configurar listener de mensagens:', error);
  }

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [isSupported, permission, toast]); // 🚨 toast muda constantemente
```

**Problema:** O hook `toast` é recriado a cada render, causando recriação do listener Firebase.

### 4. **Timeouts sem Referencias**
**Múltiplos arquivos:** Dashboard.tsx, PropertyList.tsx, FuncionariosList.tsx
```typescript
setTimeout(() => {
  // Ações diversas
}, 100);
```

**Problema:** Timeouts criados sem referência para cleanup em caso de unmount do componente.

### 5. **Toast System Memory Accumulation**
**Arquivo:** `src/hooks/use-toast.ts` (linhas 54-72)
```typescript
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
```

**Problema:** Map global que pode acumular timeouts órfãos se não limpos adequadamente.

---

## 🎯 Correções Prioritárias

### **Fase 1: Críticas (Implementar Imediatamente)**

#### 1.1 Corrigir Interval de Notificações
```typescript
// ANTES (Header.tsx)
useEffect(() => {
  const interval = setInterval(() => {
    loadNotifications();
  }, 30000);
  return () => clearInterval(interval);
}, [loadNotifications]); // ❌ Problemático

// DEPOIS
useEffect(() => {
  const interval = setInterval(() => {
    loadNotifications();
  }, 30000);
  return () => clearInterval(interval);
}, []); // ✅ Dependências fixas
```

#### 1.2 Estabilizar Event Listeners
```typescript
// Usar useCallback para estabilizar as funções
const handleOpenTaskModal = useCallback(() => {
  openForm();
}, []);

const handleSetTaskColorFilter = useCallback((e: Event) => {
  const event = e as SetTaskColorFilterEvent;
  if (event.detail) setColorFilter(event.detail);
}, []);
```

#### 1.3 Corrigir Firebase Listener
```typescript
// Criar um toast estável
const stableToast = useCallback((options: any) => {
  toast(options);
}, []);

useEffect(() => {
  if (!isSupported || permission !== 'granted') return;
  // ... resto do código
}, [isSupported, permission, stableToast]); // ✅ Dependência estável
```

### **Fase 2: Preventivas**

#### 2.1 Timeout Cleanup Universal
```typescript
// Hook personalizado para timeouts seguros
const useTimeout = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const set = useCallback(() => {
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);
  
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
  
  useEffect(() => {
    return clear; // Cleanup automático
  }, [clear]);
  
  return { set, clear };
};
```

#### 2.2 Memory Monitoring
```typescript
// Adicionar logs de monitoramento
useEffect(() => {
  const logMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory Usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
      });
    }
  };
  
  const interval = setInterval(logMemory, 60000); // Log a cada minuto
  return () => clearInterval(interval);
}, []);
```

---

## ⚡ Implementação Imediata

### Prioridade 1: Header.tsx (Interval Fix)
- Remover dependência `loadNotifications` do useEffect
- Criar função estável para notificações

### Prioridade 2: TaskList.tsx (Event Listeners)
- Usar useCallback para todas as funções de evento
- Verificar se cleanup está funcionando

### Prioridade 3: useNotifications.ts (Firebase)
- Estabilizar dependência do toast
- Adicionar logs de debug para monitoring

---

## 📊 Monitoramento Pós-Correção

### Métricas a Acompanhar:
1. **Uso de Memória:** Deve se manter estável após uso prolongado
2. **Event Listeners:** Não deve acumular no DOM
3. **Timers Ativos:** Não deve crescer indefinidamente
4. **Performance:** Responsividade deve se manter constante

### Ferramentas de Debug:
- Chrome DevTools → Performance tab
- Memory tab para heap snapshots
- Console.log estratégico nos cleanups

---

## 🎯 Resultado Esperado

Após as correções:
- ✅ Abas mantêm responsividade após uso prolongado
- ✅ Uso de memória estável
- ✅ Sem acúmulo de listeners/timers
- ✅ Performance consistente

---

*Diagnóstico realizado em: Dezembro 2024*  
*Status: CRÍTICO - Implementação Imediata Necessária* 