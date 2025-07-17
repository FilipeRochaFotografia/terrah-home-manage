import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar timeouts de forma segura
 * Evita vazamentos de memória limpando automaticamente timeouts
 * quando o componente é desmontado
 */
export const useTimeout = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const set = useCallback((callback: () => void, delay: number) => {
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(callback, delay);
    return timeoutRef.current;
  }, []);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup automático quando o componente é desmontado
  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return { set, clear };
};

/**
 * Hook para múltiplos timeouts
 * Útil quando você precisa gerenciar vários timeouts independentes
 */
export const useTimeouts = () => {
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const set = useCallback((key: string, callback: () => void, delay: number) => {
    // Limpar timeout anterior com essa chave se existir
    const existingTimeout = timeoutsRef.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    const timeout = setTimeout(() => {
      // Remover da map quando executar
      timeoutsRef.current.delete(key);
      callback();
    }, delay);
    
    timeoutsRef.current.set(key, timeout);
    return timeout;
  }, []);

  const clear = useCallback((key: string) => {
    const timeout = timeoutsRef.current.get(key);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(key);
    }
  }, []);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    timeoutsRef.current.clear();
  }, []);

  // Cleanup automático quando o componente é desmontado
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  return { set, clear, clearAll };
}; 