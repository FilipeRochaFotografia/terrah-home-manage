import { useEffect } from 'react';

interface MemoryInfo {
  used: number;
  total: number;
  limit: number;
}

/**
 * Hook para monitoramento de memória em desenvolvimento
 * Ajuda a identificar vazamentos de memória
 */
export const useMemoryMonitor = (enabled: boolean = false, intervalMs: number = 60000) => {
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') {
      return;
    }

    const logMemory = () => {
      // Verificar se a API de memory está disponível (apenas Chrome)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryInfo: MemoryInfo = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
        };

        console.group('🧠 Memory Monitor');
        console.log(`Used: ${memoryInfo.used}MB`);
        console.log(`Total: ${memoryInfo.total}MB`);
        console.log(`Limit: ${memoryInfo.limit}MB`);
        console.log(`Usage: ${Math.round((memoryInfo.used / memoryInfo.limit) * 100)}%`);
        
        // Alerta se o uso de memória estiver alto
        if (memoryInfo.used > memoryInfo.limit * 0.8) {
          console.warn('⚠️ High memory usage detected!');
        }
        
        console.groupEnd();
      } else {
        console.log('Memory API not available (use Chrome for memory monitoring)');
      }

      // Log de listeners de evento no window
      if ('getEventListeners' in window) {
        const listeners = (window as any).getEventListeners(window);
        if (Object.keys(listeners).length > 0) {
          console.group('🎧 Event Listeners');
          Object.entries(listeners).forEach(([event, listenerArray]) => {
            console.log(`${event}: ${(listenerArray as any[]).length} listeners`);
          });
          console.groupEnd();
        }
      }
    };

    // Log inicial
    console.log('🔍 Memory Monitor started');
    logMemory();

    // Configurar interval
    const interval = setInterval(logMemory, intervalMs);

    return () => {
      clearInterval(interval);
      console.log('🔍 Memory Monitor stopped');
    };
  }, [enabled, intervalMs]);
};

/**
 * Hook para detectar vazamentos de memória
 * Compara o uso de memória ao longo do tempo
 */
export const useMemoryLeakDetector = (enabled: boolean = false) => {
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development' || !('memory' in performance)) {
      return;
    }

    let memoryReadings: number[] = [];
    let consecutiveIncreases = 0;

    const checkMemoryLeak = () => {
      const memory = (performance as any).memory;
      const currentUsage = memory.usedJSHeapSize / 1048576; // MB
      
      memoryReadings.push(currentUsage);
      
      // Manter apenas as últimas 10 leituras
      if (memoryReadings.length > 10) {
        memoryReadings = memoryReadings.slice(-10);
      }

      // Verificar se há aumentos consecutivos
      if (memoryReadings.length >= 2) {
        const lastReading = memoryReadings[memoryReadings.length - 1];
        const secondLastReading = memoryReadings[memoryReadings.length - 2];
        
        if (lastReading > secondLastReading + 5) { // Aumento de mais de 5MB
          consecutiveIncreases++;
        } else {
          consecutiveIncreases = 0;
        }

        // Alerta se houver 3 aumentos consecutivos significativos
        if (consecutiveIncreases >= 3) {
          console.error('🚨 MEMORY LEAK DETECTED!');
          console.error('Memory usage has been increasing consistently:');
          console.error(memoryReadings.map((reading, index) => 
            `Reading ${index + 1}: ${reading.toFixed(2)}MB`
          ).join('\n'));
          
          // Reset contador para evitar spam de alertas
          consecutiveIncreases = 0;
        }
      }
    };

    const interval = setInterval(checkMemoryLeak, 30000); // Check a cada 30 segundos

    return () => {
      clearInterval(interval);
    };
  }, [enabled]);
}; 